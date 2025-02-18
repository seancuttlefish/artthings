/*********************/
/* Snowflake Creator */
/*********************/

console.log("Snowflake Creator 0.4");
// To Do:
// - Remove duplicate pixels before sending?

//////////
// MQTT //
//////////

var mqttconnected = false;
var reconnectTimeout = 10000;
MQTTConnect();

function MQTTConnect() {
	console.log("Connecting..");
	$('#information').text("Connecting..");
	client = new Paho.MQTT.Client(SERVERHOST, SERVERPORT, "web_" + new Date().getTime());
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;
	client.connect({
		useSSL: useSSL,
		timeout: 10,
		onSuccess: onSuccess,
		onFailure: onFailure
	});
}

function onSuccess() {
	console.log("MQTT Connection Established " + SERVERHOST + ":" + SERVERPORT);
	$('#information').text("Connection Established");
	mqttconnected = true;
		// Subscribe to core topics
	client.subscribe(state.ecosystem + "/env/all/hello");
	client.subscribe(state.ecosystem + "/" + state.system + "/all/hello");
	client.subscribe(state.ecosystem + "/" + state.system + "/" + state.id + "/hello");
	// Send state
	sendmqtt(state.ecosystem + "/" + state.system + "/" + state.component + "/state", state);
}

function onFailure(response) {
	console.log("MQTT Unable to Connect");
	$('#information').text("Unable to Connect");
	mqttconnected = false;
	setTimeout(MQTTConnect(), reconnectTimeout);
}

function onConnectionLost(response) {
	console.log("MQTT Connection Lost");
	$('#information').text("Connection Lost");
	mqttconnected = false;
	setTimeout(MQTTConnect(), reconnectTimeout);
}

function onMessageArrived(message) {
	// ecology/system/component/event
	var topics = message.destinationName.split("/");
	var ecology = topics[0];
	var system = topics[1];
	var component = topics[2];
	var event = topics[3]; // hello

	var packet;
	var sourceid = "";
	var data = "";
	try {
		packet = JSON.parse(message.payloadString);
		sourceid = packet.sourceid;
		data = packet.data;
	}
	catch (e) {
		sourceid = component;
		data = message.payloadString;
	}
	switch (event) {
		case 'hello':
			state.uptime = Math.floor(new Date().getTime() / 1000) - state.ontime;
			sendmqtt(state.ecosystem + "/" + state.system + "/" + state.component + "/state", state);
			break
	}
	console.log("MQTT Message Received: " + message.destinationName);
	state.packetsin++;
	mqttconnected = true;
}

function sendmqtt(topic, packet) {
	var message = new Paho.MQTT.Message(JSON.stringify(packet));
	message.destinationName = topic;
	client.send(message);
	console.log("MQTT Message Sent "+topic);
	state.packetsout++;
}

//////////
// Game //
//////////

var bgcolour = '#da2128';
var drawcolour = '#ffffff';
var background;
var g, h;

var canvasArea;
var canvasw = 360;
var canvash = 440;
var titleTop = 0;
var gridTop = 40;
var gridLeft = 0;
var buttonTop = 400;

var gridSize = 1;
var pixelSize = 6;
var xoffset = 180;
var yoffset = 180;

var points = [];
var minpoints = 20;
var maxpoints = 200;

var isDown = false;

var titleSprite;
var clearSprite;
var shareSprite;
var shareLock;

var game = new Phaser.Game(canvasw, canvash, Phaser.CANVAS, 'phaser', {
	preload: preload,
	create: create,
	update: update
});

function preload()  {
	game.load.image('title', 'title.png');
	game.load.image('clear', 'clear.png');
	game.load.image('share', 'share.png');
	game.load.image('background','background-small.png');
}

