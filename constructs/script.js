// Initialize Raphael.js
const gridSize = 64;  // 64x64 grid
const spacing = 12;   // Space between circles
const radius = 5;     // Circle size
const canvasSize = gridSize * spacing; // Adjust canvas size dynamically

const paper = Raphael("canvas", canvasSize, canvasSize); // Set canvas size dynamically

// HSL to HEX conversion function
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Function to draw the grid using x, y values from JSON
function drawGrid(colorsData) {
    colorsData.forEach(color => {
        let hexColor = hslToHex(color.h, color.s, color.l);

        let xPos = color.x * spacing + spacing / 2;
        let yPos = color.y * spacing + spacing / 2;

        paper.circle(xPos, yPos, radius).attr({ fill: hexColor, stroke: "none" });
    });
}

// Fetch JSON data from "palettes.json" and draw the grid
fetch("palettes.json")
    .then(response => response.json())
    .then(data => {
        drawGrid(data);
    })
    .catch(error => console.error("Error loading JSON:", error));