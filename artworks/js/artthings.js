/* General Functions */

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
	return uuid.toLowerCase();
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

/* MQTT */

function sendmqtt(topic, packet) {
	var message = new Paho.MQTT.Message(JSON.stringify(packet));
	message.destinationName = topic;
	client.send(message);
	console.log("MQTT: sent "+topic);
	state.packetsout++;
}

/* Hex Conversion */

function hexToDec(hex) { // Expects Two Hex Digits
	var result = 0;
	hex = hex.toUpperCase();
	var digit1 = '0123456789ABCDEF'.indexOf(hex[0]);
	var digit2 = '0123456789ABCDEF'.indexOf(hex[1]);
	result = digit1*16 + digit2;
	return result;
}

function decToHex(dec) { // Returns Two Hex Digits
  var result = "00";
  var digits = '0123456789ABCDEF';
  var digit1 = digits.substr(Math.floor(dec/16),1);
  var digit2 = digits.substr(dec-(Math.floor(dec/16)*16),1);
  result = digit1+digit2;
  return result;
}
