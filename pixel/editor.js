/****************/
/* Pixel Editor */
/****************/

console.log("Pixel Editor 0.7");

//  UI
var paletteUI;
var controlUI;

//  Drawing Area
var canvasUI;
var canvasGrid;
var canvasSprite;

//  Mouse
var isDown = false;
var isErase = false;

// Masks
var masks = [
	{theme: "space", mask: "16:16:0:.......................................22............22..22.........2.2222.2.......2.2.22.2.2......22.2..2.22.....2.22....22.2....2.22....22.2.....22.2..2.22......2.2.22.2.2.......2.2222.2.........22..22............22......................................."},
	{theme: "space", mask: "16:16:0:....................................................2..22..2.......2..2..2..2.........2..2..........222..222.......2...22...2......2...22...2.......222..222..........2..2.........2..2..2..2.......2..22..2...................................................."},
	{theme: "space", mask: "16:16:0:.....................................2....2.........2......2.......2..2..2..2.....2..2....2..2......2..22..2..........2..2............2..2..........2..22..2......2..2....2..2.....2..2..2..2.......2......2.........2....2....................................."},
	{theme: "space", mask: "16:16:0:........................................2..............2............2...2..2.........2.2..2...........2222........2.2.2..22.2......2.22..2.2.2........2222...........2..2.2.........2..2...2............2..............2........................................"},
	{theme: "space", mask: "16:16:0:.....................................................22..22.........2.2.22.2.......2.2.2..2.2......22.2..2.22.......2..22.2..........2.22..2.......22.2..2.22......2.2..2.2.2.......2.22.2.2.........22..22....................................................."},
	{theme: "space", mask: "16:16:0:....................................................22....22.......22......22......2.2....2.2.........2..2.............22..............22.............2..2.........2.2....2.2......22......22.......22....22...................................................."},
	{theme: "space", mask: "16:16:0:...................................................2...22...2.......2......2.........2.22.2...........2..2.........2.2.22.2.2......2.2.22.2.2.........2..2...........2.22.2.........2......2.......2...22...2..................................................."},
	{theme: "space", mask: "16:16:0:......................................................2..2..........2.2..2.2.........222222........222....222........2....2..........2....2........222....222........222222.........2.2..2.2..........2..2......................................................"}
];
var mask;
var maskBitmap = [8];
var maskSprite = [8];

// Frames
var frames = [];
var pasteBuffer;
var currentFrame = 0;

//  Palette
var colorIndex = 0;
var color = 2;
var palette = 0;
var pmap = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

var helpSprite;
var shareSprite;
var colorselectSprite;
var frameselectSprite;
var shareLock = false;
var sendDelay = 1000;

var i, x, y;

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

var canvasw = canvaswidth;
//if (canvasw > 360) {
	canvasw = 360;
//}
var buttonSize = Math.floor(canvasw/9);
var gridSize = Math.floor(canvasw/18);
var canvash = canvasw+buttonSize*2;
var paletteTop = 0;
var paletteLeft = 0;
var canvasTop = buttonSize*2;
var canvasLeft = 0;
var sidebarTop = buttonSize*2;
var sidebarLeft = buttonSize*8;

var game = new Phaser.Game(canvasw, canvash, Phaser.CANVAS, 'phaser', {
	preload: preload,
	create: create
});

function preload() {
	// Pen Colour Icons
	game.load.image('help', 'assets/help.png');
	game.load.image('share', 'assets/share.png');
	game.load.image('colorselect', 'assets/colorselect.png');
	game.load.image('frameselect', 'assets/frameselect.png');
	game.load.image('copy', 'assets/copy.png');
	game.load.image('paste', 'assets/paste.png');
}

