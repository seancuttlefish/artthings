/////////////////////////////////////////////////
// Colour Palette Creation and Sound Functions //
/////////////////////////////////////////////////

// Palette Functions
function generatepalette() {
	let unique = false;
	for (y=0; y<totalRows; y++) {
		for (x=0; x<totalCols; x++) {
			let color = new Object();
			color.index = (y*totalRows)+x;
			color.x = x;
			color.y = y;
			unique = false;
			while (!unique) {
				color.h = random(36000)/100;
				unique = true;
				i = (y*totalRows)+x;
				for (j=0; j<i; j++) {
					if (palette[j].h == color.h) {
						console.log("Duplicate H:"+color.h);
						unique = false;
					}
				}
			}
			unique = false;
			while (!unique) {
				color.s = (random(100000))/1000;
				unique = true;
				i = (y*totalRows)+x;
				for (j=0; j<i; j++) {
					if (palette[j].s == color.s) {
						console.log("Duplicate S:"+color.s);
						unique = false;
					}
				}
			}
			unique = false;
			while (!unique) {
				color.l = (random(100000))/1000;
				unique = true;
				i = (y*totalRows)+x;
				for (j=0; j<i; j++) {
					if (palette[j].l == color.l) {
						console.log("Duplicate L:"+color.l);
						unique = false;
					}
				}
			}
			palette.push(color);
			i++;
		}
	}
}

// Sort Functions
function Icompare(a, b) {
	const colorA = a.index;
	const colorB = b.index;

	let comparison = 0;
	if (colorA > colorB) {
		comparison = 1;
	}
	else {
		comparison = -1;
	}
	return comparison;
}
function Hcompare(a, b) {
	const colorA = a.h;
	const colorB = b.h;

	let comparison = 0;
	if (colorA > colorB) {
		comparison = 1;
	}
	else {
		comparison = -1;
	}
	return comparison;
}
function Scompare(a, b) {
	const colorA = a.s;
	const colorB = b.s;

	let comparison = 0;
	if (colorA > colorB) {
		comparison = 1;
	}
	else {
		comparison = -1;
	}
	return comparison;
}
function Lcompare(a, b) {
	const colorA = a.l;
	const colorB = b.l;

	let comparison = 0;
	if (colorA > colorB) {
		comparison = 1;
	}
	else {
		comparison = -1;
	}
	return comparison;
}

// Sound Functions
function hslToNote(h,s,l) {
	const note = scale[Math.floor(h/30)]+(Math.floor(s/25)+1);
	return note;	
}
function noteToHsl(note) {
	return "0,0,0";
}