/**
* Converts an HSV color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSV_color_space.
* Assumes h, s, and v are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param		Number	h	The hue
* @param		Number	s	The saturation
* @param		Number	v	The value
* @return	Array			The RGB representation
*/
function hsvToRgb(h, s, v) {
	var r, g, b;

	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch(i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return [r * 255, g * 255, b * 255];
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var golden_ratio_conjugate = 0.618033988749895;
var s_value = 0.02;
var v_value = 0.95;


var elements = document.querySelectorAll('section');
Array.prototype.forEach.call(elements, function(el, i){
	var h_value = (Math.random() + golden_ratio_conjugate) % 1;
	var result = hsvToRgb(h_value, s_value, v_value);

	el.setAttribute('data-background', rgbToHex(Math.round(result[0]), Math.round(result[1]), Math.round(result[2])));
});