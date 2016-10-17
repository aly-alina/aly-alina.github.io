/* -------- GLOBAL VARIABLES ----------- */
var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 10,
    x: 0,
    y: 0,
    xSpeed: 3,
    ySpeed: -3,
    color: "#655e6e"
};

var paddle = {
    width: 110,
    height: 13,
    x: 0,
    color: "#558651",
    speed: 5
}; // create one array of paddles, copy object with jQuery and refactor

var twoPaddles = [
    {
        width: 110,
        height: 13,
        x: 0,
        color: "#558651",
        speed: 5
    },
    {
        width: 110,
        height: 13,
        x: 0,
        color: "#558651",
        speed: 5
    }
];

var bricksPatterns = [
    {
        numberOfBricks: 40,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    },
    {
        numberOfBricks: 32,
        pattern: [
            [false, false, true, false, false, false, false, true, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, true, false, false, false, false, true, false, false]
        ]
    },
    {
        numberOfBricks: 35,
        pattern: [
            [true, false, true, false, true, false, true, false, true, false],
            [false, true, false, true, false, true, false, true, false, true],
            [true, false, true, false, true, false, true, false, true, false],
            [false, true, false, true, false, true, false, true, false, true],
            [true, false, true, false, true, false, true, false, true, false],
            [false, true, false, true, false, true, false, true, false, true],
            [true, false, true, false, true, false, true, false, true, false]
        ]
    },
    {
        numberOfBricks: 38,
        pattern: [
            [false, false, true, false, false, false, true, false, false, false],
            [true, false, true, false, true, false, true, false, true, false],
            [true, false, false, false, true, false, false, false, true, false],
            [true, false, true, false, true, false, true, false, true, false],
            [false, false, true, false, false, false, true, false, false, false],
            [true, false, true, false, true, false, true, false, true, false]
        ]
    },
    {
        numberOfBricks: 32,
        pattern: [
            [false, false, false, false, false, false, false, false, true, true],
            [false, false, false, false, false, false, true, true, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false]
        ]
    },
    {
        numberOfBricks: 32,
        pattern: [
            [true, false, false, false, false, false, false, false, false, true],
            [false, false, false, false, true, true, false, false, false, false],
            [true, false, false, false, false, false, false, false, false, true],
            [false, false, false, false, true, true, false, false, false, false]
        ]
    }
];

var commonBricksProperties = {
    offsetTop: 40,
    offsetLeft: 30,
    width: 45,
    height: 12,
    padding: 10,
    color: "#6796a3"
};

var currentUnhitBricks = [];

var keyboardKeys = {
    rightPressed: false,
    leftPressed: false
};

var score = 0;
var currentLevel = 0;
var numberOfLevels = 6;
var requestId = 0; // used in requestAnimationFrame (function drawAllGameObjects())
var timeForLevel = 120000; // time (ms) given to finish the level otherwise, lose
var deadline = {}; // Date object to store when the level's timer is up
var timeToDisplayLevelNumber = 3000; // delay before the game starts to show current level on the screen
var numberOfPaddles = 1;
var paddleScreenIsOn = false; // screen offering to choose number of paddles before the game starts
var gameIsOn = false; // true if the actual game is in progress

/* ----------- EVENT HANDLERS ----------- */

var keyDownHandler = function(e) {
    if (e.keyCode == 39)
        keyboardKeys.rightPressed = true;
    else if (e.keyCode == 37)
        keyboardKeys.leftPressed = true;
    else if (paddleScreenIsOn) {
        if (e.keyCode == 49)
            numberOfPaddles = 1;
        else if (e.keyCode == 50)
            numberOfPaddles = 2;
        initLevel();
    }
};

var keyUpHandler = function(e) {
    if (e.keyCode == 39)
        keyboardKeys.rightPressed = false;
    else if (e.keyCode == 37)
        keyboardKeys.leftPressed = false;
    else if (paddleScreenIsOn && (e.keyCode == 49 || e.keyCode == 50)) // 1 or 2
        paddleScreenIsOn = false;
};

var mousemoveHandler = function(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (numberOfPaddles == 1) {
        if (checkIfMouseInsideCanvas(relativeX)) {
            paddle.x = followTheMouse(relativeX, paddle.width);
        }
    } else if(numberOfPaddles == 2) {
        if (checkIfMouseInsideCanvas(relativeX)) {
            relativeX /= 2;
            twoPaddles[0].x = followTheMouse(relativeX, twoPaddles[0].width);
            twoPaddles[1].x = canvas.width / 2 + followTheMouse(relativeX, twoPaddles[1].width);
        }
    }
};

