///////////////////
// Santa Puppets //
///////////////////

// Multiple frameworks are being used.
// There is duplication of code.
// It will be addressed!
// Zoom screen option?

let canvas;
let video;
let capture;
let poseNet;

let puppets = [];
let pose = [];
let posedata;

// Images
let head = [];
let body = [];
let lwrist = [];
let rwrist = [];

// Posture Values
let leftEyeX;
let leftEyeY;
let rightEyeX;
let rightEyeY;
let leftShoulderX;
let leftShoulderY;
let rightShoulderX;
let rightShoulderY;
let leftWristX;
let leftWristY;
let rightWristX;
let rightWristY;

let vidwidth;
let vidheight;
let bodywidth;
let bodyheight;

// Refresh Settings
let refreshinterval = 100; //ms
let newrefresh = 0;
let previousrefresh = 0;

let d = 0;
let infomode = false;

$('html').keypress(function(event) {
  	if (infomode == false) {
  		infomode = true;
  	}
  	else {
  		infomode = false;
  	}
});

//////////
// MQTT //
//////////

var mqttconnected = false;
var reconnectTimeout = 10000;
MQTTConnect();

function MQTTConnect() {
	console.log("MQTT Connecting..");
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
	// Listen for pose messages?
	if (state.component == "receiver") {
		client.subscribe(state.ecosystem + "/" + state.system + "/+/pose");
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
		if (!sourceid) {
			sourceid = component;
			data = message.payloadString.replace(/^"|"$/g, '');
		}
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
		case 'pose':
			let receiveddata = data.split(":");
			let i = receiveddata[0];
			if (i == 0) {
				clear();
			}
			let pose = receiveddata[1].split(",");
			//console.log(i, receivedpose);

			leftEyeX = parseFloat(pose[0]);
			leftEyeY = parseFloat(pose[1]);
			rightEyeX = parseFloat(pose[2]);
			rightEyeY = parseFloat(pose[3]);
			leftShoulderX = parseFloat(pose[4]);
			leftShoulderY = parseFloat(pose[5]);
			rightShoulderX = parseFloat(pose[6]);
			rightShoulderY = parseFloat(pose[7]);
			leftWristX = parseFloat(pose[8]);
			leftWristY = parseFloat(pose[9]);
			rightWristX = parseFloat(pose[10]);
			rightWristY = parseFloat(pose[11]);

			// Use shoulder distance for scaling
			d = dist(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY);

			if (leftWristY > rightShoulderY+d*0.75) {
				leftWristY = rightShoulderY+d*0.75;
			}
			if (rightWristY > rightShoulderY+d*0.75) {
				rightWristY = rightShoulderY+d*0.75;
			}

			// Draw the Puppet (Mirrored)
			stroke(255, 42, 42);
			// Arms
			strokeWeight(d/8);
			line(vidwidth-(rightShoulderX+d/2), rightShoulderY+d/4, vidwidth-(leftWristX), leftWristY);
			line(vidwidth-(rightShoulderX+d/2), rightShoulderY+d/4, vidwidth-(rightWristX), rightWristY);
			// Body
			image(bodY, vidwidth-(rightShoulderX-d/4), rightShoulderY-d/4, d*-1.5, d*2);
			// Hands
			image(lwrist[i], vidwidth-(leftWristX-d/8), leftWristY-d/8, d/-4, d/4);
			image(rwrist[i], vidwidth-(rightWristX-d/8), rightWristY-d/8, d/-4, d/4);
			image(head[i], vidwidth-(rightEyeX-d/2), rightShoulderY-d*0.9, d*-1.1, d*1.1);

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

function setup() {
	vidwidth = 640;
	vidheight = 480;
	canvas = createCanvas(vidwidth, vidheight);
	if (state.component != "receiver") {
		video = createCapture({
			audio: false,
			video: {
				width: vidwidth,
				height: vidheight
			}
		}, videoLoaded);

		poseNet = ml5.poseNet(video, modelReady);
		poseNet.on('pose', processPoses);
	}

	// Starting Position
	screenwidth = window.innerWidth;
	screenheight = window.innerHeight;
	console.log("Starting Screen: "+screenwidth+"x"+screenheight);
	if (screenwidth/640 > screenheight/480) {
		var zoom = screenheight/480;
		var top = 0;
		var left = (screenwidth-zoom*640)/2;
	}
	else {
		var zoom = screenwidth/640;
		var top = (screenheight-zoom*480)/2;
		var left = 0;
	}
	console.log("Resize: "+zoom+" "+top+" "+left);
	$("#defaultCanvas0").css("zoom", zoom);
	$("#defaultCanvas0").css("top", top/zoom);
	$("#defaultCanvas0").css("left", left/zoom);

	// Load the puppet images
	for (i=0;i<5;i++) {
		// Images
		head[i] = loadImage('./assets/1/head.png');
		bodY = loadImage('./assets/1/body.png');
		lwrist[i] = loadImage('./assets/1/leftWrist.png');
		rwrist[i] = loadImage('./assets/1/rightWrist.png');
	}
}

function videoLoaded() {
	console.log('Video Ready');
	video.size(vidwidth, vidheight)
	console.log("Video: "+vidwidth+" "+vidheight);
	video.hide();
}

function processPoses(poses) {
	for (i=0;i<5;i++) {
		puppets[i] = "";
		if (poses[i]) {
			puppets[i] = poses[i].pose;
		}
	}
}

function modelReady() {
	console.log('Model Ready');
}

function drawPuppet(i, posedata) {
}

function draw() {
	newrefresh = new Date().getTime();
	if (newrefresh-previousrefresh>refreshinterval) {
		if (state.component != "receiver") {
			clear();
			if (infomode == true) {
				image(video, 0, 0, vidwidth/3, vidheight/3);
			}
			for (i=0;i<5;i++) {
				if (puppets[i]) {
					// console.log(i, puppets[i].score);
					if (puppets[i].score > 0.4) {

						leftEyeX = Math.round(puppets[i].leftEye.x*1000)/1000;
						leftEyeY = Math.round(puppets[i].leftEye.y*1000)/1000;
						rightEyeX = Math.round(puppets[i].rightEye.x*1000)/1000;
						rightEyeY = Math.round(puppets[i].rightEye.y*1000)/1000;
						leftShoulderX = Math.round(puppets[i].leftShoulder.x*1000)/1000;
						leftShoulderY = Math.round(puppets[i].leftShoulder.y*1000)/1000;
						rightShoulderX = Math.round(puppets[i].rightShoulder.x*1000)/1000;
						rightShoulderY = Math.round(puppets[i].rightShoulder.y*1000)/1000;
						leftWristX = Math.round(puppets[i].leftWrist.x*1000)/1000;
						leftWristY = Math.round(puppets[i].leftWrist.y*1000)/1000;
						rightWristX = Math.round(puppets[i].rightWrist.x*1000)/1000;
						rightWristY = Math.round(puppets[i].rightWrist.y*1000)/1000;

						// Use shoulder distance for scaling
						d = dist(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY);

						if (leftWristY > rightShoulderY+d*0.75) {
							leftWristY = rightShoulderY+d*0.75;
						}
						if (rightWristY > rightShoulderY+d*0.75) {
							rightWristY = rightShoulderY+d*0.75;
						}
						if (rightEyeX < rightShoulderX) {
							rightEyeX = rightShoulderX;
						}
						if (leftEyeX > leftShoulderX) {
							leftEyeX = leftShoulderX;
						}

						// Draw the Puppet (Mirrored)
						stroke(255, 42, 42);
						// Arms
						strokeWeight(d/8);
						line(vidwidth-(rightShoulderX+d/2), rightShoulderY+d/4, vidwidth-(leftWristX), leftWristY);
						line(vidwidth-(rightShoulderX+d/2), rightShoulderY+d/4, vidwidth-(rightWristX), rightWristY);
						// Body
						image(bodY, vidwidth-(rightShoulderX-d/4), rightShoulderY-d/4, d*-1.5, d*2);
						// Hands
						image(lwrist[i], vidwidth-(leftWristX-d/8), leftWristY-d/8, d/-4, d/4);
						image(rwrist[i], vidwidth-(rightWristX-d/8), rightWristY-d/8, d/-4, d/4);
						// Head
						image(head[i], vidwidth-(rightEyeX-d/2), rightShoulderY-d*0.9, d*-1.1, d*1.1);

						// Transmit Pose
						if (state.component == "transmitter") {
							posedata = i+":"+leftEyeX+","+leftEyeY+","+rightEyeX+","+rightEyeY+","+leftShoulderX+","+leftShoulderY+","+rightShoulderX+","+rightShoulderY+","+leftWristX+","+leftWristY+","+rightWristX+","+rightWristY;
							if (mqttconnected) {
								sendmqtt(state.ecosystem + "/" + state.system + "/" + state.component + "/pose", posedata);
							}
						}
					}
				}
			}
			previousrefresh = newrefresh;
		}
	}
}

function mousePressed() {
}

function windowResized() {
}
