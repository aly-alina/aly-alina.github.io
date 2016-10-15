// #558651
// #ffc66d
// #cc7832
// #6796a3

var canvas = document.getElementById("gameCanvas");
var canvasCtx = canvas.getContext("2d");

var ball = {
    radius: 20,
    x: 0,
    y: 0,
    xSpeed: 2,
    ySpeed: -2,
    color: "#655e6e"
}
ball.x = canvas.width / 2;
ball.y = canvas.height - ball.radius;

var draw = function() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
}

var drawBall = function() {
    canvasCtx.beginPath();
    canvasCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    canvasCtx.fillStyle = ball.color;
    canvasCtx.fill();
    canvasCtx.closePath();
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
}

var init = function() {
    setInterval(draw, 10);
}

init();