function create() {
	game.stage.backgroundColor = '#333';
	game.input.mouse.capture = true;
	game.input.onDown.add(onDown, this);
	game.input.onUp.add(onUp, this);
	game.input.addMoveCallback(setPixel, this);

	// Help Sprite
	//helpSprite = game.add.sprite(40, buttonSize+canvasw, 'help');
	//helpSprite.inputEnabled = true;
	//helpSprite.events.onInputDown.add(helpHandler, this);

	// Share Sprite
	shareSprite = game.add.sprite(120, buttonSize+canvasw, 'share');
	shareSprite.inputEnabled = true;
	shareSprite.events.onInputDown.add(shareHandler, this);
	
	// paletteUI
  paletteUI = game.make.bitmapData(buttonSize*9, buttonSize*2);
	for (y=0; y<2; y++) {
		var offset = 0;
		if (y == 0) {
			offset = buttonSize;
		}
		for (x=0; x<8; x++) {
			paletteUI.rect(x*buttonSize+offset, y*buttonSize, buttonSize, buttonSize, game.create.palettes[palette][pmap[(y*8)+x]]);
		}
	}
	paletteUI.addToWorld(paletteLeft, paletteTop);

	// Erase
	var f = game.add.graphics(paletteLeft, paletteTop);
	f.lineStyle(4, 0x9d9d9d);
	f.moveTo(0, 0);
	f.lineTo(buttonSize, buttonSize);

	// Clear
	f.moveTo(gridSize*16, buttonSize);
	f.lineTo(gridSize*16+buttonSize, buttonSize*2);
	f.moveTo(gridSize*16+buttonSize, buttonSize);
	f.lineTo(gridSize*16, buttonSize*2);

	// Grid Lines
	var g = game.add.graphics(canvasLeft, canvasTop);
	g.lineStyle(2, 0x9d9d9d);
	// Top Horizontal
	g.moveTo(0, 0);
	g.lineTo(canvasw, 0);
	// Horizontals
	g.moveTo(0, gridSize*16);
	g.lineTo(canvasw, gridSize*16);
	g.moveTo(0, gridSize*18-1);
	g.lineTo(canvasw, gridSize*18-1);
	// Verticals
	g.moveTo(gridSize*16, 0);
	g.lineTo(gridSize*16, gridSize*16);
	g.moveTo(canvasw-1, gridSize*-4);
	g.lineTo(canvasw-1, gridSize*18);
	g.moveTo(0, gridSize*-4);
	g.lineTo(0, gridSize*18);

	// Canvas Grid
	for (var i=0; i<16; i++) {
		g.moveTo(gridSize*i, -1);
		g.lineTo(gridSize*i, gridSize*16-1);
		g.moveTo(0, gridSize*i-1);
		if (i % 2) {
			g.lineTo(gridSize*16, gridSize*i-1);
		}
		else {
			g.lineTo(buttonSize*9, gridSize*i-1);
		}
	}
	
	// CanvasUI
  canvasUI = game.make.bitmapData(gridSize*16, buttonSize*16);
	canvasUI.addToWorld(canvasLeft, canvasTop);
	for (i=0; i<8; i++) {
		resetFrame(i);
	}
	drawCanvas(currentFrame);
	setColor(2);

	// SideBarUI
	sidebarUI = game.make.bitmapData(buttonSize, buttonSize*8);
	sidebarUI.addToWorld(sidebarLeft, sidebarTop);
	for (i=0; i<8; i++) {
		drawThumbnail(i);
	}

	// Animation
	if (animateMode) {
		copySprite = game.add.sprite(buttonSize*8+3, buttonSize*8+3, 'copy');
		copySprite.inputEnabled = true;
		copySprite.events.onInputDown.add(copyHandler, this);
		pasteprite = game.add.sprite(buttonSize*8+3, buttonSize*9+3, 'paste');
		pasteprite.inputEnabled = true;
		pasteprite.events.onInputDown.add(pasteHandler, this);
	}
	
	// Selection
	colorselectSprite = game.add.sprite(paletteLeft+buttonSize*3, paletteTop, 'colorselect');
	frameselectSprite = game.add.sprite(canvasw-buttonSize, canvasTop, 'frameselect');
}

////////////////////
// Mouse Handlers //
////////////////////

function onDown(pointer) {
	if (pointer.y <= canvasTop) { // PaletteUI
		var i = game.math.snapToFloor(pointer.x,buttonSize)/buttonSize+game.math.snapToFloor(pointer.y,buttonSize)/buttonSize*9;
		if (i == 0) { // Erase
			isErase = true;
			colorselectSprite.x = 0;
			colorselectSprite.y = 0;
			return;
		}
		else if (i == 17) { // Clear
			resetFrame(currentFrame);
			drawCanvas(currentFrame);
			drawThumbnail(currentFrame);
			return;
		}
		if (i > 8) {
			colorselectSprite.x = (i-9)*buttonSize;
			colorselectSprite.y = buttonSize;
		}
		else {
			colorselectSprite.x = i*buttonSize;
			colorselectSprite.y = 0;	
		}
		i = i-1;
		setColor(i);
	}
	else {
		if (pointer.y <= buttonSize*10) {
			if (pointer.x > sidebarLeft) { // SidebarUI
				var index = Math.floor((pointer.y-canvasTop)/buttonSize);
				if (animateMode) {
					if (index < 6) {
						currentFrame = index;
						drawCanvas(currentFrame);
						frameselectSprite.y = buttonSize*index+canvasTop-1;
					}
					else {
						// Copy and paste buttons
					}
				}
				else {
					currentFrame = index;
					drawCanvas(currentFrame);
					frameselectSprite.y = buttonSize*index+canvasTop-1;
				}
			}
			else { // CanvasUI
				isDown = true;
				setPixel(pointer);
			}
		}
	}
}

function onUp() {
	isDown = false;
	drawThumbnail(currentFrame);
}

function setColor(index) {
	if (index < 0) {
		index = 0;
	}
	else if (index > 15) {
		index = 15;
	}
	colorIndex = Math.round(index);
	color = game.create.palettes[palette][pmap[colorIndex]];	
	isErase = false;
}

