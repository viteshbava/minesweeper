let boxDim = "60px";
let gridWidth = 10; //boxes;
let gridHeight = 8; //boxes
let gridFontSize = "1rem";

let difficulty = "M"; // default medium

// bomb count

// timer

// difficulty drop down changes size of grid boxes

// number colors

// borders between boundaries

// responsive grid size

// transitions/animations on clicks

// #######################################################

// minesweeper game class
// constructor: div, dimensions, mines   ???

// box class
// constructor:
//// isDug (boolean, default FALSE)
//// hasMine (boolean, default FALSE)
//// hasFlag (boolean, default FALSE)
//// surrMines (integer, default 0)

// reset game
//// start timer
//// clear grid
//// generate grid UI
//// generate grid matrix (instantiate boxes)

// start game (upon box click)
//// start timer
//// generate mines
//// derive numbers
//// dig starting box

// dig box
//// update dig count
//// if mine, end game (loose)
//// if no surrounding mines, dig all surrounding undug boxes
//// if surrounding mines
////// show number
////// add/remove box borders
//// check game state

// flag box
//// toggle flag on box
//// update flag count
//// check game state

// check box
//// if box dug
////// if box fully flagged, dig all surrounding undug boxes
////// if box not fully flagged, highlight surrounding undug boxes

// change difficulty
// upate global variables
// reset game

// show number
//// get number from box and display in div
//// apply style to div based on number added

// add/remove box borders
//// if top, bottom, left or right box is undug, add green border
//// else remove green border

// generate mines
//// randomly define x mine positions (cannot be on or around starting box)
//// store mines in grid matrix

// derive numbers
//// loop through each mine and generate surrounding numbers

// check game state
//// check dig count against flag count
//// no more undug boxes and all flags placed, end game (win)

// end game (win or loose)
//// if win, show win screen
//// if loose,
////// reveal all boxes
////// show loose screen

// start timer
// start counting timer from zero

// ########################################################

const root = document.documentElement;
root.style.setProperty("--boxDim", boxDim);
root.style.setProperty("--gridWidth", gridWidth);
root.style.setProperty("--gridFontSize", gridFontSize);

const grid = document.querySelector(".ms_grid");

for (let i = 1; i <= gridHeight; i++) {
  const row = document.createElement("div");
  row.className = "ms_grid_row";
  grid.append(row);
  for (let j = 1; j <= gridWidth; j++) {
    const box = document.createElement("div");
    box.className = "ms_grid_row_box";
    row.append(box);
  }
}

const boxes = grid.querySelectorAll(".ms_grid_row_box");
grid.addEventListener("click", (e) => {
  console.log(boxIndex(e.target));
});

const boxIndex = (box) => Array.from(boxes).indexOf(box);

const st = getComputedStyle(root).getPropertyValue("--boxColor-2");
console.log(st);
boxes[2].style.color = st;

// :root {
//   --boxDim: 50px; //default if not set by javascript
//   --gridWidth: 10; //default if not set by javascript
//   --gridFontSize: 1rem;
//   --boxColor-1: $primary-blue;
//   --boxColor-2: $primary-green;
//   --boxColor-3: #d2001a;
//   --boxColor-4: #7d13a9;
//   --boxColor-5: #f204a1;
//   --boxColor-6: #f204a1;
// }
