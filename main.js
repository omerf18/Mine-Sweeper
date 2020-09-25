'use strict'

var gLevel = [
    {
        size: 4,
        mines: 2
    }, {
        size: 8,
        mines: 12
    }, {
        size: 12,
        mines: 30
    }
];

var gGame = {
    isOn: true,
    markedCount: 0,
    mineHits: 0
};

var gBoard;
var gUsername;
var gameDifficulty;
var MINE = '💣';
var FLAG = '🏳️';
var LIFE = '❤️';
var DEAD = '☠️';
var HINT = '🌎';
var NOHINT = '🌐';
var isHint;
var gameTime = 0;
var gScore = 0;
var gInterval;
var hint1;
var hint2;
var hint3;
var isFirstCell = true;
var isHelpModalOn = false;
var isScoreModalOn = false;
var introMusic = new Audio('sound/entrace.wav');
document.addEventListener("oncontextmenu", flagCell);

function init() {
    gBoard = buildBoard(gameDifficulty.size);
    getGameSettings();
    gameTime = 0;
    isFirstCell = true;
    gGame.isOn = true;
    gGame.markedCount = 0;
    gGame.mineHits = 0;
    gScore = 0;
    var timer = document.querySelector(".timer");
    timer.innerHTML = gameTime;
    hint1 = true;
    hint2 = true;
    hint3 = true;
    document.querySelector(".life0").innerHTML = LIFE;
    document.querySelector(".life1").innerHTML = LIFE;
    document.querySelector(".life2").innerHTML = LIFE;
    document.querySelector(".hint0").innerHTML = '🌎';
    document.querySelector(".hint1").innerHTML = '🌎';
    document.querySelector(".hint2").innerHTML = '🌎';
    isHelpModalOn = false;
    isScoreModalOn = false;
    isHint = false;
    document.querySelector('.flag-counter').innerHTML = '🏳️ ' + gGame.markedCount
    document.querySelector('.mines-display').innerHTML = '💣 ' + gameDifficulty.mines;
    document.querySelector('.player-scores').innerHTML = '';
    renderBoard(gBoard);
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            var tdId = `cell-${i}-${j}`
            strHtml += `<td id="${tdId}" oncontextmenu="flagCell(event, ${[i]}, ${[j]})"
            onclick="cellClicked(this, ${i}, ${j})"> 
            ${cell.isMine && cell.isShown ? MINE : ''}
            ${cell.isMarked ? FLAG : ''}
            ${cell.isShown && !cell.isMine ? getNeighbors(i, j) : ''}
            </td>`
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function getNeighbors(rowId, colId) {
    var cell = gBoard[rowId][colId];
    var neighborCnt = cell.minesAroundCount;
    for (var i = rowId - 1; i <= rowId + 1; i++) {
        // if i is out of bounderies - go to the next i 
        if (i < 0 || i > gBoard.length - 1) continue;  //continue to the next i 
        for (var j = colId - 1; j <= colId + 1; j++) {
            // if j is out of bounderies - go to the next j:
            if (j < 0 || j > gBoard[0].length - 1) continue; // continue to the next j.
            if (i === rowId && j === colId) continue;
            if (gBoard[i][j].isMine) neighborCnt++;
        }
    }
    return neighborCnt;
}

function expandOpenCells(rowId, colId) {
    for (var i = rowId - 1; i <= rowId + 1; i++) {
        // if i is out of bounderies - go to the next i 
        if (i < 0 || i > gBoard.length - 1) continue;  //continue to the next i 
        for (var j = colId - 1; j <= colId + 1; j++) {
            // if j is out of bounderies - go to the next j:
            if (j < 0 || j > gBoard[0].length - 1) continue; // continue to the next j.
            if (i === rowId && j === colId) continue;
            cellClicked(gBoard[i][j], i, j);
        }
    }
    renderBoard(gBoard);
}

function cellClicked(elCell, i, j) {
    elCell = gBoard[i][j];
    if (gGame.isOn) {
        if (isHint) {
            getHint(i, j);
            isHint = false;
            return;
        }
        if (isFirstCell) {
            gInterval = setInterval(setGameTimer, 1000);
            locateMinesRandomly(i, j);
            isFirstCell = false;
            renderBoard(gBoard);
        }
        if (elCell.isShown || elCell.isMarked) { return }
        else { // if cell is not shown or marked - show cell
            elCell.isShown = true;
            if (elCell.isMine) {
                onMineHit();
            }
            else if (getNeighbors(i, j) === 0) {
                expandOpenCells(i, j);
            }
            checkGameOver();
        }
        renderBoard(gBoard);
    }
}

function onMineHit() {
    ++gGame.mineHits;
    new Audio('sound/bomb.mp3').play();
    if (gGame.mineHits === 1) {
        document.querySelector(".life0").innerHTML = DEAD;
    }
    else if (gGame.mineHits === 2) {
        document.querySelector(".life1").innerHTML = DEAD;
    }
    else if (gGame.mineHits === 3) {
        document.querySelector(".life2").innerHTML = DEAD;
    }
}

function locateMinesRandomly(i, j) {
    var rndRowIdx;
    var rndColIdx;
    var minesCount = 0;
    while (minesCount !== gameDifficulty.mines) {
        rndRowIdx = getRandomIntInclusive(0, gBoard.length - 1);
        rndColIdx = getRandomIntInclusive(0, gBoard.length - 1);
        if (!gBoard[rndRowIdx][rndColIdx].isMine && rndRowIdx !== i && rndColIdx !== j) {
            gBoard[rndRowIdx][rndColIdx].isMine = true;
            minesCount++;
        }
    }
}

function setGameTimer() {
    gameTime++;
    var time = document.querySelector(".timer");
    time.innerHTML = gameTime;
    if (gameTime % 10 === 0) {
        new Audio('sound/monster1.wav').play();
        gScore -= 5;
    }
}

function flagCell(event, i, j) {
    var elCell = gBoard[i][j];
    event.preventDefault();
    if (gGame.isOn) {
        if (elCell.isShown) { return }
        if (elCell.isMarked) {
            elCell.isMarked = false;
            gGame.markedCount--;
        }
        else {
            elCell.isMarked = true;
            gGame.markedCount++;
        }
    }
    document.querySelector('.flag-counter').innerHTML = '🏳️ ' + gGame.markedCount;
    renderBoard(gBoard);
}

function getGameLevel(idx) {
    gameDifficulty = gLevel[idx];
    if (idx === 0) {
        document.getElementById("0").style.borderColor = "rgb(241, 241, 20)";
        document.getElementById("0").style.color = "rgb(241, 241, 20)";
        document.getElementById("1").style.borderColor = "#d2d2caf0";
        document.getElementById("1").style.color = "#d2d2caf0";
        document.getElementById("2").style.borderColor = "#d2d2caf0";
        document.getElementById("2").style.color = "#d2d2caf0";
    }
    else if (idx === 1) {
        document.getElementById("1").style.borderColor = "rgb(241, 241, 20)";
        document.getElementById("1").style.color = "rgb(241, 241, 20)";
        document.getElementById("0").style.borderColor = "#d2d2caf0";
        document.getElementById("0").style.color = "#d2d2caf0";
        document.getElementById("2").style.borderColor = "#d2d2caf0";
        document.getElementById("2").style.color = "#d2d2caf0";
    }
    else if (idx === 2) {
        document.getElementById("2").style.borderColor = "rgb(241, 241, 20)";
        document.getElementById("2").style.color = "rgb(241, 241, 20)";
        document.getElementById("0").style.borderColor = "#d2d2caf0";
        document.getElementById("0").style.color = "#d2d2caf0";
        document.getElementById("1").style.borderColor = "#d2d2caf0";
        document.getElementById("1").style.color = "#d2d2caf0";
    }
}

function getGameSettings() {
    new Audio('sound/enter.wav').play();
    introMusic.pause();
    document.body.style.backgroundImage = "url(img/cave.jpg)";
    document.querySelector(".flag-counter").style.display = "block";
    document.querySelector(".mines-display").style.display = "block";
    document.querySelector(".menu").style.display = "none";
    document.querySelector(".help").style.display = "none";
    document.querySelector(".board").style.display = "block";
    document.querySelector(".timer").style.display = "block";
    document.querySelector(".life0").style.display = "block";
    document.querySelector(".life1").style.display = "block";
    document.querySelector(".life2").style.display = "block";
    document.querySelector(".hint0").style.display = "block";
    document.querySelector(".hint1").style.display = "block";
    document.querySelector(".hint2").style.display = "block";
    document.querySelector(".win-modal").style.display = "none";
    document.querySelector(".lose-modal").style.display = "none";
    document.querySelector(".help-modal").style.display = "none";
    document.querySelector(".highscore-modal").style.display = "none";
    document.querySelector(".modal-container").style.display = "none";
}

function getHomeSetting() {
    introMusic.currentTime = 0;
    introMusic.play();
    document.body.style.backgroundImage = "url(img/forrest.jpg)";
    document.querySelector(".menu").style.display = "block";
    document.querySelector(".help").style.display = "block";
    document.querySelector(".board").style.display = "none";
    document.querySelector(".timer").style.display = "none";
    document.querySelector(".life0").style.display = "none";
    document.querySelector(".life1").style.display = "none";
    document.querySelector(".life2").style.display = "none";
    document.querySelector(".hint0").style.display = "none";
    document.querySelector(".hint1").style.display = "none";
    document.querySelector(".hint2").style.display = "none";
    document.querySelector(".modal-container").style.display = "none";
    document.querySelector(".win-modal").style.display = "none";
    document.querySelector(".lose-modal").style.display = "none";
    document.querySelector(".flag-counter").style.display = "none";
    document.querySelector(".mines-display").style.display = "none";
}

function onHintClick(e) {
    if (!gGame.isOn) return;
    var hintSound = new Audio('sound/bird.mp3');
    if (e.id === 'A' && hint1 === true) {
        document.querySelector(".hint0").innerHTML = '🌐';
        hintSound.play();
        isHint = true;
        hint1 = false;
        gScore -= 5;
    }
    if (e.id === 'B' && hint2 === true) {
        document.querySelector(".hint1").innerHTML = '🌐';
        hintSound.play();
        isHint = true;
        hint2 = false;
        gScore - 5;
    }
    if (e.id === 'C' && hint3 === true) {
        document.querySelector(".hint2").innerHTML = '🌐';
        hintSound.play();
        isHint = true;
        hint3 = false;
        gScore -= 5;
    }
    console.log(gScore);
}

function getHint(rowId, colId) {
    for (var i = rowId - 1; i <= rowId + 1; i++) {
        // if i is out of bounderies - go to the next i 
        if (i < 0 || i > gBoard.length - 1) continue;  //continue to the next i 
        for (var j = colId - 1; j <= colId + 1; j++) {
            // if j is out of bounderies - go to the next j:
            if (j < 0 || j > gBoard[0].length - 1) continue; // continue to the next j.
            if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) { hintShowsCells(i, j) };
        }
    }
}

