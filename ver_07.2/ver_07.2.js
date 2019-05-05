'use strict'
let topColors = [];
let lowColors = [];
let outerCircles = [];
let innerCircles = [];
let numOfCols = 7;
let numOfRows = 10;
let actRandomSeed = 0;
// selected offset value
let offsetSize = 3;
let interPoint;
let d;

function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
}

function draw() {

    clear();
    noLoop();
    let tileSize = width / numOfCols;
    shakeColors();

    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        outerCircles[gridX] = [];
        innerCircles[gridX] = [];

        for (let gridY = 0; gridY <= numOfRows + offsetSize; gridY++) {

            let centerX = gridX * tileSize;
            let centerY = gridY * tileSize;
            d = 1.33 * tileSize;

            let outerPos = map(gridY, 0, numOfRows, 0, 1);
            let outerColor = lerpColor(topColors[gridX], lowColors[gridX], outerPos);
            let innerPos = map(gridY, 0, numOfRows, 0, 1);
            let innerColor = lerpColor(topColors[gridX], lowColors[gridX], innerPos);
            // interpolation is temporary removed (topColors[gridX] instead of outerColor)
            let outerCircle = new Circle(centerX, centerY, d, topColors[gridX]);
            let innerCircle = new Circle(centerX, centerY, d / 2, innerColor);
            outerCircles[gridX].push(outerCircle);
            innerCircles[gridX].push(innerCircle);

            // the palette will be created in another way
            // palette.push(outerCircle.c);

            if (gridX === 0 && gridY === 1) {
                let points = getIntersectPoints(outerCircles[gridX][gridY], outerCircles[gridX][gridY - 1]);
                interPoint = points[0];
            }
        }
    }

    // fill the palette by moving through the ROWS of circles (including outside the canvas)
    let palette = [];
    for (let i = 0; i <= numOfCols; i++) {
        for (let j = 0; j < outerCircles.length; j++) {
            palette.push(outerCircles[j][i].c);
        }
    }


    // draw
    let colorCounter = 0;
    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        outerCircles[gridX].forEach(function(circle, index) {

            // in this version we don't need to control hidden rows of circles
            // let BreakException = {};
            // try {
            //     if (index > numOfRows) throw BreakException;

            let colorIndex = colorCounter % palette.length;
            fill(palette[colorIndex]);
            ellipse(circle.x, circle.y, circle.d, circle.d);
            colorCounter++;

            // } catch (e) {
            //     if (e !== BreakException) throw e;
            // }
        });
    }

    drawArcs();
}

function mouseReleased() {

    actRandomSeed = random(100000);

    // select the optimal offset
    offsetSize++;
    console.log(offsetSize);

    loop();
}

function shakeColors() {

    randomSeed(actRandomSeed);

    let topHue;
    let lowHue;
    let mult = 3;

    for (let i = 0; i <= numOfCols * mult; i++) {
        if (i === 0) {
            topHue = random(360);
            topColors[i] = color(topHue, 100, 100);

        } else if (i < 4) {
            topHue += 90;
            topHue = topHue > 360 ? topHue - 360 : topHue;
            topColors[i] = color(topHue, 100, 100);
            lowColors[i] = topColors[i - 1];
        } else {
            topColors[i] = topColors[i - 4];
            lowColors[i] = topColors[i - 1];
        }

        if (i === numOfCols * mult) {
            lowColors[0] = topColors[numOfCols];
        }
    }
}

function drawArcs() {
    for (let i = 0; i < outerCircles.length; i++) {
        for (let j = 0; j < outerCircles[i].length; j++) {

            if (i === 0 && j === 0) {
                var centX = outerCircles[i][j + 1].x;
                var centY = outerCircles[i][j + 1].y;
                let px = interPoint.x;
                let py = interPoint.y;
                var angle = atan((py - centY) / (px - centX));
            }
            centX = outerCircles[i][j].x;
            centY = outerCircles[i][j].y;
            stroke(180);
            fill(180);
            arc(centX, centY, d, d, PI + angle, -angle, CHORD);
            arc(centX, centY, d, d, angle, PI - angle, CHORD);
            arc(centX, centY, d, d, -PI / 2 + angle, PI / 2 - angle, CHORD);
            arc(centX, centY, d, d, PI / 2 + angle, -PI / 2 - angle, CHORD);
        }
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