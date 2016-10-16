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
};

var bricksProperties = {
    rows: 4,
    columns: 10,
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
var requestId;

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

var mousemoveHandler = function(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

/* ------------ DRAW FUNCTIONS ----------- */

var draw = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();
    requestId = window.requestAnimationFrame(draw);
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
        if (ball.x > paddle.x - ball.radius && ball.x < paddle.x + paddle.width + ball.radius) {
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
        for (var j = 0; j < bricksProperties.columns; j++) {
            if (!bricks[i][j].wasHit) {
                var brickX = (bricksProperties.width + bricksProperties.padding) * j + bricksProperties.offsetLeft;
                var brickY = (bricksProperties.height + bricksProperties.padding) * i + bricksProperties.offsetTop;
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
    drawText("30px 'northregular'", "#fff", "Level " + (level + 1), 0, canvas.height / 2, true);
};

var drawCongrats = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("25px 'northregular'", "#fff", "You won the game! Awesome!", 0, canvas.height / 2, true);
};

/* ---------- COMMON FUNCTIONS --------- */

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
    for (var i = 0; i < bricksProperties.rows; i++) {
        for (var j = 0; j < bricksProperties.columns; j++) {
            var thisBrick = bricks[i][j];
            if (!thisBrick.wasHit) {
                if (ball.x > thisBrick.x
                        && ball.x < thisBrick.x + bricksProperties.width
                        && ball.y > thisBrick.y
                        && ball.y < thisBrick.y + bricksProperties.height) {
                    ball.ySpeed = -ball.ySpeed;
                    thisBrick.wasHit = true;
                    score++;
                    if (score == bricksProperties.rows * bricksProperties.columns) {
                        advanceLevel();
                    }
                }
            }
        }
    }
};

var advanceLevel = function() {
    window.cancelAnimationFrame(requestId);
    level++;
    score = 0;
    requestId = undefined;
    initLevel()
};

var drawRectangle = function(x, y, width, height, color) {
    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
    canvasCtx.closePath();
};

/* ---------- INIT ---------- */

var bricksInit = function() {
    for (var i = 0; i < bricksProperties.rows; i++) {
        bricks[i] = [];
        for (var j = 0; j < bricksProperties.columns; j++) {
            bricks[i][j] = {x: 0, y: 0, wasHit: false};
        }
    }
}

var init = function() {
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mousemoveHandler, false);
    initLevel();
};

var initLevel = function() {
    if (level < 6) {
        score = 39;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - ball.radius * 3;
        paddle.x = canvas.width / 2 - paddle.width / 2;
        drawLevel();
        bricksInit();
        setTimeout(draw, 3000); // let see the level before game starts
    } else {
        drawCongrats();
    }
};

init();