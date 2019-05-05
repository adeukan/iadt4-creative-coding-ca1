'use strict'
let topColors = [];
let lowColors = [];
let outerCircles = [];
let innerCircles = [];
let numOfCols = 7;
let numOfRows = 10;
let interPoint;
let d;
// selected values
let actRandomSeed = 62026.5947887674;
let offsetSize = 7;

function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
}

function draw() {

    noLoop();
    clear();
    shakeColors();

    let tileSize = width / numOfCols;
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
            // interpolation is back now
            let outerCircle = new Circle(centerX, centerY, d, outerColor);
            let innerCircle = new Circle(centerX, centerY, d / 2.5, innerColor);

            outerCircles[gridX].push(outerCircle);
            innerCircles[gridX].push(innerCircle);

            if (gridX === 0 && gridY === 1) {
                let points = getIntersectPoints(outerCircles[gridX][gridY], outerCircles[gridX][gridY - 1]);
                interPoint = points[0];
            }
        }
    }

    let palette = [];
    for (let i = 0; i <= numOfCols; i++) {
        for (let j = 0; j < outerCircles.length; j++) {
            palette.push(outerCircles[j][i].c);
        }
    }

    let colorCounter = 0;
    for (let gridX = 0; gridX <= numOfCols; gridX++) {
        outerCircles[gridX].forEach(function(circle, index) {
            let colorIndex = colorCounter % palette.length;
            fill(palette[colorIndex]);
            ellipse(circle.x, circle.y, circle.d, circle.d);
            colorCounter++;
        });
    }

    // reverse palette for inner circles
    let reversePalette = [];
    for (let i = 0; i <= numOfCols; i++) {
        for (let j = 0; j < outerCircles.length; j++) {
            reversePalette.push(outerCircles[j][i].c);
        }
    }
    reversePalette.reverse();

    // draw inner circles using reverse palette
    colorCounter = 0;
    for (let gridX = 0; gridX <= numOfCols; gridX++) {
        innerCircles[gridX].forEach(function(circle, index) {
            let colorIndex = colorCounter % palette.length;
            fill(reversePalette[colorIndex]);
            ellipse(circle.x, circle.y, circle.d, circle.d);
            colorCounter++;
        });
    }

    drawArcs('white');
    drawArcs('yesGrad');
}

function drawArcs(grad) {

    // if gradient is used
    if (grad === 'yesGrad') {
        // get context
        var ctx = drawingContext;

        // create radial gradient
        // inner circle at the centre of canvas, radius 50
        // outer circle at the centre of canvas, radius height
        var gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, height);

        // use 4 basic lolours with reduced alpha to create gradient stops
        for (let i = 0; i < 4; i++) {

            let stop = map(i, 0, 3, 0, 1);

            let h = hue(topColors[i]);
            let s = saturation(topColors[i]);
            let b = brightness(topColors[i]);
            let a = alpha(topColors[i]) - 90;
            let stopColor = color(h, s, b, a);

            gradient.addColorStop(stop, stopColor);
        }
    }

    // draw arcs
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

            if (grad === 'yesGrad') {
                // set the fill style to gradient
                ctx.fillStyle = gradient;
                ctx.fill();
            } else {
                // clear vesica piscis
                fill(180);
            }

            // // strange behaviour if use just 4 arcs, one of them changes the colour
            // arc(centX, centY, d, d, angle, PI - angle, CHORD);
            // arc(centX, centY, d, d, PI + angle, -angle, CHORD);
            // arc(centX, centY, d, d, -PI / 2 + angle, PI / 2 - angle, CHORD);
            // arc(centX, centY, d, d, PI / 2 + angle, -PI / 2 - angle, CHORD);

            // duplicate arcs 1,2 and 3 to get the similar result with arc 4
            arc(centX, centY, d, d, angle, PI - angle, CHORD); //1
            arc(centX, centY, d, d, PI + angle, 2 * PI - angle, CHORD); //2
            arc(centX, centY, d, d, PI * 1.5 + angle, PI / 2 - angle, CHORD); //3
            arc(centX, centY, d, d, angle, PI - angle, CHORD); //1 copy
            arc(centX, centY, d, d, PI + angle, 2 * PI - angle, CHORD); //2 copy
            arc(centX, centY, d, d, PI * 1.5 + angle, PI / 2 - angle, CHORD); //3 copy
            arc(centX, centY, d, d, PI / 2 + angle, PI * 1.5 - angle, CHORD); //4
        }
    }
}

function mouseReleased() {

    actRandomSeed = random(100000);
    console.log(actRandomSeed);

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
            topColors[i] = color(topHue, 90, 90);

        } else if (i < 4) {

            // set different saturation and brightness
            let S = i * 20 + 30;
            let B = i * 20 + 30;

            topHue += 90;
            topHue = topHue > 360 ? topHue - 360 : topHue;
            topColors[i] = color(topHue, S, B);
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