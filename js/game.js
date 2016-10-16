// #558651
// #ffc66d
// #cc7832
// #6796a3

/* -------- GLOBAL VARIABLES ----------- */
var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 12,
    x: canvas.width / 2,
    y: 0,
    xSpeed: 2,
    ySpeed: -2,
    color: "#655e6e"
};
ball.y = canvas.height - ball.radius * 3;

var paddle = {
    width: 90,
    height: 13,
    x: 0,
    color: "#558651",
    speed: 5
};
paddle.x = canvas.width / 2 - paddle.width / 2;

var bricksProperties = {
    rows: 4,
    columns: 10,
    offsetTop: 30,
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

/* ----------- EVENT HANDLERS ----------- */

var keyDownHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = true;
    else if (e.keyCode == 37)
        keys.leftPressed = true;
};

var keyUpHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = false;
    else if (e.keyCode == 37)
        keys.leftPressed = false;
};

/* ------------ DRAW FUNCTIONS ----------- */

var draw = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    detectBricksCollision();
};

var drawPaddle = function() {
    drawRectangle(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height, paddle.color);
    if (keys.rightPressed && paddle.x + paddle.width < canvas.width)
        paddle.x += paddle.speed;
    if (keys.leftPressed && paddle.x > 0)
        paddle.x -= paddle.speed;
};

var drawBall = function() {
    canvasCtx.beginPath();
    canvasCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    canvasCtx.fillStyle = ball.color;
    canvasCtx.fill();
    canvasCtx.closePath();
    
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.xSpeed = -ball.xSpeed;
    }   
    if (ball.y - ball.radius < 0) {
        ball.ySpeed = -ball.ySpeed;
    } else if (ball.y + ball.ySpeed >= canvas.height - ball.radius - paddle.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.ySpeed = -ball.ySpeed;
        }
        else {
            alert("Game ooooover");
            document.location.reload();  
        }
    }
    
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
};

var drawBricks = function() {
    for (var i = 0; i < bricksProperties.rows; i++) {
        bricks[i] = [];
        for (var j = 0; j < bricksProperties.columns; j++) {
            var brickX = (bricksProperties.width + bricksProperties.padding) * j + bricksProperties.offsetLeft;
            var brickY = (bricksProperties.height + bricksProperties.padding) * i + bricksProperties.offsetTop;
            bricks[i][j] = {x: brickX, y: brickY};
            drawRectangle(bricks[i][j].x, bricks[i][j].y,
                bricksProperties.width,
                bricksProperties.height,
                bricksProperties.color);
        }
    }
};

/* ---------- COMMON FUNCTIONS --------- */

var detectBricksCollision = function() {
    for (var i = 0; i < bricksProperties.rows; i++) {
        for (var j = 0; j < bricksProperties.columns; j++) {
            var thisBrick = bricks[i][j];
            if (ball.x > thisBrick.x
                    && ball.x < thisBrick.x + bricksProperties.width
                    && ball.y > thisBrick.y
                    && ball.y < thisBrick.y + bricksProperties.height)
                ball.ySpeed = -ball.ySpeed;
        }
    }
};

var drawRectangle = function(x, y, width, height, color) {
    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

/* ---------- INIT ---------- */

var init = function() {
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setInterval(draw, 10);
};

init();