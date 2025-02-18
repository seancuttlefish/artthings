/******************/
/* Showflake Wall */
/******************/

console.log("Snowflake Wall 0.3");

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
	client.subscribe(state.ecosystem + "/" + state.system + "/creator/snowflake");
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
		case 'snowflake':
			createSnowflake(data);
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

var bgcolour = '#da2128';
var drawcolour = '#ffffff';
var background;

var gridSize = 1;
var pixelSize = 6;
var spritew = 256;
var spriteh = 256;
var xoffset = 128;
var yoffset = 128;

var spriteCounter = 0;
var spriteMax = 50;

var sprite = [];
var x, y, newx, newy;

var game = new Phaser.Game(canvaswidth, canvasheight, Phaser.CANVAS, 'phaser', {
	preload: preload,
	create: create,
	update: update
});

var idle = [
	"6cd86bd46bd169cc68c768c467c167bf66be65bc65bb65ba65b965b865b765b665b565b465b365b265b165b066b066af67af67ae68ae68ad69ac6aac6bac6bab6cab6daa6ea96fa96fa8",
	"13bb11bd14ba3a8f566d9335a728b71f24b86c65c0264e9130bb38a57c62a541cf26ab3b925371742bca6d6d944f",
	"83ac83aa83a483a1839c839883958394849385938692879188918a918b918c918d918e918f91909191919291",
	"9c6f997092738879847d7d847b867988788a778d778f769375977599759d759e75a175a376a777a978ab78ac79ad7bb07eb47fb582b784b886b988ba8cbc8ebc8fbd92bd93bd96bd98bd9abd9cbd9fbda0bca1bba3bba5bba6bba9bbadbbafbbb1bbb3bbb5bbb6bbb7bbb8bbb9bbbabbbbbbbdbbbebbc0bcc1bec2bfc5c2c6c4c7c5c9c7c9c8cac9cacbcbcecbcfccd0cdd2cdd3cdd5ced7cfd9cfdbcfdccfddcfdecfdfcfe0cfe1",
	"8b04910c95109a179c1a9e219e269c329936913b8d3c853c803c7b3a77376f346c33663363335d335b3357365539543e54415447554a5b4e5d50605165516c5170517550784e7c4b7e4a8247"
];

function createSnowflake(data) {
	var items = data.split(":");
	var latitude = items[0];
	var longitude = items[1];
	var pointshex = items[2];
	var spriteBitmap = game.add.bitmapData(spritew, spriteh);

	console.log(spriteCounter, latitude, longitude, pointshex);
	for (var j=0; j<pointshex.length; j+=4) {
		x = parseInt(pointshex[j]+pointshex[j+1], 16);
		y = parseInt(pointshex[j+2]+pointshex[j+3], 16);
		x = x-xoffset;
		y = y-yoffset;

		for (var i=0; i<6; i++) {
			spriteBitmap.rect(x+xoffset, y+yoffset, pixelSize, pixelSize, drawcolour);
			spriteBitmap.rect(xoffset-x, yoffset+y, pixelSize, pixelSize, drawcolour);
			newx = x*Math.cos(Math.PI/3)-y*Math.sin(Math.PI/3);
			newy = y*Math.cos(Math.PI/3)+x*Math.sin(Math.PI/3);
			x = Math.round(newx);
			y = Math.round(newy);
		}
	}

	sprite[spriteCounter] = game.add.sprite(Math.floor(Math.random()*(canvaswidth-128)), Math.floor(Math.random()*200), spriteBitmap);
	game.physics.enable(sprite[spriteCounter], Phaser.Physics.ARCADE);
	sprite[spriteCounter].body.velocity.setTo(Math.floor(Math.random()*20)-9, Math.floor(Math.random()*50)+50);
	sprite[spriteCounter].scale.setTo(0.8, 0.8);
	spriteCounter++;

	if (spriteCounter > spriteMax) {
		sprite[spriteCounter-spriteMax].visible = false;
	}
}

function preload() {
  game.load.image('background','background.png');
}

function create() {
	game.stage.backgroundColor = bgcolour;
	background = game.add.image((canvaswidth-600)/2, (canvasheight-250)/2, 'background');
	background.alpha = 0.6;
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 0;

	for (var k=0; k<idle.length; k++) {
		var pointshex = idle[k];
		var spriteBitmap = game.add.bitmapData(spritew, spriteh);

		for (var j=0; j<pointshex.length; j+=4) {
			x = parseInt(pointshex[j]+pointshex[j+1], 16);
			y = parseInt(pointshex[j+2]+pointshex[j+3], 16);
			x = x-xoffset;
			y = y-yoffset;

			for (var i=0; i<6; i++) {
				spriteBitmap.rect(x+xoffset, y+yoffset, pixelSize, pixelSize, drawcolour);
				spriteBitmap.rect(xoffset-x, yoffset+y, pixelSize, pixelSize, drawcolour);
				newx = x*Math.cos(Math.PI/3)-y*Math.sin(Math.PI/3);
				newy = y*Math.cos(Math.PI/3)+x*Math.sin(Math.PI/3);
				x = Math.round(newx);
				y = Math.round(newy);
			}
		}

		sprite[spriteCounter] = game.add.sprite(Math.floor(Math.random()*(canvaswidth-128)), Math.floor(Math.random()*200), spriteBitmap);
		game.physics.enable(sprite[spriteCounter], Phaser.Physics.ARCADE);
		sprite[spriteCounter].body.velocity.setTo(Math.floor(Math.random()*20)-9, Math.floor(Math.random()*50)+50);
		sprite[spriteCounter].scale.setTo(0.8, 0.8);
		spriteCounter++;
	}
}

function update() {
	if (spriteCounter > 0) {
		for (i=0; i<spriteCounter; i++) {
			if (sprite[i].visible) {
				if (sprite[i].body.y > canvasheight) {
					sprite[i].body.x = Math.floor(Math.random()*(canvaswidth-128));
					sprite[i].body.y = -200;
					sprite[i].scale.x *= 0.8;
					sprite[i].scale.y *= 0.8;
					if (sprite[i].scale.x < 0.3) {
						sprite[i].scale.x = 0.3;
						sprite[i].scale.y = 0.3;
					}
					sprite[i].alpha *= 0.95;
					if (sprite[i].alpha < 0.5) {
						sprite[i].alpha = 0.5;
					}
					sprite[i].body.velocity.setTo(Math.floor(Math.random()*20)-9, Math.floor(Math.random()*50)+50);
				}
			}
		}
	}
}
