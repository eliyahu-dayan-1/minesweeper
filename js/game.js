"use strict";

//global NON-CANGE var (const)
var MINE = "💣";
var EMPTY = "0";
var FLAG = "🚩"
var COVER = ""

//Global object
var gBoard = [];
var gLevel = {
    SIZE: 0,
    MINES: 0,
}
var gGame = {
    isOn: true,
    shownCount: 0,
    flagCount: 0,
    secsPassed: 0,
    hintCount: 3,
    safeButton: 0,
    lifeCnt: 3,
    isHint: false,
    isVictory: false
}

var gElGameOver = document.querySelector('.gameOver')
var gIntervalTime = null;
var gEmptyNeighborCells = []
var gfirstTime = 0;
var gMines = []

/* the function get size and mine and start to run the function */
function initGame(size, mine) {
    //called when page loads or chnge game plan  
    resetGame();
    renderSmailyStatus("regular", "regular")
    gLevel.SIZE = size;
    gLevel.MINES = mine;
    gBoard = buildBoard(size);
    renderBoard(gBoard)
}

/* fucntion reset the var of the game */
function resetGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        flagCount: 0,
        secsPassed: 0,
        hintCount: 3,
        safeButton: 0,
        lifeCnt: 3,
        isHint: false,
        isVictory: false
    }

    gElGameOver = document.querySelector('.gameOver')
    gEmptyNeighborCells = []
    gfirstTime = 0;
    gMines = []

    gElGameOver.classList.remove('display')
    resetTime()
    renderLife()
    renderHintBt()
}

/* the function is reset the time */
function resetTime() {
    gfirstTime = Date.now();
    clearInterval(gIntervalTime)
    renderTime(gfirstTime)
}

/* the funciton get the size of mat (square) and build mat of the obj */
function buildBoard(size) {
    var board = [];
    /*Builds the board   Set mines at random locations Call setMinesNegsCount() Return the created board  */
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isFlag: false,
                location: { i, j }
            }
        }
    }
    return board
}