function setPixel(pointer) {
	x = Math.round(game.math.snapToFloor(pointer.x, gridSize) / gridSize);
	y = Math.round(game.math.snapToFloor(pointer.y-canvasTop, gridSize) / gridSize);

	if ((y < 0) || (y > 15) || (x < 0) || (x > 15)) {
		return;
	}

	if (!isDown) {
		return;
	}

	var maskData, colorValue;
	if (isErase) {
		if (themeMode) {
			maskData = masks[currentFrame].mask.split(":")[3]; // Mask
			colorValue = maskData[(y*16)+x];
			if (colorValue != '.') {
				frames[currentFrame][y][x] = pmap[1];
				canvasUI.rect(x*gridSize, y*gridSize, gridSize, gridSize, game.create.palettes[palette][pmap[1]]);
			}
		}
		else {
			frames[currentFrame][y][x] = '.';
			canvasUI.clear(x*gridSize, y*gridSize, gridSize, gridSize);
		}
	}
	else {
		if (themeMode) {
			maskData = masks[currentFrame].mask.split(":")[3]; // Mask
			colorValue = maskData[(y*16)+x];
			if (colorValue != '.') {
				frames[currentFrame][y][x] = pmap[colorIndex];
				canvasUI.rect(x*gridSize, y*gridSize, gridSize, gridSize, color);
			}
		}
		else {
			frames[currentFrame][y][x] = pmap[colorIndex];
			canvasUI.rect(x*gridSize, y*gridSize, gridSize, gridSize, color);
		}
	}
}

/////////////////////
// Button Handlers //
/////////////////////

function helpHandler() {
}

function shareHandler() {
	var nextFrame;
	var serialFrame = "";
	if (!shareLock) {
		if (animateMode) {
			for (var i=0; i<6; i++) {
				nextFrame = serialiseFrame(i);
				if (nextFrame != "") {
						serialFrame += ":"+nextFrame;
				}
			}
		}
		else {
			nextFrame = serialiseFrame(currentFrame);
			if (nextFrame != "") {
		  	serialFrame = ":"+nextFrame;
			}
		}
		if (serialFrame != "") {
			serialFrame = "16:16:"+currentFrame+serialFrame;
			console.log("Frame: "+serialFrame);
			var packet = {
				'sourceid': instanceid,
				'data': serialFrame
			}
			sendmqtt(state.ecosystem + "/" + state.system + "/" + state.component + "/sprite", packet);
			shareLock = true;
			shareSprite.alpha = 0.2;
			setTimeout(function() {
				shareLock = false;
				shareSprite.alpha = 1;
			}, sendDelay);
		}
		else {
			console.log("Empty Frame");
		}
	}
	else {
		console.log("Share Lock On");
	}
}

function copyHandler() {
	frameToBuffer(currentFrame);
}

function pasteHandler() {
	bufferToFrame(currentFrame);
	drawCanvas(currentFrame);
	drawThumbnail(currentFrame);
}

///////////////
// Functions //
///////////////

function serialiseFrame(frame) {
	var activeFrame = false;
	var serialFrame = "";
	for (y=0; y<16; y++) {
		for (x=0; x<16; x++) {
			if ((frames[frame][y][x] != '.') && (frames[frame][y][x] != ' ')) {
				activeFrame = true;
			}
			serialFrame += frames[frame][y][x];
		}
	}
	if (activeFrame) {
		return serialFrame;
	}
	else {
		return "";
	}
}

function resetFrame(frame) {
	frames[frame] = [];
	if (themeMode) {
		var maskData = masks[frame].mask.split(":")[3]; // Mask
		for (y=0; y<16; y++) {
			frames[frame][y] = [];
			for (x=0; x<16; x++) {
				var colorValue = maskData[(y*16)+x];
				if ((colorValue != '.') && (colorValue != ' ')) {
					frames[frame][y][x] = pmap[1];
				}
				else {
					frames[frame][y][x] = '.';
				}
			}
		}
	}
	else {
		for (y=0; y<16; y++) {
			frames[frame][y] = [];
			for (x=0; x<16; x++) {
				frames[frame][y][x] = '.';
			}
		}
	}
}

function drawCanvas(frame) {
	canvasUI.clear();
	for (y=0; y<16; y++) {
		for (x=0; x<16; x++) {
			var i = frames[frame][y][x];
			if (i !== '.' && i !== ' ') {
				canvasUI.rect(x*gridSize, y*gridSize, gridSize, gridSize, game.create.palettes[palette][i]);
			}
		}
	}
}

function drawThumbnail(frame) {
	sidebarUI.clear(3, buttonSize*frame+3, 32, 32);
	for (y=0; y<16; y++) {
		for (x=0; x<16; x++) {
			i = frames[frame][y][x];
			if (i !== '.' && i !== ' ') {
				sidebarUI.rect(x*2+3, buttonSize*frame+y*2+3, 2, 2, game.create.palettes[palette][i]);
			}
		}
	}
}

function frameToBuffer(frame) {
	pasteBuffer = serialiseFrame(frame);
}

function bufferToFrame(frame) {
	var frameData = pasteBuffer;
	for (y=0; y<16; y++) {
		frames[frame][y] = [];
		for (x=0; x<16; x++) {
			var colorValue = frameData[(y*16)+x];
			frames[frame][y][x] = colorValue;	
		}
	}
}