function create() {
	titleSprite = game.add.sprite(0, 0, 'title');
	clearSprite = game.add.sprite(0, 400, 'clear');
	clearSprite.inputEnabled = true;
	clearSprite.events.onInputDown.add(clearHandler, this);
	clearSprite.alpha = 0.4;

	shareSprite = game.add.sprite(180, 400, 'share');
	shareSprite.inputEnabled = true;
	shareSprite.events.onInputDown.add(shareHandler, this);
	shareLock = true;
	shareSprite.alpha = 0.4;

	game.stage.backgroundColor = bgcolour;
	background = game.add.image(0, 145, 'background');
	background.alpha = 0.3;

	g = game.add.graphics(0, 40);
	g.lineStyle(4, 0xffffff);
	g.lineTo(360, 0);
	g.lineStyle(4, 0x999999);
	g.moveTo(0, 360);
	g.lineTo(minpoints/maxpoints*360, 360);
	g.lineStyle(4, 0xcccccc);
	g.lineTo(360, 360);

	game.input.mouse.capture = true;
	game.input.onDown.add(onDown, this);
	game.input.onUp.add(onUp, this);
	game.input.addMoveCallback(setPixel, this);

	canvasArea = game.make.bitmapData(360, 360);
	canvasArea.addToWorld(0, gridTop);
}

function update() {
	if (this.game.paused) {
		alert("Paused")
	}
}

function onDown(point) {
	isDown = true;
}

function onUp(point) {
	isDown = false;
}

function setPixel(point) {
	var x = Math.floor(point.x/gridSize)*gridSize;
	var y = Math.floor(point.y/gridSize)*gridSize;

	if (points.length > 0) {
		clearSprite.alpha = 1;
	}
	if (points.length > minpoints) {
		shareLock = false;
		shareSprite.alpha = 1;
	}
	if (points.length < maxpoints) {
		x = x-gridLeft-xoffset;
		y = y-gridTop-yoffset;
		if (isDown) {
			if (Math.sqrt(x*x+y*y) < 128) {
				points.push({x: x-52+xoffset, y: y-52+yoffset});
				for (var i=0; i<6; i++) {
					canvasArea.rect(x+xoffset, y+yoffset, pixelSize, pixelSize, drawcolour);
					canvasArea.rect(xoffset-x, yoffset+y, pixelSize, pixelSize, drawcolour);
					var newx = x*Math.cos(Math.PI/3)-y*Math.sin(Math.PI/3);
					var newy = y*Math.cos(Math.PI/3)+x*Math.sin(Math.PI/3);
					x = newx;
					y = newy;
				}
			}
			h = game.add.graphics(0, 400);
			h.lineStyle(4, 0xffffff);
			h.lineTo(points.length/maxpoints*360+1, 0);
		}
	}
}

function shareHandler() {
	if (!shareLock) {
		var pointshex = "";
		for (var i=0; i<points.length; i++) {
			if (points[i].x < 16) {
				pointshex+="0";
			}
			pointshex+=points[i].x.toString(16);
			if (points[i].y < 16) {
				pointshex+="0";
			}
			pointshex+=points[i].y.toString(16);
			console.log(points[i].x, points[i].x.toString(16), points[i].y, points[i].y.toString(16));
		}
		console.log(pointshex);
		var packet = {
			'sourceid': instanceid,
			'data': latitude+":"+longitude+":"+pointshex
		}
		sendmqtt(state.ecosystem + "/" + state.system + "/" + state.component + "/snowflake", packet);

		canvasArea.rect(0, 0, 360, 360, bgcolour);
		points = [];
		shareLock = true;
		shareSprite.alpha = 0.4;
		clearSprite.alpha = 0.4;

		game.world.bringToTop(background);
		game.world.bringToTop(g);
	}
}

function clearHandler() {
	if (points.length > 0) {
		canvasArea.rect(0, 0, 360, 360, bgcolour);
		points = [];
		shareLock = true;
		shareSprite.alpha = 0.4;
		clearSprite.alpha = 0.4;

		game.world.bringToTop(background);
		game.world.bringToTop(g);
	}
}
