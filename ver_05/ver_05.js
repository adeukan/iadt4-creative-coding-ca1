'use strict'
var outCircles = [];
var inCircles = [];
var topColor = [];
var lowerColor = [];

// temporarily increase the circles
let numOfCols = 7;
let numOfRows = 10;

// stores intersection points
var pointsArray = [];

var drawMode = 'circles';

function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
    shakeColors();
}

function draw() {

    clear();

    noLoop();
    let tileSize = width / numOfCols;

    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        // this code was moved here from inner loop
        outCircles[gridX] = [];
        inCircles[gridX] = [];
        // one column of intersection points
        pointsArray[gridX] = [];

        for (let gridY = 0; gridY <= numOfRows; gridY++) {

            let centerX = gridX * tileSize;
            let centerY = gridY * tileSize;
            var d = 1.33 * tileSize;

            var colorPos = map(gridY, 0, numOfRows, 0, 1);
            var interColor = lerpColor(topColor[gridX], lowerColor[gridX], colorPos);

            let outCircle = new Circle(centerX, centerY, d, interColor);
            outCircles[gridX].push(outCircle);
            let inCircle = new Circle(centerX, centerY, d / 2, interColor);
            inCircles[gridX].push(inCircle);

            // set stroke back to default
            strokeWeight(1);
            stroke(0);

            blendMode(MULTIPLY);
            fill(inCircle.c, 0);
            ellipse(inCircle.x, inCircle.y, inCircle.d, inCircle.d);
            fill(outCircle.c, 0);
            ellipse(outCircle.x, outCircle.y, outCircle.d, outCircle.d);

            // get intersection points and put them into array
            if (gridY > 0) {
                let points = getIntersectPoints(outCircles[gridX][gridY], outCircles[gridX][gridY - 1]);
                pointsArray[gridX].push(points);
            }
        }
    }

    // click mouse to check intersection points 
    if (drawMode == 'points') {
        pointsArray.forEach(function(column) {
            column.forEach(function(points) {

                // set default blend mode
                blendMode(BLEND);
                // draw white bold points
                stroke(180);
                strokeWeight(3);
                point(points[0].x, points[0].y);
                point(points[1].x, points[1].y);
            });
        });
    }
}

// used to check intersection points
function mouseReleased() {

    // switch to points draw mode
    drawMode = drawMode === 'circles' ? 'points' : 'circles';
    loop();
}

function shakeColors() {
    for (var i = 0; i <= numOfCols; i++) {
        topColor[i] = color(random(360), random(360), random(360));
        lowerColor[i] = color(random(0, 360), random(0, 360), random(0, 360));
    }
}

function Circle(x, y, d, c) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.c = c;
}

function getIntersectPoints(c1, c2) {
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
    dx = cx - Cx;
    dy = cy - Cy;
    d = Math.sqrt(dx * dx + dy * dy);
    if (d < EPS && Math.abs(R - r) < EPS) return [];
    else if (d < EPS) return [];
    var x = (dx / d) * R + Cx;
    var y = (dy / d) * R + Cy;
    var P = new Point(x, y);
    if (Math.abs((R + r) - d) < EPS || Math.abs(R - (r + d)) < EPS) return [P];
    if ((d + r) < R || (R + r < d)) return [];
    var C = new Point(Cx, Cy);
    var angle = acossafe((r * r - d * d - R * R) / (-2.0 * d * R));
    var pt1 = rotatePoint(C, P, +angle);
    var pt2 = rotatePoint(C, P, -angle);
    return [pt1, pt2];
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function acossafe(x) {
    if (x >= +1.0) return 0;
    if (x <= -1.0) return Math.PI;
    return Math.acos(x);
}

function rotatePoint(fp, pt, a) {
    var x = pt.x - fp.x;
    var y = pt.y - fp.y;
    var xRot = x * Math.cos(a) + y * Math.sin(a);
    var yRot = y * Math.cos(a) - x * Math.sin(a);
    return new Point(fp.x + xRot, fp.y + yRot);
}