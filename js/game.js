/* -------- GLOBAL VARIABLES ----------- */
var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 10,
    x: 0,
    y: 0,
    xSpeed: 2.98,
    ySpeed: -2.98,
    color: "#655e6e"
};

var ballRadiuses = {
    small: 7,
    medium: 10,
    large: 16
};

var ballAreas = {
    small: {
        x_left: 0,
        x_right: 0,
        y_top: 0,
        y_bottom: 0
    },
    medium: {
        x_left: 0,
        x_right: 0,
        y_top: 0,
        y_bottom: 0
    },
    large: {
        x_left: 0,
        x_right: 0,
        y_top: 0,
        y_bottom: 0
    }
};

var paddle = {
    width: 110,
    height: 13,
    x: 0,
    color: "#558651",
    speed: 4.98
};

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
var ballSizeChoiceScreenIsOn = false; // screen offering to choose number of paddles before the game starts
var gameIsOn = false; // true if the actual game is in progress

/* ----------- EVENT HANDLERS ----------- */

var keyDownHandler = function(e) {
    if (e.keyCode == 39)
        keyboardKeys.rightPressed = true;
    else if (e.keyCode == 37)
        keyboardKeys.leftPressed = true;
};

var keyUpHandler = function(e) {
    if (e.keyCode == 39)
        keyboardKeys.rightPressed = false;
    else if (e.keyCode == 37)
        keyboardKeys.leftPressed = false;
};

var mousemoveHandler = function(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (checkIfMouseInsideCanvas(relativeX)) {
        paddle.x = followTheMouse(relativeX, paddle.width);
    }
};

var mouseDownHandler = function(e) {
    if (ballSizeChoiceScreenIsOn) {
        var relativeX = e.clientX - canvas.offsetLeft;
        var relativeY = e.clientY - canvas.offsetTop;
        for (var ballProp in ballAreas) {
            if (ballAreas.hasOwnProperty(ballProp)) {
                if (checkIfClickedThisBall(ballProp, relativeX, relativeY)) {
                    if (ballRadiuses.hasOwnProperty(ballProp)) {
                        ball['radius'] = ballRadiuses[ballProp];
                        console.log(ballProp);
                    }
                }
            }
        }
        initLevel();
    }
};

var mouseUpHandler = function() {
    if (ballSizeChoiceScreenIsOn) {
        ballSizeChoiceScreenIsOn = false;
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
canvas.addEventListener("mousedown", mouseDownHandler, false);
canvas.addEventListener("mouseup", mouseUpHandler, false);

/* ------------ MAIN DRAW FUNCTIONS ----------- */

var drawAllGameObjects = function() {
    requestId = requestAnimFrame(drawAllGameObjects);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawScore();
    var timeIsOut = drawTimer();
    var ballHitsFloor = drawBall();
    var levelIsAccomplished = detectBricksCollision();
    if (timeIsOut || ballHitsFloor) {
        finishTheGame();
    } else if (levelIsAccomplished) {
        advanceLevel();
    }
};

var drawBricks = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            if (!currentUnhitBricks[i][j].wasHit) {
                drawRectangle(currentUnhitBricks[i][j].x, currentUnhitBricks[i][j].y,
                    commonBricksProperties.width,
                    commonBricksProperties.height,
                    commonBricksProperties.color);
            }
        }
    }
};

var drawPaddle = function() {
    drawRectangle(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height, paddle.color);
    // change position for next draw
    if (keyboardKeys.rightPressed && paddle.x + paddle.width < canvas.width)
        paddle.x += paddle.speed;
    if (keyboardKeys.leftPressed && paddle.x > 0)
        paddle.x -= paddle.speed;
};

var drawScore = function() {
    drawText("16px 'northregular'", "#fff", "Score: " + score, 8, 20, false, false);
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
            false,
            false
        );
    } else {
        return true;
    }
    return false;
};

var drawBall = function() {
    drawCircle(canvasCtx, ball.x, ball.y, ball.radius, ball.color);

    // change direction for the next draw
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) { // if hit walls
        ball.xSpeed = -ball.xSpeed;
    }   
    if (ball.y - ball.radius < 0) { // if hit ceiling
        ball.ySpeed = -ball.ySpeed;
    } else if (ball.y + ball.ySpeed >= canvas.height - ball.radius - paddle.height) { //if hits floor
        if (checkIfHitsOnePaddle(paddle.x, paddle.width)) {
            ball.ySpeed = -ball.ySpeed;
        } else {
            return true; // paddle(s) miss the ball
        }

    }

    // change coordinates for the next draw
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;

    return false;
};