var start = function(e) {
    initGame();
};

var reset = function(e) {
    cancelAnimation();
    initGame();
};

var readme = function(e) {
    if (!gameIsOn) {
        drawReadMe();
    }
};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mousemoveHandler, false);

/* ------------ DRAW FUNCTIONS ----------- */

var drawAllGameObjects = function() {
    requestId = window.requestAnimationFrame(drawAllGameObjects);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawScore();
    drawTimer();
    drawBall();
    detectBricksCollision();
};

var drawPaddle = function() {
    if (numberOfPaddles == 1) {
        drawRectangle(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height, paddle.color);
        if (keyboardKeys.rightPressed && paddle.x + paddle.width < canvas.width)
            paddle.x += paddle.speed;
        if (keyboardKeys.leftPressed && paddle.x > 0)
            paddle.x -= paddle.speed;
    } else if (numberOfPaddles == 2) {
        for (var i = 0; i < twoPaddles.length; i++) {
            drawRectangle(twoPaddles[i].x,
                canvas.height - twoPaddles[i].height,
                twoPaddles[i].width,
                twoPaddles[i].height,
                twoPaddles[i].color);
        }
        if (keyboardKeys.rightPressed) {
            if (twoPaddles[0].x < canvas.width / 2 - twoPaddles[0].width)
                twoPaddles[0].x += twoPaddles[0].speed;
            if (twoPaddles[1].x < canvas.width - twoPaddles[1].width)
                twoPaddles[1].x += twoPaddles[1].speed;
        }
        if (keyboardKeys.leftPressed) {
            if (twoPaddles[0].x > 0)
                twoPaddles[0].x -= twoPaddles[0].speed;
            if (twoPaddles[1].x > canvas.width / 2)
                twoPaddles[1].x -= twoPaddles[1].speed;
        }
    }
};

var drawBall = function() {
    canvasCtx.beginPath();
    canvasCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    canvasCtx.fillStyle = ball.color;
    canvasCtx.fill();
    canvasCtx.closePath();
    
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) { // if hit walls
        ball.xSpeed = -ball.xSpeed;
    }   
    if (ball.y - ball.radius < 0) { // if hit ceiling
        ball.ySpeed = -ball.ySpeed;
    } else if (ball.y + ball.ySpeed >= canvas.height - ball.radius - paddle.height) { //if hits floor
        if (numberOfPaddles == 1 && checkIfHitsOnePaddle(paddle.x, paddle.width)
            || numberOfPaddles == 2 && (checkIfHitsOnePaddle(twoPaddles[0].x, twoPaddles[0].width)
                || checkIfHitsOnePaddle(twoPaddles[1].x, twoPaddles[1].width))) { //if hits paddle(s)
            ball.ySpeed = -ball.ySpeed;
        } else {
            finishTheGame();
        }
    }
    
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
};

var drawLose = function () {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("25px 'northregular'", "#fff", "Game is over", 0, canvas.height / 2, true);
};

var drawBricks = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            if (!currentUnhitBricks[i][j].wasHit) {
                var brickX = (commonBricksProperties.width + commonBricksProperties.padding) * j
                    + commonBricksProperties.offsetLeft;
                var brickY = (commonBricksProperties.height + commonBricksProperties.padding) * i
                    + commonBricksProperties.offsetTop;
                currentUnhitBricks[i][j] = {x: brickX, y: brickY, wasHit: false};
                drawRectangle(currentUnhitBricks[i][j].x, currentUnhitBricks[i][j].y,
                    commonBricksProperties.width,
                    commonBricksProperties.height,
                    commonBricksProperties.color);
            }
        }
    }
};

var drawScore = function() {
    drawText("16px 'northregular'", "#fff", "Score: " + score, 8, 20, false);
};

var drawTimer = function() {
    var remainingTime = getTimeRemaining(deadline);
    if (remainingTime.total > 0) {
        drawText(
            "16px 'northregular'",
            "#fff",
            remainingTime.minutes + ":" + remainingTime.seconds,
            canvas.width - 50,
            20,
            false
        );
    } else {
        finishTheGame();
    }
};

var drawCurrentLevelNumber = function () {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("30px northregular", "#fff", "Level " + (currentLevel + 1), 0, canvas.height / 2, true);
};

