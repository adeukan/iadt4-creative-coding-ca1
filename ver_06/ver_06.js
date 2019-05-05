'use strict'

let topColor = [];
let lowerColor = [];
let numOfCols = 7;
let numOfRows = 10;

// no reasons to define them globaly
// let outCircles = [];
// let inCircles = [];

// now, just one single intersection point is used, no need for an array
// var pointsArray = [];


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

    // no longer global
    let outCircles = [];
    let inCircles = [];

    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        outCircles[gridX] = [];
        inCircles[gridX] = [];
        // now, just one single intersection point is used, no need for an array
        // pointsArray[gridX] = [];

        for (let gridY = 0; gridY <= numOfRows; gridY++) {

            let centerX = gridX * tileSize;
            let centerY = gridY * tileSize;
            var d = 1.33 * tileSize;

            let colorPos = map(gridY, 0, numOfRows, 0, 1);
            let interColor = lerpColor(topColor[gridX], lowerColor[gridX], colorPos);

            let outCircle = new Circle(centerX, centerY, d, interColor);
            outCircles[gridX].push(outCircle);
            let inCircle = new Circle(centerX, centerY, d / 2, interColor);
            inCircles[gridX].push(inCircle);

            strokeWeight(1);
            stroke(0);
            blendMode(MULTIPLY);
            fill(inCircle.c, 0);
            ellipse(inCircle.x, inCircle.y, inCircle.d, inCircle.d);
            fill(outCircle.c, 0);
            ellipse(outCircle.x, outCircle.y, outCircle.d, outCircle.d);

            // get one single intersection point to calculate the angle for drawing arcs
            if (gridX === 0 && gridY === 1) {
                let points = getIntersectPoints(outCircles[gridX][gridY], outCircles[gridX][gridY - 1]);
                // left intersection point between circle[0] and circle[1] in the 1st column
                // this point will be used to calculate arcs angle
                var interPoint = points[0];
            }
        }
    }

    // drawing arcs
    for (let i = 0; i < outCircles.length; i++) {
        for (let j = 0; j < outCircles[i].length; j++) {

            // default
            blendMode(BLEND);

            // runs just once to calculate the arc angle
            if (i === 0 && j === 0) {

                // we must use the same circle for which we previously found the intersection point (in line 61)
                // otherwise, the calculation of the angle will be incorrect
                var centX = outCircles[i][j + 1].x;
                var centY = outCircles[i][j + 1].y;

                let px = interPoint.x;
                let py = interPoint.y;
                // arctangent is used to find angle
                var angle = atan((py - centY) / (px - centX));
            }

            // center of the arcs to be drawn
            centX = outCircles[i][j].x;
            centY = outCircles[i][j].y;

            stroke(50);
            fill(50);
            // top arc
            arc(centX, centY, d, d, PI + angle, -angle, CHORD);
            // lower arc
            arc(centX, centY, d, d, angle, PI - angle, CHORD);
            // right arc
            arc(centX, centY, d, d, -PI / 2 + angle, PI / 2 - angle, CHORD);
            // left arc
            arc(centX, centY, d, d, PI / 2 + angle, -PI / 2 - angle, CHORD);
        }
    }
}

function shakeColors() {
    for (let i = 0; i <= numOfCols; i++) {
        topColor[i] = color(random(360), random(360), random(360));
        lowerColor[i] = color(random(0, 360), random(0, 360), random(0, 360));
    }
}

function keyPressed() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
}

function Circle(x, y, d, c) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.c = c;
}

function getIntersectPoints(c1, c2) {
    let EPS = 0.0000001;
    let r, R, d, dx, dy, cx, cy, Cx, Cy;
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
    let x = (dx / d) * R + Cx;
    let y = (dy / d) * R + Cy;
    let P = new Point(x, y);
    if (Math.abs((R + r) - d) < EPS || Math.abs(R - (r + d)) < EPS) return [P];
    if ((d + r) < R || (R + r < d)) return [];
    let C = new Point(Cx, Cy);
    let angle = acossafe((r * r - d * d - R * R) / (-2.0 * d * R));
    let pt1 = rotatePoint(C, P, +angle);
    let pt2 = rotatePoint(C, P, -angle);
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
    let x = pt.x - fp.x;
    let y = pt.y - fp.y;
    let xRot = x * Math.cos(a) + y * Math.sin(a);
    let yRot = y * Math.cos(a) - x * Math.sin(a);
    return new Point(fp.x + xRot, fp.y + yRot);
}