var detectBricksCollision = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            var thisBrick = currentUnhitBricks[i][j];
            if (!thisBrick.wasHit) {
                // if ball hits the brick
                var changeX = checkIfBallHitsAndXChanges(ball.x, ball.y, ball.radius, thisBrick,
                    commonBricksProperties.width, commonBricksProperties.height);
                var changeY = checkIfBallHitsAndYChanges(ball.x, ball.y, ball.radius, thisBrick,
                    commonBricksProperties.width, commonBricksProperties.height);
                if (changeX || changeY) {
                    if (changeX) {
                        ball.xSpeed = -ball.xSpeed;
                    } else if (changeY) {
                        ball.ySpeed = -ball.ySpeed;
                    }
                    thisBrick.wasHit = true;
                    score++;
                    if (score >= bricksPatterns[currentLevel].numberOfBricks) { // if level score is done
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

/* ---------- OTHER DRAW FUNCTIONS ------------- */

var drawCircle = function(canvasCtx, x, y, radius, color) {
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radius, 0, Math.PI*2);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

var drawLose = function () {
    drawOnEmptyScreen("25px 'northregular'", "#fff", "Game is over", 0, canvas.height / 2, true, false);
};

var drawCurrentLevelNumber = function () {
    drawOnEmptyScreen("30px northregular", "#fff", "Level " + (currentLevel + 1), 0, canvas.height / 2, true, false);
};

var drawCongrats = function() {
    drawOnEmptyScreen("25px 'northregular'", "#fff", "You won the game! Awesome!", 0, canvas.height / 2, true, false);
};

var drawBallSizeChoice = function() {
    drawOnEmptyScreen("18px 'northregular'",
        "#fff",
        'Choose the size of the ball:',
        0,
        canvas.height / 8,
        true,
        false);
    drawCircle(canvasCtx, canvas.width / 4, canvas.height / 2, ballRadiuses['small'] * 3, ball.color);
    setBallAreas(
        'small',
        canvas.width / 4 - ballRadiuses['small'] * 3,
        canvas.width / 4 + ballRadiuses['small'] * 3,
        canvas.height / 2 + ballRadiuses['small'] * 3,
        canvas.height / 2 - ballRadiuses['small'] * 3);
    drawCircle(canvasCtx, canvas.width / 2, canvas.height / 2, ballRadiuses['medium'] * 3, ball.color);
    setBallAreas(
        'medium',
        canvas.width / 2 - ballRadiuses['medium'] * 3,
        canvas.width / 2 + ballRadiuses['medium'] * 3,
        canvas.height / 2 + ballRadiuses['medium'] * 3,
        canvas.height / 2 - ballRadiuses['medium'] * 3);
    drawCircle(canvasCtx, canvas.width / 2 + canvas.width / 4,
        canvas.height / 2, ballRadiuses['large'] * 3, ball.color);
    setBallAreas(
        'large',
        canvas.width / 2 + canvas.width / 4 - ballRadiuses['large'] * 3,
        canvas.width / 2 + canvas.width / 4 + ballRadiuses['large'] * 3,
        canvas.height / 2 + ballRadiuses['large'] * 3,
        canvas.height / 2 - ballRadiuses['large'] * 3);
};

var drawReadMe = function() {
    var text = "Move the paddle to the left or to the right so the ball does not touch the floor. The paddle" +
        " movement is controlled with <- and -> keyboard keys or with the mouse. The final goal" +
        " is to break all the bricks above before the time is up. You can choose to play with one paddle " +
        "or with two of them. Press \"Reset\" if the game is in progress and you want to start again. The game " +
        "has 6 levels.";
    drawOnEmptyScreen("18px 'northregular'", '#fff', text, 8, 40, false, true);
};

var drawOnEmptyScreen = function(font, style, text, x, y, drawInTheMiddle, wrapNeeded) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText(font, style, text, x, y, drawInTheMiddle, wrapNeeded);
};

var drawText = function(font, style, text, x, y, drawInTheMiddle, wrapIsNeeded) {
    canvasCtx.font = font;
    canvasCtx.fillStyle = style;
    if (drawInTheMiddle) {
        canvasCtx.fillText(text, (canvas.width / 2) - (canvasCtx.measureText(text).width / 2), y);
    } else if(wrapIsNeeded) {
        drawWrappedText(text, x, y, canvas.width - x, 30);
    } else {
        canvasCtx.fillText(text, x, y);
    }
};

var drawWrappedText = function(text, x, y, maxWidth, lineHeight) {
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

var drawRectangle = function(x, y, width, height, color) {
    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

/* ---------- COMMON FUNCTIONS --------- */

var setBallAreas = function(ballName, x_left, x_right, y_top, y_bottom) {
    ballAreas[ballName]['x_left'] = x_left;
    ballAreas[ballName]['x_right'] = x_right;
    ballAreas[ballName]['y_top'] = y_top;
    ballAreas[ballName]['y_bottom'] = y_bottom;
};

var checkIfClickedThisBall = function(ballPropertyName, mouseX, mouseY) {
    return mouseX >= ballAreas[ballPropertyName]['x_left']
        && mouseX <= ballAreas[ballPropertyName]['x_right']
        && mouseY >= ballAreas[ballPropertyName]['y_bottom']
        && mouseY <= ballAreas[ballPropertyName]['y_top'];
};

var checkIfHitsOnePaddle = function(thisPaddleX, thisPaddleWidth) {
    return ball.x > thisPaddleX - ball.radius
        && ball.x < thisPaddleX + thisPaddleWidth + ball.radius;
};

var getTimeRemaining = function(endtime){
    var totalRemainingTime = Date.parse(endtime) - Date.now();
    var seconds = Math.floor( (totalRemainingTime/1000) % 60 );
    var minutes = Math.floor( (totalRemainingTime/1000/60) % 60 );
    return {
        'total': totalRemainingTime,
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

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || function( callback ){
            window.setTimeout(callback, 1000 / 60);
            };
})();

var checkIfBallHitsAndXChanges = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return checkIfBallRightEdgeHits(ballX, ballY, radius, brick, brickWidth, brickHeight)
        || checkIfBallLeftEdgeHits(ballX, ballY, radius, brick, brickWidth, brickHeight);
};

var checkIfBallRightEdgeHits = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return (ballX + radius > brick.x)
        && (ballX + radius < brick.x + brickWidth)
        && (ballY < brick.y + brickHeight)
        && (ballY > brick.y);
};

var checkIfBallLeftEdgeHits = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return (ballX - radius < brick.x + brickWidth)
        && (ballX - radius > brick.x)
        && (ballY < brick.y + brickHeight)
        && (ballY > brick.y);
};

var checkIfBallHitsAndYChanges = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return checkIfBallTopEdgeHits(ballX, ballY, radius, brick, brickWidth, brickHeight)
        || checkIfBallBottomEdgeHits(ballX, ballY, radius, brick, brickWidth, brickHeight)
        || checkIfBallMiddleHits(ballX, ballY, radius, brick, brickWidth, brickHeight);
};