var drawCongrats = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("25px 'northregular'", "#fff", "You won the game! Awesome!", 0, canvas.height / 2, true);
};

var drawPaddleChoice = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("18px 'northregular'", "#fff", 'To have 1 paddle press "1", to have 2 - "2"', 0, canvas.height / 2, true);
};

var drawReadMe = function() {
    var text = "Move the paddle to the left or to the right so the ball does not touch the floor. The paddle(s)" +
        " movement is controlled with <- and -> keyboardKeys or with the mouse. The final goal" +
        " is to break all the currentUnhitBricks above before the time is up. You can choose to play with one paddle or with " +
        "two of them. Press \"Reset\" if the game is in progress and you want to start again. The game has 6 levels.";
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.font = "18px 'northregular'";
    canvasCtx.fillStyle = '#fff';
    wrapText(text, 8, 40, canvas.width - 8, 30);
};

/* ---------- COMMON FUNCTIONS --------- */

var wrapText = function(text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = canvasCtx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            canvasCtx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    canvasCtx.fillText(line, x, y);
};

var checkIfHitsOnePaddle = function(thisPaddleX, thisPaddleWidth) {
    return ball.x > thisPaddleX - ball.radius
        && ball.x < thisPaddleX + thisPaddleWidth + ball.radius;
};

var drawText = function(font, style, text, x, y, middle) {
    canvasCtx.font = font;
    canvasCtx.fillStyle = style;
    if (middle) {
        canvasCtx.fillText(text, (canvas.width / 2) - (canvasCtx.measureText(text).width / 2), y);
    } else {
        canvasCtx.fillText(text, x, y);
    }
};

var drawRectangle = function(x, y, width, height, color) {
    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

var getTimeRemaining = function(endtime){
    var t = Date.parse(endtime) - Date.now();
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    return {
        'total': t,
        'minutes': minutes,
        'seconds': seconds
    };
};

var checkIfMouseInsideCanvas = function(relativeX) {
    return relativeX > 0 && relativeX < canvas.width;
};

var followTheMouse = function(relativeX, width) {
    return relativeX - width / 2;
};

/* ----------- CONTROL ---------- */

var detectBricksCollision = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            var thisBrick = currentUnhitBricks[i][j];
            if (!thisBrick.wasHit) {
                if (ball.x > thisBrick.x
                    && ball.x < thisBrick.x + commonBricksProperties.width
                    && ball.y > thisBrick.y
                    && ball.y < thisBrick.y + commonBricksProperties.height) {
                    ball.ySpeed = -ball.ySpeed;
                    thisBrick.wasHit = true;
                    score++;
                    if (score >= bricksPatterns[currentLevel].numberOfBricks) {
                        advanceLevel();
                    }
                }
            }
        }
    }
};

var advanceLevel = function() {
    cancelAnimation();
    currentLevel++;
    score = 0;
    initLevel();
};

var finishTheGame = function () {
    cancelAnimation();
    drawLose();
    gameIsOn = false;
};

var cancelAnimation = function() {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
};

/* ---------- INIT ---------- */

var initGame = function() {
    currentLevel = 0;
    gameIsOn = true;
    drawPaddleChoice();
    paddleScreenIsOn = true; // game continues when a user chooses number of paddles (keyDownHandler())
    // when 1 or 2 pressed, initLevel() is called
};

var initLevel = function() {
    if (currentLevel < numberOfLevels) {
        resetVariables();
        initPaddlesPositions();
        bricksInit();
        drawCurrentLevelNumber();
        setTimer();
        setTimeout(function() {drawAllGameObjects();},
            timeToDisplayLevelNumber); // delay game start to display current level
    } else {
        drawCongrats();
    }
};

var resetVariables = function() {
    score = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - ball.radius * 6;
    ball.xSpeed = 3;
    ball.ySpeed = -3;
    requestId = 0;
    deadline = {};
};

var initPaddlesPositions = function () {
    if (numberOfPaddles == 1) {
        paddle.x = canvas.width / 2 - paddle.width / 2;
    } else if (numberOfPaddles == 2) {
        twoPaddles[0].x = 0;
        twoPaddles[1].x = canvas.width / 2;
    }
};

var bricksInit = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        currentUnhitBricks[i] = [];
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            currentUnhitBricks[i][j] = {x: 0, y: 0, wasHit: bricksPatterns[currentLevel].pattern[i][j]};
        }
    }
};

var setTimer = function() {
    deadline = new Date(Date.now() + timeForLevel + timeToDisplayLevelNumber);
};