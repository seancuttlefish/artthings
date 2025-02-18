/*
A collection of useful functions for art.systems
http://art.systems
*/

function generateUUID() {
	var d = new Date().getTime();
	if (window.performance && typeof window.performance.now === "function") {
		d += performance.now(); //use high-precision timer if available
	}
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid.toUpperCase();
}
function validUUID(uuid) {
	if (uuid === null) {
		return false;
	}
	//if (uuid.match("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
	//	return true;
	//}
	else {
		return true;
	}
}

function getParameterByName(name,url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getObjectProperty(obj,prop,defaultval) {
	if (typeof obj[prop] === 'undefined') return defaultval;
	return obj[prop];
}

/*******************/
/* Cookie handling */
/*******************/

function setCookie(c_name,value,exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

/***********************/
/* Colour Manipulation */
/***********************/

function getColour(palette) {
	switch(palette) {
		case 1:
			var colour = "hsl(0,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 2:
			var colour = "hsl(12,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 3:
			var colour = "hsl(24,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 4:
			var colour = "hsl(36,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 5:
			var colour = "hsl(48,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 6:
			var colour = "hsl(60,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 7:
			var colour = "hsl(72,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 8:
			var colour = "hsl(84,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 9:
			var colour = "hsl(96,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 10:
			var colour = "hsl(108,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 11:
			var colour = "hsl(120,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 12:
			var colour = "hsl(132,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 13:
			var colour = "hsl(144,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 14:
			var colour = "hsl(156,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 15:
			var colour = "hsl(168,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 16:
			var colour = "hsl(180,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 17:
			var colour = "hsl(192,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 18:
			var colour = "hsl(204,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 19:
			var colour = "hsl(216,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 20:
			var colour = "hsl(228,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 21:
			var colour = "hsl(240,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 22:
			var colour = "hsl(252,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 23:
			var colour = "hsl(264,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 24:
			var colour = "hsl(276,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 25:
			var colour = "hsl(288,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 26:
			var colour = "hsl(300,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 27:
			var colour = "hsl(312,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 28:
			var colour = "hsl(324,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 29:
			var colour = "hsl(336,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		case 30:
			var colour = "hsl(348,"+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
			break;
		default:
			var colour = "hsl("+Math.floor(Math.random()*360)+","+Math.floor((Math.random()*50)+30)+"%,"+Math.floor((Math.random()*50)+30)+"%)";
	}
	console.log("Get Colour: "+palette+" "+colour);
	return colour;
}

function artsysRgbToH(red, green, blue) {
	h = 0;
	if (blue > green) {
		h = 330;
	}
	if (green > blue) {
		h = 30;
	}
	if (green > red) {
		h = 120;
		if (blue > red) {
			h = 150;
		}
		if (red > blue) {
			h = 90;
		}
	}
	if ((blue > red) && (blue > green)) {
		h = 240;
		if (green > red) {
			h = 270;
		}
		if (red > green) {
			h = 210;
		}
	}
    return h;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}