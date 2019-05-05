'use strict'
var outCircles = [];
var inCircles = [];

// edge colours
var topColor = [];
var lowerColor = [];

// number of rows and columns is doubled now
let numOfCols = 7;
let numOfRows = 10;

function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(RGB, 360, 100, 100, 100);

    // generate edge colours
    shakeColors();
}

function draw() {

    noLoop();

    let tileSize = width / numOfCols;

    // the loop was simplified, used only to create circle objects
    for (let gridX = 0; gridX <= numOfCols; gridX++) {
        for (let gridY = 0; gridY <= numOfRows; gridY++) {

            // tiles are no longer drawn but are still used for calculations
            let centerX = gridX * tileSize;
            let centerY = gridY * tileSize;
            // multiplier has been reduced by two
            let d = 1.33 * tileSize;

            // arrays to store a column of circles (inner and outer)
            if (!outCircles[gridX]) outCircles[gridX] = [];
            if (!inCircles[gridX]) inCircles[gridX] = [];

            var colorPos = map(gridY, 0, numOfRows, 0, 1);
            var interColor = lerpColor(topColor[gridX], lowerColor[gridX], colorPos);

            let outCircle = new Circle(centerX, centerY, d, interColor);
            outCircles[gridX].push(outCircle);
            // let inCircle = new Circle(centerX, centerY, d / 2, interColor);
            // inCircles[gridX].push(inCircle);

            blendMode(ADD);

            fill(outCircle.c, 0);
            ellipse(outCircle.x, outCircle.y, outCircle.d, outCircle.d);
            // fill(inCircle.c, 0);
            // ellipse(inCircle.x, inCircle.y, inCircle.d, inCircle.d); 

            // check used colours in console
            console.log('%c' + gridY + ': ' + outCircle.c, 'background: ' + outCircle.c);
        }
        console.log('');
    }

    // to check edge colours in the console, change mode to RGB
    outCircles.forEach(function(column, columnIndex) {
        // display top colour
        console.log('%c Top_' + columnIndex + ': ' + topColor[columnIndex], 'background: ' + topColor[columnIndex]);
        // display lower colour
        console.log('%c Lower_' + columnIndex + ': ' + lowerColor[columnIndex], 'background: ' + lowerColor[columnIndex]);
        console.log('');
    });

}


// generate edge colours
function shakeColors() {

    randomSeed(1);

    for (var i = 0; i < numOfCols + 1; i++) {
        topColor[i] = color(random(360), random(360), random(360));
        lowerColor[i] = color(random(0, 360), random(0, 360), random(0, 360));
    }
}

// define a circle object
function Circle(x, y, d, c) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.c = c;
}

// Let a point be a pair: (x, y)
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// find intersection points
function intersectionPoints(c1, c2) {


    // let EPS (epsilon) be a small value
    var EPS = 0.0000001;

    var r, R, d, dx, dy, cx, cy, Cx, Cy;

    if (c1.d < c2.d) {
        r = c1.d / 2;
        R = c2.d / 2;
        cx = c1.x;
        cy = c1.y;
        Cx = c2.x;
        Cy = c2.y;
    } else {
        r = c2.d / 2;
        R = c1.d / 2;
        Cx = c1.x;
        Cy = c1.y;
        cx = c2.x;
        cy = c2.y;
    }

    // Compute the vector <dx, dy>
    dx = cx - Cx;
    dy = cy - Cy;

    // Find the distance between two points.
    d = Math.sqrt(dx * dx + dy * dy);

    // There are an infinite number of solutions
    // Seems appropriate to also return null
    if (d < EPS && Math.abs(R - r) < EPS) return [];

    // No intersection (circles centered at the 
    // same place with different size)
    else if (d < EPS) return [];

    var x = (dx / d) * R + Cx;
    var y = (dy / d) * R + Cy;
    var P = new Point(x, y);

    // Single intersection (kissing circles)
    if (Math.abs((R + r) - d) < EPS || Math.abs(R - (r + d)) < EPS) return [P];

    // No intersection. Either the small circle contained within 
    // big circle or circles are simply disjoint.
    if ((d + r) < R || (R + r < d)) return [];

    var C = new Point(Cx, Cy);
    var angle = acossafe((r * r - d * d - R * R) / (-2.0 * d * R));
    var pt1 = rotatePoint(C, P, +angle);
    var pt2 = rotatePoint(C, P, -angle);
    return [pt1, pt2];
}

// Due to double rounding precision the value passed into the Math.acos
// function may be outside its domain of [-1, +1] which would return
// the value NaN which we do not want.
function acossafe(x) {
    if (x >= +1.0) return 0;
    if (x <= -1.0) return Math.PI;
    return Math.acos(x);
}

// Rotates a point about a fixed point at some angle 'a'
function rotatePoint(fp, pt, a) {
    var x = pt.x - fp.x;
    var y = pt.y - fp.y;
    var xRot = x * Math.cos(a) + y * Math.sin(a);
    var yRot = y * Math.cos(a) - x * Math.sin(a);
    return new Point(fp.x + xRot, fp.y + yRot);
}