/* the funtion get mat and return a mat, the function is init the check status */
function renderBoard(board) {
    var strHTML = '';
    gGame.flagCount = 0
    gGame.shownCount = 0
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            checkVictory(board[i][j]);
            var cell = (!board[i][j].isShown) ? COVER
                : (board[i][j].isFlag) ? FLAG
                    : (board[i][j].isMine) ? MINE
                        : (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount
                            : EMPTY;
            var dataSet = `data-i = ${i} data-j = ${j}`
            var className = `cell cell-${i}-${j} ${board[i][j].isShown ? "shown" : "NotShown"}`;
            var clickFunction = `onmousedown="cellMarked(event, this)"`
            strHTML += `<td ${dataSet} class=" ${className}" ${clickFunction}>${cell}</td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
}

/* the function get a cell and check the status of the game (it get from render board) */
function checkVictory(cell) {
    if (!cell.isShown) return;
    else gGame.shownCount++;
    if (cell.isFlag) gGame.flagCount++

    //check optin of victory
    if (gGame.shownCount === gLevel.SIZE ** 2 && gGame.flagCount === gLevel.MINES) {
        gGame.isVictory = true;
        renderVictory();
        resetTime()
    }
}


// the fucntion set all the variable and interval of the game on/
function startGame(cellClickI, cellClickJ) {
    gGame.isFirstClick = true;
    gGame.isOn = true;
    gfirstTime = Date.now();
    gIntervalTime = setInterval(renderTime, 100, gfirstTime)
    //be shur furst click isnt bomb
    setBombRandomaly(gLevel.MINES, cellClickI, cellClickJ);
    setMinesNegsCountForMat(gBoard);
    renderBoard(gBoard);
}

/* the funciton is exe with the td of table, the function is get the elemnet (this), and the event
of the mouse (right or left) */
function cellMarked(elMouse, elCell) {
    if (!gGame.isOn) return;

    elCell.classList.add('clicked');
    var cell = gBoard[elCell.dataset.i][elCell.dataset.j]

    //if there is a flag yet the function desaper him and return
    if (gGame.isHint) {
        getHintToUser(cell.location.i, cell.location.j);
        gGame.isHint = false;
        return;
    }

    switch (elMouse.button) {
        //for left click
        case 0:
            //if it fisrtClick
            if (!gGame.isFirstClick) startGame(cell.location.i, cell.location.j)
            //if the cell alredy shown
            if (cell.isShown) return;
            cell.isShown = true;
            //if the cell is empty
            if (!cell.minesAroundCount && !cell.isMine) expandShown(parseInt(elCell.dataset.i), parseInt(elCell.dataset.j))
            //if the cell is mine
            if (cell.isMine) stepOnMime(cell);
            break;
        //for right click
        case 2:
            // if the cell is not a flag and the cell isnt reval or is a flag and the user want to cancel this
            if ((cell.isShown && cell.isFlag) || (!cell.isFlag && !cell.isShown)) {
                cell.isFlag = (cell.isFlag) ? false : true;
                cell.isShown = (cell.isFlag) ? true : false;
            }
            break;
    }
    renderBoard(gBoard)

    // the function check the status of the smaily by cell
    checkStatusOfSmailyByCell(cell)

}

function stepOnMime(cell) {
    renderBoard(gBoard);
    gGame.lifeCnt--;
    renderLife();
//gameOver
    if (!gGame.lifeCnt) {
        renderGameOver()
        resetTime()

    } else {
        setTimeout(function () {
            cell.isShown = false;
            renderBoard(gBoard);
        }, 400);
    };

}


function renderGameOver() {
    //reval all mine
    for (var i = 0; i < gMines.length; i++) {
        gMines[i].isShown = true;
    }
    //render game over modal to the screen
    gGame.isOn = false;
    gElGameOver.innerHTML = "GAME OVER\t🤦‍♂️"
    gElGameOver.classList.add('display')
}

//the funtion render the mode of hint, when the user can reval a cell and now what it and it neibors have/
function renderHintMode() {
    var cells = document.querySelectorAll('tbody td');
    for (var i = 0; i < cells.length; i++) {
        cells[i].classList.add('hint')
    }
    gGame.isHint = true;
    //TODO: function that let the user to choose a spesific sccel the funciton exe the getHint()
}

// function get specific cell and reval fur second his content and his neighbor content
function getHintToUser(row, col) {
    gGame.hintCount--;
    renderHintBt()
    var hintNbrs = []
    if (gGame.hintCount === 0) return;

    for (var i = row - 1; i <= row + 1; i++) {
        if (i === -1 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j === -1 || j >= gBoard[0].length || gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            hintNbrs.push(gBoard[i][j]);
        }
    }
    renderBoard(gBoard)

    for (var i = 0; i < hintNbrs.length; i++) {
        hintNbrs[i].isShown = false
    }

    setTimeout(function () { renderBoard(gBoard) }, 1000);
}

//the fucntion set bombs in randomaly places
function setBombRandomaly(mine, cellClickI, cellClickJ) {
    for (var i = 1; i <= mine;) {
        var row = genarateRandomNum(0, gBoard.length - 1);
        var col = genarateRandomNum(0, gBoard[0].length - 1);
        if (parseInt(cellClickI) === row && parseInt(cellClickJ) === col) continue;
        if (gBoard[row][col].isMine) continue;
        gBoard[row][col].isMine = true;
        gMines.push(gBoard[row][col])
        i++
    }
}

//the fuction reval all the neibors of cell who equal zero(by recutrion)
function expandShown(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === row && j === col) continue;
            if (gBoard[i][j].minesAroundCount > 0 && !gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
            }

            if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true;
                expandShown(i, j)
            }
        }
    }
    renderBoard(gBoard);
}

//the functin render the victory
function renderVictory() {
    gElGameOver.innerHTML = "victory 👍"
    gElGameOver.classList.add('display')
}

//the function render the time
function renderTime(firstTime) {
    var timeNow = Date.now() - firstTime;
    var minutes = Math.floor(timeNow / 60000);
    var seconds = ((timeNow % 60000) / 1000).toFixed(0);
    var curTime = (minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
    var displayNum = document.getElementById("timer")
    displayNum.innerHTML = '<h3> Time passed: ' + curTime + '</h3>';
}

//the function render the life status
function renderLife() {
    var lifeStr = ""
    for (var i = 1; i <= 3; i++) {
        lifeStr += (i <= gGame.lifeCnt) ? "💖" : "🖤";
    }
    document.querySelector('.life').innerHTML = lifeStr;
}

function cntScore() {
    //TODO count the score
}

//the function render the hint button
function renderHintBt() {
    var presentStr = ""
    for (var i = 1; i <= 3; i++) {
        var innerTxt = (i <= gGame.hintCount) ? "🎁" : "⬇️";
        var textFunc = (i <= gGame.hintCount) ? 'onclick="chooseHint()"' : "";
        presentStr += `<button class="btHint" ${textFunc}>${innerTxt}</button>`
    }
    document.querySelector('.clbtHint').innerHTML = presentStr;
}


// the function check the status of the smaily by cell
function checkStatusOfSmailyByCell(cell) {
    var statusSmailyA = (!gGame.lifeCnt) ? "sad"
        : (cell.isMine) ? "sad"
            : (gGame.isVictory) ? "click"
                : (!cell.isMine) ? "click"
                    : ""

    var statusSmailyB = (!gGame.lifeCnt) ? "sad"
        : (cell.isMine) ? "regular"
            : (gGame.isVictory) ? "win"
                : (!cell.isMine) ? "regular"
                    : ""

    renderSmailyStatus(statusSmailyA, statusSmailyB)
}

//the fucniton get to status and return one of them and the another after many minte
function renderSmailyStatus(statusA, statusB) {
    var smailyStatus = (statusA === "sad") ? "😌"
        : (statusA === "click") ? "😜"
            : (statusA === "win") ? "😂"
                : (statusA === "regular") ? "😀"
                    : ""
    document.querySelector('.smaily').innerHTML = smailyStatus;
    setTimeout(function () {
        var smailyStatus = (statusB === "sad") ? "😌"
            : (statusB === "click") ? "😜"
                : (statusB === "win") ? "😂"
                    : (statusB === "regular") ? "😀"
                        : ""
        document.querySelector('.smaily').innerHTML = smailyStatus;
    }, 300)
}

/* the func get spicific cell and check how many neighbor it has */
function setMinesNegsCount(row, col) {
    /*Count mines around each cell and set the cell's minesAroundCount.  */
    var bombCnt = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i === -1 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j === -1 || j >= gBoard[0].length) continue;
            if (i === row && j === col) continue;
            //if there is bomb cnt++
            if (gBoard[i][j].isMine) bombCnt++;
        }

    }

    gBoard[row][col].minesAroundCount = bombCnt;
}

/*the funciton get board and check on all the cell how many neighbor they have*/
function setMinesNegsCountForMat(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) setMinesNegsCount(i, j);
        }
    }
}
