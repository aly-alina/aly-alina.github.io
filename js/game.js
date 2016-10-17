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

var bricksLevelFeaturesArray = [
    {
        numberOfBricks: 40,
        bricksPattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    },
    {
        numberOfBricks: 32,
        bricksPattern: [
            [false, false, true, false, false, false, false, true, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, true, false, false, false, false, true, false, false]
        ]
    },
    {
        numberOfBricks: 35,
        bricksPattern: [
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
        bricksPattern: [
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
        bricksPattern: [
            [false, false, false, false, false, false, false, false, true, true],
            [false, false, false, false, false, false, true, true, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false]
        ]
    },
    {
        numberOfBricks: 32,
        bricksPattern: [
            [true, false, false, false, false, false, false, false, false, true],
            [false, false, false, false, true, true, false, false, false, false],
            [true, false, false, false, false, false, false, false, false, true],
            [false, false, false, false, true, true, false, false, false, false]
        ]
    }
];

var bricksProperties = {
    offsetTop: 40,
    offsetLeft: 30,
    width: 45,
    height: 12,
    padding: 10,
    color: "#6796a3"
};

var bricks = [];

var keys = {
    rightPressed: false,
    leftPressed: false
};

var score = 0;
var level = 0;
var paddleIsBeingChosen = false;
var numberOfPaddles = 1;
var requestId;

/* ----------- EVENT HANDLERS ----------- */

var keyDownHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = true;
    else if (e.keyCode == 37)
        keys.leftPressed = true;
    else if (paddleIsBeingChosen) {
        if (e.keyCode == 49)
            numberOfPaddles = 1;
        else if (e.keyCode == 50)
            numberOfPaddles = 2;
        initLevel();
    }
};

var keyUpHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = false;
    else if (e.keyCode == 37)
        keys.leftPressed = false;
    else if (e.keyCode == 49 || e.keyCode == 50) // 1 or 2
        paddleIsBeingChosen = false;
};

var mousemoveHandler = function(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
};

var start = function(e) {
    init();
};

var reset = function(e) {
    cancelAnimation();
    init();
};

/* ------------ DRAW FUNCTIONS ----------- */

var draw = function() {
    requestId = window.requestAnimationFrame(draw);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawScore();
    drawBall();
    detectBricksCollision();
};

var drawPaddle = function() {
    if (numberOfPaddles == 1) {
        drawRectangle(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height, paddle.color);
        if (keys.rightPressed && paddle.x + paddle.width < canvas.width)
            paddle.x += paddle.speed;
        if (keys.leftPressed && paddle.x > 0)
            paddle.x -= paddle.speed;
    } else if (numberOfPaddles == 2) {
        for (var i = 0; i < twoPaddles.length; i++) {
            drawRectangle(twoPaddles[i].x,
                canvas.height - twoPaddles[i].height,
                twoPaddles[i].width,
                twoPaddles[i].height,
                twoPaddles[i].color);
        }
        if (keys.rightPressed) {
            if (twoPaddles[0].x < canvas.width / 2 - twoPaddles[0].width)
                twoPaddles[0].x += twoPaddles[0].speed;
            if (twoPaddles[1].x < canvas.width - twoPaddles[1].width)
                twoPaddles[1].x += twoPaddles[1].speed;
        }
        if (keys.leftPressed) {
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
    for (var i = 0; i < bricksLevelFeaturesArray[level].bricksPattern.length; i++) {
        for (var j = 0; j < bricksLevelFeaturesArray[level].bricksPattern[i].length; j++) {
            if (!bricks[i][j].wasHit) {
                var brickX = (bricksProperties.width + bricksProperties.padding) * j
                    + bricksProperties.offsetLeft;
                var brickY = (bricksProperties.height + bricksProperties.padding) * i
                    + bricksProperties.offsetTop;
                bricks[i][j] = {x: brickX, y: brickY, wasHit: false};
                drawRectangle(bricks[i][j].x, bricks[i][j].y,
                    bricksProperties.width,
                    bricksProperties.height,
                    bricksProperties.color);
            }
        }
    }
};

var drawScore = function() {
    drawText("16px 'northregular'", "#fff", "Score: " + score, 8, 20, false);
}

var drawLevel = function () {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("30px northregular", "#fff", "Level " + (level + 1), 0, canvas.height / 2, true);
};

var drawCongrats = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("25px 'northregular'", "#fff", "You won the game! Awesome!", 0, canvas.height / 2, true);
};

var drawPaddleChoice = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("18px 'northregular'", "#fff", 'To have 1 paddle press "1", to have 2 - "2"', 0, canvas.height / 2, true);
    paddleIsBeingChosen = true;
};

/* ---------- COMMON FUNCTIONS --------- */

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
}

var detectBricksCollision = function() {
    for (var i = 0; i < bricksLevelFeaturesArray[level].bricksPattern.length; i++) {
        for (var j = 0; j < bricksLevelFeaturesArray[level].bricksPattern[i].length; j++) {
            var thisBrick = bricks[i][j];
            if (!thisBrick.wasHit) {
                if (ball.x > thisBrick.x
                        && ball.x < thisBrick.x + bricksProperties.width
                        && ball.y > thisBrick.y
                        && ball.y < thisBrick.y + bricksProperties.height) {
                    ball.ySpeed = -ball.ySpeed;
                    thisBrick.wasHit = true;
                    score++;
                    if (score >= bricksLevelFeaturesArray[level].numberOfBricks) {
                        advanceLevel();
                    }
                }
            }
        }
    }
};

var advanceLevel = function() {
    cancelAnimation();
    level++;
    score = 0;
    initLevel();
};

var drawRectangle = function(x, y, width, height, color) {
    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

var finishTheGame = function () {
    cancelAnimation();
    drawLose();
};

var cancelAnimation = function() {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
};

var initPaddles = function () {
    if (numberOfPaddles == 1) {
        paddle.x = canvas.width / 2 - paddle.width / 2;
    } else if (numberOfPaddles == 2) {
        twoPaddles[0].x = 0;
        twoPaddles[1].x = canvas.width / 2;
    }
};

/* ---------- INIT ---------- */

var bricksInit = function() {
    for (var i = 0; i < bricksLevelFeaturesArray[level].bricksPattern.length; i++) {
        bricks[i] = [];
        for (var j = 0; j < bricksLevelFeaturesArray[level].bricksPattern[i].length; j++) {
            bricks[i][j] = {x: 0, y: 0, wasHit: bricksLevelFeaturesArray[level].bricksPattern[i][j]};
        }
    }
}

var init = function() {
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mousemoveHandler, false);
    level = 0;
    drawPaddleChoice();
    // game continues when a user chooses number of paddles (keyDownHandler())
};

var initLevel = function() {
    if (level < 6) {
        score = 0;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - ball.radius * 3;
        initPaddles();
        bricksInit();
        drawLevel();
        setTimeout(draw, 3000); // let see the level before game starts
    } else {
        drawCongrats();
    }
};