/**************/
/* Pixel Wall */
/**************/

console.log("Pixel Wall 0.7");

//  Drawing Area
var canvas;
var canvasw;
var canvash;
var canvasGrid;
var canvasSprite;

// Sprites
var spriteCounter = 0;
var sprite = [];
var idleTimeout = 30000;

var idleSprite = "";
if (componentid == "ogl") {
	idleSprite = "16:16:0:.......................................22............22..22.........2.2222.2.......2.2.22.2.2......22.2..2.22.....2.22....22.2....2.22....22.2.....22.2..2.22......2.2.22.2.2.......2.2222.2.........22..22............22.......................................";
}

// Masks
var masks = [
	{theme: "space", mask: ".......................................22............22..22.........2.2222.2.......2.2.22.2.2......22.2..2.22.....2.22....22.2....2.22....22.2.....22.2..2.22......2.2.22.2.2.......2.2222.2.........22..22............22......................................."},
	{theme: "space", mask: "....................................................2..22..2.......2..2..2..2.........2..2..........222..222.......2...22...2......2...22...2.......222..222..........2..2.........2..2..2..2.......2..22..2...................................................."},
	{theme: "space", mask: ".....................................2....2.........2......2.......2..2..2..2.....2..2....2..2......2..22..2..........2..2............2..2..........2..22..2......2..2....2..2.....2..2..2..2.......2......2.........2....2....................................."},
	{theme: "space", mask: "........................................2..............2............2...2..2.........2.2..2...........2222........2.2.2..22.2......2.22..2.2.2........2222...........2..2.2.........2..2...2............2..............2........................................"},
	{theme: "space", mask: ".....................................................22..22.........2.2.22.2.......2.2.2..2.2......22.2..2.22.......2..22.2..........2.22..2.......22.2..2.22......2.2..2.2.2.......2.22.2.2.........22..22....................................................."},
	{theme: "space", mask: "....................................................22....22.......22......22......2.2....2.2.........2..2.............22..............22.............2..2.........2.2....2.2......22......22.......22....22...................................................."},
	{theme: "space", mask: "...................................................2...22...2.......2......2.........2.22.2...........2..2.........2.2.22.2.2......2.2.22.2.2.........2..2...........2.22.2.........2......2.......2...22...2..................................................."},
	{theme: "space", mask: "......................................................2..2..........2.2..2.2.........222222........222....222........2....2..........2....2........222....222........222222.........2.2..2.2..........2..2......................................................"}
];

//  Palette
var colorIndex = 0;
var color = 2;
var palette = 0;
var pmap = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
var grid;

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
	if (componentid == "wall") { //Watch for all sprites
		client.subscribe(state.ecosystem + "/" + state.system + "/+/sprite");
	}
	else { // Only spritew with this componentid
		client.subscribe(state.ecosystem + "/" + state.system + "/" + state.component + "/sprite");
	}
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
		case 'sprite':
			createSprite(data);
			break;
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

canvasw = canvaswidth;
canvash = canvasheight;

var game = new Phaser.Game(canvasw, canvash, Phaser.CANVAS, 'phaser', {
	preload: preload,
	create: create,
	update: update
});

function createSprite(data) {
	var spriteSize = 8;
	var spritew = data.split(":")[0]; // Width
	var spriteh = data.split(":")[1]; // Height
	var spriteMaskNumber = data.split(":")[2]; // Mask Number
	var spriteFrameCount = data.split(":").length-3; // Number of Frames
	var spriteBitmap = game.add.bitmapData(spritew*spriteSize*spriteFrameCount, spriteh*spriteSize);

	for (var z=1; z<=spriteFrameCount; z++) {
		var spriteData = data.split(":")[3+(z-1)]; // Frame
		for (var y=0; y<spriteh; y++) {
			for (var x=0; x<spritew; x++) {
				var colorValue = spriteData[(y*16)+x];
				if (colorValue != '.') {
					if (componentid == "ogl") { // Apply and extra layer of security for OGL
						if (masks[spriteMaskNumber].mask[(y*16)+x] != ".") {
							spriteBitmap.rect((x+((z-1)*spritew))*spriteSize, y*spriteSize, spriteSize, spriteSize, game.create.palettes[palette][colorValue]);
						}
					}
					else {
						spriteBitmap.rect((x+((z-1)*spritew))*spriteSize, y*spriteSize, spriteSize, spriteSize, game.create.palettes[palette][colorValue]);
					}
				}
			}
		}
	}

	var spriteSheet = "sprite"+spriteCounter;
	game.cache.addSpriteSheet(spriteSheet, null, spriteBitmap.canvas, spritew*spriteSize, spriteh*spriteSize, spriteFrameCount);
	sprite[spriteCounter] = game.add.sprite(Math.floor(Math.random()*canvasw), Math.floor(Math.random()*200), spriteSheet);
  sprite[spriteCounter].animations.add('animate');
	sprite[spriteCounter].animations.play('animate', 2, true);

	game.physics.enable(sprite[spriteCounter] , Phaser.Physics.ARCADE);
	sprite[spriteCounter].body.collideWorldBounds = true;
	sprite[spriteCounter].body.bounce.x = 0.90
	sprite[spriteCounter].body.bounce.y = 0.90
	sprite[spriteCounter].body.velocity.setTo(Math.floor(Math.random()*800-400), Math.floor(Math.random()*-400));
	spriteCounter++;
}

function preload() {
}

function create() {
	game.stage.backgroundColor = '#333';
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 100;
	if (idleSprite != "") {
		createSprite(idleSprite);
		setInterval(function () {
			createSprite(idleSprite);
		}, idleTimeout);
	}
}

function update() {
	if (spriteCounter > 0) {
		for (i=0; i<spriteCounter; i++) {
			if (sprite[i].visible) {
				if ((Math.abs(sprite[i].body.velocity.y) < 1) && sprite[i].body.y > canvasheight-144) {
					sprite[i].visible = false;
					//console.log("Hiding Sprite "+i);
				}
			}
		}
	}
}