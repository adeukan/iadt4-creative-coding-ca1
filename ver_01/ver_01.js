'use strict'

// multipliers for diameters, depend on mouse position
var mult1, mult2;
// circle or ellipse
var circleMode = true;

function setup() {

    let scale = 75;
    // A4 format (7x10)
    createCanvas(7 * scale, 10 * scale);
    colorMode(HSB, 360, 100, 100, 100);
}

function draw() {

    background(254);

    let numOfCols = 7;
    let numOfRows = 10;
    // tile width and height
    let tileSize = width / numOfCols;

    // grid and circles
    // start drawing from outside the canvas to fill the canvas in full
    for (let gridY = -1; gridY <= numOfRows + 1; gridY++) {
        for (let gridX = -1; gridX <= numOfCols + 1; gridX++) {

            // rect start point
            let x = gridX * tileSize;
            let y = gridY * tileSize;

            // transparent rect
            fill(0, 0, 0, 0);
            rect(x, y, tileSize, tileSize);

            // draw circles
            if (gridX % 2 !== 0 && gridY % 2 !== 0) {

                // generate multipliers for diameters 
                mult1 = map(mouseX, 0, width - 1, 2.25, 17);
                mult2 = map(mouseY, 0, width - 1, 2.25, 17);

                // calculate diameters
                let d1 = mult1 * tileSize;
                let d2 = mult2 * tileSize;

                // draw circle or ellipse
                if (circleMode) {
                    // shift X for symmetry
                    ellipse(x + tileSize / 2, y, d1, d1);
                } else {
                    // shift X for symmetry
                    ellipse(x + tileSize / 2, y, d1, d2);
                }
            }
        }
    }
}

function mouseReleased() {

    // display multipliers
    console.log(`mult1 ${mult1.toFixed(2)} mult2 ${mult2.toFixed(2)}`);

}

function keyReleased() {

    // save canvas, use multipliers in the file name
    if (key == 's' || key == 'S') saveCanvas(`m1 ${mult1.toFixed(2)} m2 ${mult2.toFixed(2)}`, 'png');

    // circle mode
    if (key == '1') {
        circleMode = true;
    }

    // ellipse mode
    if (key == '2') {
        circleMode = false;
    }
}
