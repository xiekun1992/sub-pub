/**
 * a color parser tool to convert color between hex, rgb and hsl
 * use rgb as a bridge to convert hex to hsl and hsl to hex
 */
function ColorParser(){
	'use strict';
	
	var table = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

	var parseHexToRgb=function(value){
		var hex;
		var valueCharArray = value.split('');
		for(var i = 0;i < valueCharArray.length;i++){
			if(table.indexOf(valueCharArray[i]) == -1){
				throw new TypeError('invalid hex value.');
			}
		}
		if(value.length == 3){
			hex = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
		}else{
			hex = value;
		}
		var red = table.indexOf(hex[0]) * 16 + table.indexOf(hex[1]) * 1,
			green = table.indexOf(hex[2]) * 16 + table.indexOf(hex[3]) * 1,
			blue = table.indexOf(hex[4]) * 16 + table.indexOf(hex[5]) * 1;
		return 'rgb(' + red + ', ' + green + ', ' + blue+')';
	};

	var parseRgbToHex=function(){
		var hex='#';
		var rgb = checkRgbValue.apply(null, arguments);
		for(var i =0;i<rgb.length;i++){
			var rgbNumber=rgb[i];
			hex += table[(rgbNumber / 16) & ~0] + '' + table[rgbNumber % 16];//rgbNumber.toString(16); error: 0 => '0' instead of '00'
		}
		return hex;
	};

	var parseRgbToHsl=function(){
		var rgb = [].slice.call(arguments);
		var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var h, s, l;
		// calculate h, 0 <= h < 360
		switch(max){
			case min: h = 0;break;
			case r: 
				if(g>=b){
					h = 60 * (g - b) / (max - min);
				}else{
					h = 60 * (g - b) / (max - min) + 360;
				}
				break;
			case g: h = 60 * (b - r) / (max - min) + 120;break;
			case b: h = 60 * (r - g) / (max - min) + 240;break;
		}
		// calculate l, 0 <= l <= 1
		l = (max + min) / 2;
		// l = l / 255 ;
		// calculate s, 0 <= s <= 1
		if(l == 0 || max == min){
			s = 0;
		}else if(l > 1 / 2){// l > 1/2
			s = (max - min) / (2 - (max + min));
		}else{// 0 < l <= 1/2, it's obvious that l is greater than 0
			s = (max - min) / (max + min);
		}
		return 'hsl(' + Math.round(h) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)';
	};

	var checkRgbValue=function(){
		var rgbArray=[].slice.call(arguments, 0, 3), rgbValue=[];
		for(var i = 0;i < 3;i++){
			if(typeof rgbArray[i] !== 'number' || (rgbArray[i] & ~0) !== rgbArray[i]){
				throw new TypeError('invalid rgb value.');
			}
			var rgbNumber = parseInt(rgbArray[i]);
			if(rgbNumber < 0 || rgbNumber > 255){
				throw new Error('rgb value should between 0 and 255.');
			}else{
				rgbValue.push(rgbNumber);
			}
		}
		return rgbValue;
	};

	var extractRgbValue=function(rgbString){
		var res = /^rgb\((\d+),\s?(\d+),\s?(\d+)\)$/i.exec(rgbString);
		return [parseInt(res[1]), parseInt(res[2]), parseInt(res[3])];
	};

	ColorParser.prototype.hexToRgb=function(hex){
		var rgb;
		if(typeof hex !== 'string'){
			throw new TypeError('hexToRgb parameter must be a string.');
		}
		if(hex.length === 0){
			throw new Error('hexToRgb should be call like hexToRgb("#fff").');
		}
		if(hex.charAt(0) !== '#'){//fff,ffffff
			if(hex.length !== 3 && hex.length !== 6){
				throw new TypeError('invalid hex value.');
			}else{
				rgb = parseHexToRgb(hex.toLowerCase());
			}
		}else{
			if(hex.length !== 4 && hex.length !== 7){
				throw new TypeError('invalid hex value.');
			}else{
				rgb = parseHexToRgb(hex.slice(1).toLowerCase());
			}
		}

		return rgb;
	};

	ColorParser.prototype.rgbToHex=function(){
		return parseRgbToHex.apply(null, checkRgbValue.apply(null, arguments));
	};

	ColorParser.prototype.rgbToHsl=function(){
		return parseRgbToHsl.apply(null, checkRgbValue.apply(null, arguments));
	};

	ColorParser.prototype.hslToRgb=function(){
		var params=[].slice.call(arguments);
		if(params.length > 0){
			for(var i = 0;i<params.length;i++){
				if(typeof params[i] !== 'number' || params[i] !== params[i]){
					throw new TypeError('invalid hsl value.');
				}
			}
			var h = parseFloat(params[0]) / 360, s = parseFloat(params[1]) / 100, l = parseFloat(params[2]) / 100, r, g, b;

			if(!(h >= 0 && h < 1 && s >= 0 && s <= 1 && l >= 0 && l <= 1)){
				throw new TypeError('invalid hsl value.');
			}
			if(s == 0){
				r = g = b = l;
			}else{
				var q, p, h, tr, tg, tb;
				if(l < 1/2){
					q = l * (1 + s);
				}else{
					q = l + s - (l * s);
				}
				p = 2 * l - q;
				tr = (3 * h + 1)/3;
				tg = h;
				tb = (3 * h - 1)/3;

				var rgb = [tr, tg, tb];

				for(var i = 0;i < rgb.length;i++){
					if(rgb[i] < 0){
						rgb[i] += 1;
					}else if(rgb[i] > 1){
						rgb[i] -= 1;
					}

					if(rgb[i] * 6 < 1){
						rgb[i] = p + ((q - p) * 6 * rgb[i]);
					}else if(rgb[i] < 1/2){
						rgb[i] = q;
					}else if(rgb[i] * 3 < 2){
						rgb[i] = p + ((q - p) * 6 * (2/3 - rgb[i]));
					}else{
						rgb[i] = p;
					}
				}
				r = rgb[0];
				g = rgb[1];
				b = rgb[2];
			}
		}else{
			throw new Error('hslToRgb should be called like hslToRgb(h, s, l).');
		}
		return 'rgb(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' + Math.round(b * 255) + ')';
	};

	ColorParser.prototype.hexToHsl=function(){
		return this.rgbToHsl.apply(null, extractRgbValue(this.hexToRgb.apply(this, arguments)));
	};

	ColorParser.prototype.hslToHex=function(){
		return this.rgbToHex.apply(null, extractRgbValue(this.hslToRgb.apply(this, arguments)));
	};
}