function hintShowsCells(i, j) {
    new Audio('sound/monster2.wav').play();
    gBoard[i][j].isShown = true;
    renderBoard(gBoard);
    setTimeout(function () {
        gBoard[i][j].isShown = false;
        renderBoard(gBoard);
    }, 1000);
}

function toggleHelpModal(e) {
    if (!isHelpModalOn) {
        document.querySelector(".help-modal").style.display = "block";
        isHelpModalOn = true;
    } else {
        document.querySelector(".help-modal").style.display = "none";
        isHelpModalOn = false;
    }
}

function toggleScoreModal(e) {
    if (!isScoreModalOn) {
        document.querySelector(".highscore-modal").style.display = "block";
        isScoreModalOn = true;
    } else {
        document.querySelector(".highscore-modal").style.display = "none";
        isScoreModalOn = false;
    }
}

function checkGameOver() {
    if (!gGame.isOn) return;
    var shownCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                shownCount++;
            }
        }
    }
    if (gameDifficulty.mines === gGame.mineHits || gGame.mineHits === 3) {
        gameOver();
    }
    else if ((shownCount + gameDifficulty.mines) === (gameDifficulty.size * gameDifficulty.size) && (gGame.mineHits < gameDifficulty.mines) && (gGame.mineHits !== 3)) {
        gameWon();
    }
}

