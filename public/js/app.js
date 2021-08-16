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
const restartBtn = document.querySelector("#restart");
const flagCount = document.querySelector("#flag-count");
const time = document.querySelector("#timer");
const pointerCatch = document.querySelector(".pointer-catch");
const grid = document.querySelector(".ms_grid");

let settings = {};
let grid_rows = [];
let gameStarted;
let dugBoxes;
let unflaggedMines;

let mines = [];
let flags = [];

// #############################################################################
// #############################################################################
// BOX CLASS
// #############################################################################
// #############################################################################

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
    this.neighbours = {};
    this.allNeighbours = [];
  }

  // generate neighbour pointer array for each box
  findNeighbours() {
    const n = this.neighbours;
    const { row, col } = this.pos;
    if (row !== 0) n.top = boxes[row - 1][col]; // get the top box
    if (row < settings.gridHeight - 1) n.bottom = boxes[row + 1][col]; // get the bottom box
    if (col !== 0) n.left = boxes[row][col - 1]; // get the left box
    if (col < settings.gridWidth - 1) n.right = boxes[row][col + 1]; // get the right box
    if (row !== 0 && col !== 0) n.topleft = boxes[row - 1][col - 1]; // get top left corner
    if (row !== 0 && col < settings.gridWidth - 1)
      n.topright = boxes[row - 1][col + 1]; // get top right corner
    if (row < settings.gridHeight - 1 && col !== 0)
      n.bottomleft = boxes[row + 1][col - 1]; // get bottom left corner
    if (row < settings.gridHeight - 1 && col < settings.gridWidth - 1)
      n.bottomright = boxes[row + 1][col + 1]; // get bottom right corner
    // add all neighbours to allNeighbours array
    this.allNeighbours = Object.values(n);
  }

  // getarray of all neighbours that are unflagged/undug
  getUnflaggedNeighbours() {
    return this.allNeighbours.filter((n) => !n.isDug && !n.hasFlag);
  }

  // toggle highlight all unflagged/undug neighbours
  checkToggleHighlight() {
    for (const n of this.getUnflaggedNeighbours())
      n.uiBox.classList.toggle("highlight");
  }

  getNumFlaggedNeighbours() {
    return this.allNeighbours.reduce(
      (total, n) => (n.hasFlag ? ++total : total),
      0
    );
  }

  // calculate and reveal mine count
  showMineCount() {
    // get/store number of surrounding mines
    this.surrMines = this.allNeighbours.reduce(
      (total, n) => (n.hasMine ? ++total : total),
      0
    );
    // if greater than 0, show the number, otherwise leave blank
    if (this.surrMines > 0) {
      this.uiBox.textContent = this.surrMines;
      this.uiBox.classList.add("num");
      this.uiBox.style.color = getComputedStyle(root).getPropertyValue(
        `--boxColor-${this.surrMines}`
      );
    }
  }

  // show bomb
  showBomb() {
    if (!this.hasFlag) {
      this.findNeighbours();
      this.uiBox.classList.add("dug", "fas", "fa-bomb");
      this.isDug = true;
      updateBorders(this);
    }
  }

  // ignite bomb
  igniteBomb() {
    this.uiBox.style.color = "#ff0000";
    this.uiBox.style.backgroundColor = "#ffff00";
  }
}

// timer
class Timer {
  start() {
    this.timerID = setInterval(() => {
      time.textContent = ("00" + ++this.time).slice(-3);
    }, 1000);
  }
  stop() {
    clearInterval(this.timerID);
  }
  reset() {
    timer.stop();
    this.time = 0;
    time.textContent = ("00" + this.time).slice(-3);
  }
}
const timer = new Timer();

// #############################################################################
// #############################################################################
// EVENT LISTENERS
// #############################################################################
// #############################################################################

let leftButtonDown = false;
let rightButtonDown = false;

// check surrounding boxes upon both left & right mouse button click
grid.addEventListener("mousedown", (e) => {
  // left mouse down
  if (e.button === 0) leftButtonDown = true;
  // right mouse down
  if (e.button === 2) rightButtonDown = true;
  if (leftButtonDown && rightButtonDown) {
    const box = getClickedBox(e.target);
    checkBox(box);
  }
});
grid.addEventListener("mouseup", (e) => {
  if (leftButtonDown && rightButtonDown) {
    const box = getClickedBox(e.target);
    box.checkToggleHighlight();
  }
  // left mouse up
  if (e.button === 0) leftButtonDown = false;
  // right mouse up
  if (e.button === 2) rightButtonDown = false;
});

// dig box upon click
grid.addEventListener("click", (e) => {
  const box = getClickedBox(e.target);
  if (!box) return;
  if (!gameStarted) startGame(box);
  // dig box
  digBox(box);
});
// add flag upon click
grid.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const box = getClickedBox(e.target);
  if (!box) return;
  // add flag
  addFlag(box);
});
// in case of right click when game has ended, prevent context menu
pointerCatch.addEventListener("contextmenu", (e) => e.preventDefault());
// change difficulty
gameMode.addEventListener("change", () => resetGame(SETTINGS[gameMode.value]));
// restart game
restartBtn.addEventListener("click", () => resetGame(SETTINGS[gameMode.value]));

// #############################################################################
// #############################################################################
// START GAME
// #############################################################################
// #############################################################################

// start game
function startGame(box) {
  gameStarted = true;
  //// start timer
  timer.start();
  //// generate mines
  generateMines(box);
}

