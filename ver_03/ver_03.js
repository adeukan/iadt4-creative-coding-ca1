'use strict'

var outerCircles = [];
var innerCircles = [];

function setup() {
    let scale = 75;
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
}

function draw() {

    // stop looping
    noLoop();

    background(254);
    let numOfCols = 7;
    let numOfRows = 10;
    let tileSize = width / numOfCols;

    // grid and circles
    for (let gridY = -1; gridY <= numOfRows + 1; gridY++) {
        for (let gridX = -1; gridX <= numOfCols + 1; gridX++) {

            let x = gridX * tileSize;
            let y = gridY * tileSize;
            fill(0, 0, 0, 0);
            rect(x, y, tileSize, tileSize);

            // draw each next circle
            if (gridX % 2 !== 0 && gridY % 2 !== 0) {

                // array to store a row of outer circles
                if (!outerCircles[gridY + 1]) {
                    outerCircles[gridY + 1] = [];
                }

                // array to store a row of inner circles
                if (!innerCircles[gridY + 1]) {
                    innerCircles[gridY + 1] = [];
                }

                // in this version I use Circle objects instead of inner inner array
                // if (!outerCircles[gridY + 1][gridX + 1])   outerCircles[gridY + 1][gridX + 1] = [];

                // diameter of outer circle
                let d1 = 2.67 * tileSize;
                // circle center
                let centerX = x + tileSize / 2;
                let centerY = y;

                // draw inner and outer circles
                ellipse(centerX, centerY, d1, d1);
                ellipse(centerX, centerY, d1 / 2, d1 / 2);

                // push outer circle to the array
                let outerCircle = new Circle(centerX, centerY, d1 / 2);
                outerCircles[gridY + 1].push(outerCircle);

                // push inner circle to the array
                let innerCircle = new Circle(centerX, centerY, d1 / 4);
                innerCircles[gridY + 1].push(innerCircle);
            }
        }
    }


    // delete empty elements
    outerCircles = outerCircles.filter(function(el) {
        return el != null;
    });
    // delete empty elements
    innerCircles = innerCircles.filter(function(el) {
        return el != null;
    });

    console.log(outerCircles);

    // 1st outer circle
    fill('red');
    ellipse(outerCircles[2][2].x, outerCircles[2][2].y, outerCircles[2][2].r * 2);

    // 2nd outer circle
    fill('yellow');
    ellipse(outerCircles[3][2].x, outerCircles[3][2].y, outerCircles[3][2].r * 2);

    // 1st inner circle
    fill('yellow');
    ellipse(innerCircles[2][2].x, innerCircles[2][2].y, innerCircles[2][2].r * 2);

    // 2nd inner circle
    fill('red');
    ellipse(innerCircles[3][2].x, innerCircles[3][2].y, innerCircles[3][2].r * 2);

    // get intersection points
    let points = intersectionPoints(outerCircles[2][2], outerCircles[3][2]);

    // connect intersection points by the line
    strokeWeight(4);
    line(points[0].x, points[0].y, points[1].x, points[1].y);
}


// define a circle object
function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
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

    if (c1.r < c2.r) {
        r = c1.r;
        R = c2.r;
        cx = c1.x;
        cy = c1.y;
        Cx = c2.x;
        Cy = c2.y;
    } else {
        r = c2.r;
        R = c1.r;
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