// #558651
// #ffc66d
// #cc7832
// #6796a3

var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 17,
    x: canvas.width / 2,
    y: 0,
    xSpeed: 2,
    ySpeed: -2,
    color: "#655e6e"
}
ball.y = canvas.height - ball.radius * 3;

var paddle = {
    width: 90,
    height: 13,
    x: canvas.width / 2,
    color: "#558651",
    speed: 5
}

var keys = {
    rightPressed: false,
    leftPressed: false
}

var keyDownHandler = function(e) {
    if (e.keyCode == 39) {
        keys.rightPressed = true;
        console.log('hit');
    }
    else if (e.keyCode == 37)
        keys.leftPressed = true;
}

var keyUpHandler = function(e) {
    if (e.keyCode == 39) {
        keys.rightPressed = false;
        console.log('up');
    }
    else if (e.keyCode == 37)
        keys.leftPressed = false;
}

var draw = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
}

var drawPaddle = function() {
    canvasCtx.beginPath();
    canvasCtx.rect(paddle.x - paddle.width / 2, canvas.height - paddle.height, paddle.width, paddle.height);
    canvasCtx.fillStyle = paddle.color;
    canvasCtx.fill();
    canvasCtx.closePath;
    if (keys.rightPressed && paddle.x < canvas.width - paddle.width/2)
        paddle.x += paddle.speed;
    if (keys.leftPressed && paddle.x > paddle.width/2)
        paddle.x -= paddle.speed;
}

var drawBall = function() {
    canvasCtx.beginPath();
    canvasCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    canvasCtx.fillStyle = ball.color;
    canvasCtx.fill();
    canvasCtx.closePath();
    
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0)
        ball.xSpeed = -ball.xSpeed;
    if (ball.y - ball.radius < 0)
        ball.ySpeed = -ball.ySpeed;
    else if (ball.y + ball.radius > canvas.height - paddle.height) {
        if (ball.x > (paddle.x - paddle.width/2) && ball.x < (paddle.x + paddle.width/2))
            ball.ySpeed = -ball.ySpeed;
        else {
            alert("Game ooooover");
            document.location.reload();
        }
    }
    
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
}

var init = function() {
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setInterval(draw, 10);
}

init();