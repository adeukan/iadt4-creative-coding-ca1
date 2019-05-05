'use strict'

// var mult1, mult2;
// var circleMode = true;
var array = [];

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

            // circles in a row
            if (gridX % 2 !== 0 && gridY % 2 !== 0) {

                // inner array contains rows
                if (!array[gridY + 1]) array[gridY + 1] = [];
                // inner inner array contains circles
                if (!array[gridY + 1][gridX + 1]) array[gridY + 1][gridX + 1] = [];

                // in this version we use some specific multipliers
                // mult1 = map(mouseX, 0, width - 1, 2.25, 17);
                // mult2 = map(mouseY, 0, width - 1, 2.25, 17);

                // set diameters using specific pair of multipliers
                let d1 = 2.67 * tileSize;
                // let d2 = 4.14 * tileSize;

                // if (circleMode) {

                  let centerX = x + tileSize / 2;
                  let centerY = y;

                  ellipse(centerX, centerY, d1, d1);

                  array[gridY + 1][gridX + 1].push([centerX, centerY]);

                // } else {
                //     ellipse(x + tileSize / 2, y, d1, d2);
                // }
            }
        }
    }

    // delete empty elements from outer array
    array = array.filter(function(el) {
        return el != null;
    });
    // delete empty elements from inner array
    for (let i = 0; i < 7; i++) {
        array[i] = array[i].filter(function(el) {
            return el != null;
        });
    }

    // display array
    console.log(array);
}


// function mouseReleased() {
//     console.log(`mult1 ${mult1.toFixed(2)} mult2 ${mult2.toFixed(2)}`);
// }

// function keyReleased() {
//     if (key == 's' || key == 'S') saveCanvas(`m1 ${mult1.toFixed(2)} m2 ${mult2.toFixed(2)}`, 'png');
//     if (key == '1') circleMode = true;
//     if (key == '2') circleMode = false;  
// }
