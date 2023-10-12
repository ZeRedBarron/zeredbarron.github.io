
function runGame() {
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);//redraw a white background for resetting the screen

	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.fillText("Speed: " + speed, 20, 20);
	ctx.fillText("Sea Level: " + seaLevel, 20, 40);
	ctx.fillText("Cam X: " + cam.x, 20, 60);
	ctx.fillText("Cam Y: " + cam.y, 20, 80);
	ctx.fillText("Mode: " + player.mode, 20, 100);

	game();

	//ctx.drawImage(imgs.get("blank"), 30, 30, 200, 200);

	frameClick++;

	if(speed < 1) {
		speed = 1;
	}
}

imgs.waitToRun().then(function(){
	document.getElementById("load").style.display = "none";
	inter = window.setInterval(runGame, 1000 / 60);
});