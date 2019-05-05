'use strict'
let topColors = [];
let lowColors = [];
let numOfCols = 7;
let numOfRows = 10;
let interPoint;
let d;

// they are global again :) 
let outerCircles = [];
let innerCircles = [];

// pseudo random set number
let actRandomSeed = 0;
// creates additional hidden columns, allows to control the offset
let offsetSize = 0;



function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
    // no stroke anymore
    noStroke();
    // moved to draw()
    // shakeColors();
}

function draw() {

    clear();
    noLoop();
    let tileSize = width / numOfCols;

    // colour palette
    let palette = [];

    // moved here to enable pseudo-random sets
    shakeColors();

    // they are global again :) 
    // var outerCircles = [];
    // var innerCircles = [];

    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        outerCircles[gridX] = [];
        innerCircles[gridX] = [];

        // now the loop can draw additional hidden rows (offsetSize)
        for (let gridY = 0; gridY <= numOfRows + offsetSize; gridY++) {

            let centerX = gridX * tileSize;
            let centerY = gridY * tileSize;
            d = 1.33 * tileSize;

            // [numOfRows - gridY] try later !
            // use vertical position of outer circle to get its interpolation colour
            let outerPos = map(gridY, 0, numOfRows, 0, 1);
            let outerColor = lerpColor(topColors[gridX], lowColors[gridX], outerPos);

            // use vertical position of inner circle to get its interpolation colour
            let innerPos = map(gridY, 0, numOfRows, 0, 1);
            let innerColor = lerpColor(topColors[gridX], lowColors[gridX], innerPos);

            let outerCircle = new Circle(centerX, centerY, d, outerColor);
            // let innerCircle = new Circle(centerX, centerY, d / 2, innerColor);
            outerCircles[gridX].push(outerCircle);
            // innerCircles[gridX].push(innerCircle);

            // strokeWeight(1);
            // stroke(0);
            // blendMode(ADD);

            // this loop is not used for drawing anymore
            // fill(outerCircle.c, 100);
            // ellipse(outerCircle.x, outerCircle.y, outerCircle.d, outerCircle.d);
            // fill(innerCircle.c, 0);
            // ellipse(innerCircle.x, innerCircle.y, innerCircle.d, innerCircle.d);

            palette.push(outerCircle.c);

            if (gridX === 0 && gridY === 1) {
                let points = getIntersectPoints(outerCircles[gridX][gridY], outerCircles[gridX][gridY - 1]);
                interPoint = points[0];
            }
        }
    }

    // index of currently used palette colour
    let colorCounter = 0;

    // redraw canvas with the offset
    for (let gridX = 0; gridX <= numOfCols; gridX++) {

        // redraw all circles excluding the circles outside the canvas
        outerCircles[gridX].forEach(function(circle, index) {

            // draw only visible circles in every column,
            // but still use all the colors from the palette consistently
            let BreakException = {};
            try {
                // break drawing the column if circle is outside the canvas
                if (index > numOfRows) throw BreakException;

            // color index should not exceed the palette range
            let colorIndex = colorCounter % palette.length;

            // draw circles
            fill(palette[colorIndex]);
            ellipse(circle.x, circle.y, circle.d, circle.d);

            colorCounter++;

            } catch (e) {
                if (e !== BreakException) throw e;
            }
        });
    }

    // draw arcs
    drawArcs();
}

// change the set of pseudo-random numbers used to generate top\lower colour pairs
function mouseReleased() {

    // actRandomSeed = random(100000);

    // select the optimal offset
    offsetSize++;
    console.log(offsetSize);

    loop();
}

function shakeColors() {

    randomSeed(actRandomSeed);

    let topHue;
    let lowHue;

    // a larger multiplier gives more colours and offset combinations
    let mult = 3;

    // in order for the offset to work properly,
    // the number of top\lower colour pairs must exceed the number of columns
    for (let i = 0; i <= numOfCols * mult; i++) {

        // 1st circle in the top row has random colour 
        if (i === 0) {
            topHue = random(360);
            topColors[i] = color(topHue, 100, 100);

            // next 3 circles in the top row complete the square colour scheme based on the 1st random colour
            // each next lower colour equal to previous top
        } else if (i < 4) {

            // quare colour scheme
            topHue += 90;
            topHue = topHue > 360 ? topHue - 360 : topHue;

            topColors[i] = color(topHue, 100, 100);
            lowColors[i] = topColors[i - 1];
            // all the rest colours are based on previous
        } else {
            topColors[i] = topColors[i - 4];
            lowColors[i] = topColors[i - 1];
        }

        if (i === numOfCols * mult) {
            lowColors[0] = topColors[numOfCols];
        }
    }
}

// put the code for drawing arcs in a separate function
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