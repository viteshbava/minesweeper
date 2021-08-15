const DEFAULT_MODE = "medium";
const SETTINGS = {
  easy: {
    boxDim: "60px",
    gridWidth: 10,
    gridHeight: 8,
    totalMines: 10,
  },
  medium: {
    boxDim: "40px",
    gridWidth: 18,
    gridHeight: 14,
    totalMines: 40,
  },
  hard: {
    boxDim: "30px",
    gridWidth: 30,
    gridHeight: 20,
    totalMines: 100,
  },
};

const root = document.documentElement;
const gameMode = document.querySelector("#mode");
const grid = document.querySelector(".ms_grid");

let settings = {};
let grid_rows = [];
let gameStarted;
let dugBoxes = 0;

let mines = []; //MAY NOT NEED THIS?

// box class
let boxes = [];
class Box {
  constructor(row, col, uiBox) {
    this.isDug = false;
    this.hasMine = false;
    this.hasFlag = false;
    this.surrMines = 0;
    this.pos = {
      row: row,
      col: col,
    };
    this.uiBox = uiBox;
    this.neighbours = [];
  }

  // get surrounding, undug, unflagged boxes
  getSurrBoxes() {
    return settings;
  }
}

(function () {
  // set game mode drop down default value in HTML to show default mode defined in this javascript file
  Array.from(gameMode)
    .find((m) => m.value === DEFAULT_MODE)
    .setAttribute("selected", true);
  // reset game based on default mode
  resetGame(SETTINGS[DEFAULT_MODE]);
})();

// const st = getComputedStyle(root).getPropertyValue("--boxColor-2");
// boxes[2].style.color = st;

// reset game
function resetGame(params) {
  settings = params;
  gameStarted = false;
  mines = []; // MAY NOT NEED THIS?
  // check numbers supplied are valid
  if (settings.totalMines > settings.gridHeight * settings.gridWidth)
    throw new Error("Too many mines for grid size!");
  //// clear grid
  while (grid.firstChild) grid.removeChild(grid.lastChild);
  boxes = [];
  grid_rows = [];
  //// generate grid UI and box matrix
  root.style.setProperty("--boxDim", settings.boxDim);
  for (let i = 0; i < settings.gridHeight; i++) {
    const row = document.createElement("div");
    const boxRow = [];
    row.className = "ms_grid_row";
    grid.append(row);
    grid_rows.push(row);
    for (let j = 0; j < settings.gridWidth; j++) {
      const box = document.createElement("div");
      box.className = "ms_grid_row_box";
      row.append(box);
      boxRow.push(new Box(i, j, box));
    }
    boxes.push(boxRow);
  }
  // generate neighbour pointer array for each box
  generateNeighbourPointers();
}

// generate neighbour pointer array for each box
function generateNeighbourPointers() {
  for (const rowOfBoxes of boxes) {
    for (const box of rowOfBoxes) {
      const n = box.neighbours;
      const { row, col } = box.pos;
      if (row !== 0) n.push(boxes[row - 1][col]); // get the top box
      if (row < settings.gridHeight - 1) n.push(boxes[row + 1][col]); // get the bottom box
      if (col !== 0) n.push(boxes[row][col - 1]); // get the left box
      if (col < settings.gridWidth - 1) n.push(boxes[row][col + 1]); // get the right box
      if (row !== 0 && col !== 0) n.push(boxes[row - 1][col - 1]); // get top left corner
      if (row !== 0 && col < settings.gridWidth - 1)
        n.push(boxes[row - 1][col + 1]); // get top right corner
      if (row < settings.gridHeight - 1 && col !== 0)
        n.push(boxes[row + 1][col - 1]); // get bottom left corner
      if (row < settings.gridHeight - 1 && col < settings.gridWidth - 1)
        n.push(boxes[row + 1][col + 1]); // get bottom right corner
    }
  }
}

// dig box upon click
grid.addEventListener("click", (e) => {
  const box = getClickedBox(e.target);
  if (!box) return;
  if (!gameStarted) startGame(box);
  // dig box
  digBox(box);
});