var checkIfBallTopEdgeHits = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return (ballY - radius < brick.y + brickHeight)
        && (ballY - radius > brick.y)
        && (ballX > brick.x)
        && (ballX < brick.x + brickWidth);
};

var checkIfBallBottomEdgeHits = function(ballX, ballY, radius, brick, brickWidth, brickHeight){
    return (ballY + radius > brick.y)
        && (ballY + radius < brick.y + brickHeight)
        && (ballX > brick.x)
        && (ballX < brick.x + brickWidth);
};

var checkIfBallMiddleHits = function(ballX, ballY, radius, brick, brickWidth, brickHeight) {
    return (ballX > brick.x && ballX < brick.x + brickWidth
        && ballY > brick.y && ballY < brick.y + brickHeight);
};

/* ----------- CONTROL ---------- */

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
    drawBallSizeChoice();
    ballSizeChoiceScreenIsOn = true; // game continues when a user chooses number of paddles (keyDownHandler())
    // when 1 or 2 pressed, initLevel() is called
};

var initLevel = function() {
    if (currentLevel < numberOfLevels) {
        resetVariables();
        initPaddlesPositions();
        bricksInit();
        drawCurrentLevelNumber();
        setTimer(); // lose if all bricks are not hit inside this timeslot
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
    paddle.x = canvas.width / 2 - paddle.width / 2;
};

var bricksInit = function() {
    for (var i = 0; i < bricksPatterns[currentLevel].pattern.length; i++) {
        currentUnhitBricks[i] = [];
        for (var j = 0; j < bricksPatterns[currentLevel].pattern[i].length; j++) {
            var brickX = (commonBricksProperties.width + commonBricksProperties.padding) * j
                + commonBricksProperties.offsetLeft;
            var brickY = (commonBricksProperties.height + commonBricksProperties.padding) * i
                + commonBricksProperties.offsetTop;
            currentUnhitBricks[i][j] = {x: brickX, y: brickY, wasHit: bricksPatterns[currentLevel].pattern[i][j]};
        }
    }
};

var setTimer = function() {
    deadline = new Date(Date.now() + timeForLevel + timeToDisplayLevelNumber);
};