// #558651
// #ffc66d
// #cc7832
// #6796a3

var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 12,
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
    x: 0,
    color: "#558651",
    speed: 5
}
paddle.x = canvas.width / 2 - paddle.width / 2;

var bricksProperties = {
    rows: 3,
    columns: 10,
    offsetTop: 30,
    offsetLeft: 30,
    width: 45,
    height: 12,
    padding: 10
}

var keys = {
    rightPressed: false,
    leftPressed: false
}

var keyDownHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = true;
    else if (e.keyCode == 37)
        keys.leftPressed = true;
}

var keyUpHandler = function(e) {
    if (e.keyCode == 39)
        keys.rightPressed = false;
    else if (e.keyCode == 37)
        keys.leftPressed = false;
}

var draw = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();
}

var drawPaddle = function() {
    canvasCtx.beginPath();
    canvasCtx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    canvasCtx.fillStyle = paddle.color;
    canvasCtx.fill();
    canvasCtx.closePath;
    if (keys.rightPressed && paddle.x + paddle.width < canvas.width)
        paddle.x += paddle.speed;
    if (keys.leftPressed && paddle.x > 0)
        paddle.x -= paddle.speed;
}

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
            console.log(ball.x);
            console.log(paddle.x);
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