// dig box
function digBox(box) {
  // abort if box is already dug
  if (box.isDug) return;
  //// update box and dig count
  box.isDug = true;
  box.uiBox.classList.add("dug");
  updateBorders(box);
  dugBoxes++;
  //// if box has mine, end game (loose)
  if (box.hasMine) {
    endGame.loose();
    return;
  }
  //// get/store number of surrounding mines
  box.surrMines = box.neighbours.reduce(
    (total, n) => (n.hasMine ? ++total : total),
    0
  );
  //// if surrounding boxes fully flagged, dig all surrounding undug/unflagged boxes

  //// if surrounding boxes not yet fully flagged
  ////// show number
  ////// add/remove box borders
  //// check game state
}

// start game
function startGame(box) {
  gameStarted = true;
  //// start timer
  // ????
  //// generate mines

  generateMines(box);
  for (const m of mines) {
    m.uiBox.classList.add("dug", "fas", "fa-bomb"); // TAKE OUT
  }
  //// derive numbers [NOT NEEDED?]
}

// flag box
//// toggle flag on box
//// update flag count
//// check game state

// check box
//// if box dug
//// if surrounding boxes fully flagged, dig all surrounding undug/unflagged boxes
//// if surrounding boxes not yet fully flagged, highlight surrounding undug/unflagged boxes

// change difficulty
gameMode.addEventListener("change", () => resetGame(SETTINGS[gameMode.value]));

// for a given clicked element in the grid, return the correpsonding box object
function getClickedBox(el) {
  const clickedBox = el.closest(".ms_grid_row_box");
  const clickedRow = el.closest(".ms_grid_row");
  if (!clickedBox || !clickedRow) return;
  const clickedRowBoxes = clickedRow.querySelectorAll(".ms_grid_row_box");
  const box = Array.from(clickedRowBoxes).indexOf(clickedBox);
  const row = grid_rows.indexOf(clickedRow);
  return boxes[row][box];
}

// show number
//// get number from box and display in div
//// apply style to div based on number added

// add/remove box borders
//// if top, bottom, left or right box is undug, add green border
//// else remove green border
function updateBorders(box) {
  // if ()

  // add border to top if box above exists and is undug, else remove border
  boxes[box.pos.row - 1] && !boxes[box.pos.row - 1][box.pos.col].isDug
    ? box.uiBox.classList.add("border_top")
    : boxes[box.pos.row - 1][box.pos.col].uiBox.classList.remove(
        "border_bottom"
      );
  // add border to bottom if box below exists and is undug, else remove border
  boxes[box.pos.row + 1] && !boxes[box.pos.row + 1][box.pos.col].isDug
    ? box.uiBox.classList.add("border_bottom")
    : boxes[box.pos.row + 1][box.pos.col].uiBox.classList.remove("border_top");
}

// generate mines
function generateMines(startingBox) {
  // array of tests that determine if a box can contain a mine
  const mineTests = [
    // cannot place mine in the clicked box
    (box) => box !== startingBox,
    // cannot place mine in the neighbour of a clicked box
    (box) => !startingBox.neighbours.includes(box),
    // cannot place mine in box that already has a mine
    (box) => !box.hasMine,
  ];
  let m = 0;
  while (m < settings.totalMines) {
    const randRow = Math.floor(Math.random() * settings.gridHeight);
    const randCol = Math.floor(Math.random() * settings.gridWidth);
    const randBox = boxes[randRow][randCol];
    if (mineTests.every((test) => test(randBox))) {
      randBox.hasMine = true;
      mines.push(randBox);
      m++;
    }
  }
}

// derive numbers [NOT NEEDED?]
//// loop through each mine and generate surrounding numbers

// check game state
//// check dig count against flag count
//// no more undug boxes and all flags placed, end game (win)

// end game (win or loose)
//// if win, show win screen
//// if loose,
////// reveal all boxes
////// show loose screen
const endGame = {
  loose: () => {
    console.log("You loose!");
  },
  win: () => {
    console.log("You win!");
  },
};

// start timer
// start counting timer from zero

// ########################################################
// #######################################################

// bomb count

// timer

// difficulty drop down changes size of grid boxes

// number colors

// borders between boundaries

// responsive grid size

// transitions/animations on clicks

// #######################################################