// generate mines
function generateMines(startingBox) {
  // find neighbours for starting box
  startingBox.findNeighbours();
  // array of tests that determine if a box can contain a mine
  const mineTests = [
    // cannot place mine in the clicked box
    (box) => box !== startingBox,
    // cannot place mine in the neighbour of a clicked box
    (box) => !startingBox.allNeighbours.includes(box),
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

// #############################################################################
// #############################################################################
// GAME LOGIC
// #############################################################################
// #############################################################################

// reset game
function resetGame(params) {
  settings = params;
  // check numbers supplied are valid
  if (settings.totalMines > settings.gridHeight * settings.gridWidth)
    throw new Error("Too many mines for grid size!");
  // if game was previously ended, remove end state
  endGame.remove();
  // reset game parameters
  timer.reset();
  gameStarted = false;
  dugBoxes = 0;
  unflaggedMines = settings.totalMines;
  flagCount.textContent = unflaggedMines;
  grid.classList.remove("disable");
  mines = [];
  flags = [];
  boxes = [];
  grid_rows = [];
  // clear grid
  while (grid.firstChild) grid.removeChild(grid.lastChild);
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
}

// dig box
function digBox(box) {
  // abort if box is already dug or has flag
  if (box.isDug || box.hasFlag) return;
  // find and store box neighbours
  box.findNeighbours();
  //// update box and dig count
  box.isDug = true;
  box.uiBox.classList.add("dug");
  updateBorders(box);
  dugBoxes++;
  //// if box has mine, end game (loose)
  if (box.hasMine) {
    endGame.loose(box);
    return;
  }
  ////// reveal number of surrounding mines
  box.showMineCount();
  //// if no surrounding mines, dig all surrounding undug/unflagged boxes
  if (box.surrMines === 0)
    for (const b of box.getUnflaggedNeighbours()) digBox(b);

  //// check game state
  checkGameState();
}

// add/remove flag
function addFlag(box) {
  // if box already dug, abort
  if (box.isDug) return;
  if (!box.hasFlag) {
    // box does not have flag, add flag
    flags.push(box);
    flagCount.textContent = --unflaggedMines;
  } else {
    // box already has flag, remove flag
    flags.splice(flags.indexOf(box), 1);
    flagCount.textContent = ++unflaggedMines;
  }
  // toggle flag on box
  box.hasFlag = !box.hasFlag;
  box.uiBox.classList.toggle("fas");
  box.uiBox.classList.toggle("fa-flag");
  // check game status for win
  checkGameState();
}

// check box
function checkBox(box) {
  // if is undug, abort
  if (!box.isDug) return;
  // if box has no surrounding mines, abort
  if (box.surrMines === 0) return;
  // if surrounding boxes fully flagged, dig all surrounding undug/unflagged boxes
  if (box.getNumFlaggedNeighbours() >= box.surrMines) {
    for (const b of box.getUnflaggedNeighbours()) digBox(b);
  } else {
    // otherwise highlight the undug/unflagged boxes
    box.checkToggleHighlight();
  }
}

// for a given clicked element in the grid, return the correpsonding box object
function getClickedBox(el) {
  const clickedBox = el.closest(".ms_grid_row_box");
  const clickedRow = el.closest(".ms_grid_row");
  if (!clickedBox || !clickedRow) return;
  const row = grid_rows.indexOf(clickedRow);
  const box = boxes[row].map((b) => b.uiBox).indexOf(clickedBox);
  return boxes[row][box];
}

// add/remove box borders
function updateBorders(box) {
  updateBorders(box.neighbours.top, "border_bottom", "border_top");
  updateBorders(box.neighbours.bottom, "border_top", "border_bottom");
  updateBorders(box.neighbours.left, "border_right", "border_left");
  updateBorders(box.neighbours.right, "border_left", "border_right");

  function updateBorders(checkBox, removeStyle, addStyle) {
    if (checkBox) {
      checkBox.isDug
        ? checkBox.uiBox.classList.remove(removeStyle)
        : box.uiBox.classList.add(addStyle);
    }
  }
}

// check game state
function checkGameState() {
  //// if game not started, abort
  if (!gameStarted) return;
  // have all non-mine boxes been dug
  const safeDigsComplete =
    dugBoxes === settings.gridHeight * settings.gridWidth - settings.totalMines;
  //  have flags been placed over all mines
  const allMinesFlagged = unflaggedMines === 0;
  // if all non-mine boxes are dug and all mines have flags, win game
  if (safeDigsComplete && allMinesFlagged) endGame.win();
}

// end game with a win or loose, or remove game end state
const endGame = {
  loose: (triggeredMine) => {
    timer.stop();
    for (const m of mines) m.showBomb();
    triggeredMine.igniteBomb();
    checkFlags();
    showEndState("loose", "You Loose!");
  },
  win: () => {
    timer.stop();
    checkFlags();
    showEndState("win", "You Win!");
  },
  remove: () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.remove();
  },
};

function checkFlags() {
  for (const f of flags) {
    if (!f.hasMine) {
      f.uiBox.classList.remove("fa-flag");
      f.uiBox.classList.add("fa-times");
    } else {
      f.uiBox.style.backgroundColor = "#69e032";
    }
  }
}

function showEndState(state, msg) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  const message = document.createElement("h1");
  message.className = `end-game-message ${state}`;
  message.textContent = msg;
  overlay.append(message);
  pointerCatch.append(overlay);
}

// #############################################################################
// #############################################################################
// INITIALISE GAME
// #############################################################################
// #############################################################################

(function () {
  // set game mode drop down default value in HTML to show default mode defined in this javascript file
  Array.from(gameMode)
    .find((m) => m.value === DEFAULT_MODE)
    .setAttribute("selected", true);
  // reset game based on default mode
  resetGame(SETTINGS[DEFAULT_MODE]);
})();
