const canvas = document.getElementById("main-page-game-canvas");
const ctx = canvas.getContext("2d");

const spritesheet = new Image();
spritesheet.addEventListener("load", () => {
    gameReady = true;
});
spritesheet.src = "res/img/main-page-game/spritesheet.png";

var gameReady = false;
function update() {
    if (!gameReady) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.fillStyle = "green";
    //ctx.fillRect(10, 10, 150, 100);
}
  
window.requestAnimationFrame(update);
  