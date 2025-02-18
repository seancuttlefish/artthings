let canvas;
let video;
let capture;
let poseNet;

let puppets = [];

let vidwidth;
let vidheight;
let vidoffsetx;
let vidoffsety;

let puppet = 1;

function setup() {
	if (windowWidth < (windowHeight-80)) {
		vidwidth = windowHeight-80;
		vidheight = windowHeight-80;
		canvas = createCanvas(windowWidth, windowHeight);
		vidoffsetx = (windowWidth-vidwidth)/2;
	vidoffsety = 0;
	}
	else {
		vidwidth = windowHeight-80;
		vidheight = windowHeight-80;
		canvas = createCanvas(vidwidth, windowHeight);
		vidoffsetx = 0;
		vidoffsety = 0;
	}

	video = createCapture({
	audio: false,
		video: {
			width: vidwidth,
			height: vidheight
		}
	}, videoLoaded);

	poseNet = ml5.poseNet(video, modelReady);
	poseNet.on('pose', processPoses);
	// Load the puppet images
	rightEye = loadImage('./assets/'+puppet+'/rightEye.png');
	leftEye = loadImage('./assets/'+puppet+'/leftEye.png');
	rightEar = loadImage('./assets/'+puppet+'/rightEar.png');
	leftEar = loadImage('./assets/'+puppet+'/leftEar.png');
	hat = loadImage('./assets/'+puppet+'/hat.png');
	// Buttons
	photo = loadImage('./assets/photo.png');
}

function videoLoaded() {
	console.log('Video Ready');
	video.size(vidwidth, vidheight)
	console.log("Video: "+vidwidth+" "+vidheight+" ["+vidoffsetx+"]");
	video.hide();
}

function processPoses(poses) {
	if (poses.length > 0) {
		puppets[0] = poses[0].pose;
	}
}

function modelReady() {
	console.log('Model Ready');
}

function draw() {
	image(video, vidoffsetx, vidoffsety, vidwidth, vidheight+1); // The +1 is to hide a grey line on iOS Safari

	if (puppets.length > 0) {
		// Scale based on the distance between the eyes
		let d = dist(puppets[0].leftEye.x, puppets[0].leftEye.y, puppets[0].rightEye.x, puppets[0].rightEye.y);
		// Position according to x and y offsets
		// Eyes
		image(leftEye, puppets[0].leftEye.x-d*0.3+vidoffsetx, puppets[0].leftEye.y-d*0.3+vidoffsety, d*0.6, d*0.6);
		image(rightEye, puppets[0].rightEye.x-d*0.3+vidoffsetx, puppets[0].rightEye.y-d*0.3+vidoffsety, d*0.6, d*0.6);
		// Ears - Hide the ears if they are out of sight
		if (puppets[0].leftEye.x < puppets[0].leftEar.x - d*0.35) {
			image(leftEar, puppets[0].leftEar.x-d*0.1+vidoffsetx, puppets[0].leftEar.y-d*0.9+vidoffsety, d*0.8, d*1.6);
		}
		if (puppets[0].rightEye.x > puppets[0].rightEar.x + d*0.35) {
			image(rightEar, puppets[0].rightEar.x-d*0.7+vidoffsetx, puppets[0].rightEar.y-d*0.9+vidoffsety, d*0.8, d*1.6);
		}
		// Hat
		image(hat, puppets[0].rightEye.x-d*0.8+vidoffsetx, puppets[0].rightEye.y-d*3.4+vidoffsety, d*2.6, d*3);
	}
	// Control Bar
	noStroke();
	fill(0, 0, 0);
	rect(0, canvas.height-80, canvas.width, 80);
	image(photo, (vidwidth+vidoffsetx*2-70)/2, vidheight+5, 70, 70);
}

function mousePressed() {
	if (mouseX > (vidwidth+vidoffsetx*2-70)/2 && mouseX < (vidwidth+vidoffsetx*2-70)/2+70 && mouseY > vidheight+5 && mouseY < vidheight+5+70) {
		let source = document.getElementById('defaultCanvas0');
		let capture = document.createElement('canvas');

		// Add 'polaroid' borders
		noStroke();
		fill(255, 255, 255);
		rect(0, 0, canvas.width, 30);
		rect(0, 0, 30, canvas.height);
		rect(canvas.width-30, 0, 30, canvas.height);
		rect(0, canvas.height-80, canvas.width, 80);
		fill(0, 0, 0);
		noFill();
		stroke(0, 0, 0);
		strokeWeight(1);
		rect(1, 1, canvas.width-2, canvas.height-2);

		// Resize/crop and download the canvas as a jpg
		capture.width = source.width/3;
		capture.height = source.height/3;
		console.log(source.width, source.height, capture.width, capture.height);
		capture.getContext("2d").drawImage(
			source,
			0, 0, source.width, source.height,
			0, 0, capture.width, capture.height);

		// Download jpg
		capture.toBlob(function(blob) {
			captureURL = window.URL.createObjectURL(blob);
			var link = document.createElement("a");
			link.href = captureURL;
			link.download = "elfie.jpg";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}, 'image/jpeg', 0.8);
	}
}

function windowResized() {
}