function getUsername () {
    gUsername = document.getElementById("name").value;
    document.querySelector('.login').style.display = 'none';
    introMusic.play();
}

function getHighScore() {
    var score = gScore;
    var scores;
    if (localStorage.getItem('scores') === null) {
        scores = [];
    } else {
        scores = JSON.parse(localStorage.getItem('scores'));
    }

    scores.push(score);

    localStorage.setItem('scores', JSON.stringify(scores));

    scores.sort(function (score1, score2) {
        return score2 - score1;
    });

    var currScore;
    for (var i = 0; i < 10; i++) {
        currScore = scores[i];
        if (!currScore) return;
        else {
            document.querySelector('.player-scores').innerHTML += gUsername + ' ' + currScore + `<br>`;
        }
    }

}

function getGameScore() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isShown) {
                if (!cell.isMine) {
                    gScore += 2;
                }
                else if (cell.isMine) {
                    gScore -= 3;
                }
            }
            if (cell.isMarked && cell.isMine) {
                gScore += 10;
            }
        }
    }
    getHighScore();
}

function gameOver() {
    clearInterval(gInterval);
    gGame.isOn = false;
    getGameScore();
    new Audio('sound/gameOver.mp3').play();
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                cell.isShown = true;
            }
            if (cell.isMine && cell.isMarked) {
                cell.isMarked = false;
            }
        }
    }
    renderBoard(gBoard);
    setTimeout(function () {
        document.querySelector(".modal-container").style.display = "block";
        document.querySelector(".lose-modal").style.display = "block";
        introMusic.play();
    }, 2500);
}

function gameWon() {
    clearInterval(gInterval);
    gGame.isOn = false;
    gScore += 45;
    getGameScore();
    new Audio('sound/victory.mp3').play();
    renderBoard(gBoard);
    setTimeout(function () {
        document.querySelector(".modal-container").style.display = "block";
        document.querySelector(".win-modal").style.display = "block";
    }, 2000);

}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}