//This file contains important setup for JS

var bdy = window.document.querySelector("body");
var canvas = document.getElementById("canvas");

var p1080 = {
	w: 1920,
	h: 963,
}//Screen size setup

canvas.width = p1080.w;
canvas.height = p1080.h;

var startButton = document.getElementById("start");

var keys = [], clicked = false, mouseX, mouseY, scrollY;//Mouse and keyboard controls

var inter, runGame, frameClick = 0;//interval variables

var scene = "menu";//current scene

var playerReset;

var center = {
	x: p1080.w/2,
	y: p1080.h/2
}
var screenSize = {
	w: p1080.w,
	h: p1080.h,
}
var blockSize = 45;//Global block size (almost) everything is bound to this

var ambienceRunning = false;

var imageLoaded = new Event("imgLoad");//New event listeners 
var soundLoaded  = new Event("soundLoad");
var soundAthent = new Event("fullLoad");

var soundComplete = new Promise(function(resolve) {
	window.addEventListener("soundLoad", resolve);
})
var imageComplete = new Promise(function(resolve) {
	window.addEventListener("imgLoad", resolve);
})
var clickComplete = new Promise(function(resolve) {
	startButton.addEventListener("click", resolve);
})

bdy.addEventListener("keydown", function(e) {//Keyboard reading
	keys[e.keyCode] = true;
});
bdy.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});

bdy.addEventListener("mousedown", function() {//Mouse reading
	clicked = true;
});
bdy.addEventListener("mouseup", function() {
	clicked = false;
});
bdy.addEventListener("mousemove", function(e) {
	var rect = canvas.getBoundingClientRect(), scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;//thanks: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
	mouseX = (e.clientX - rect.left) * scaleX;
	mouseY = (e.clientY - rect.top) * scaleY;
});
bdy.addEventListener("scroll", function(e){
	scrollY = e.scrollY;
});
    
var ctx = window.document.getElementById("canvas").getContext("2d");//2d context
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
ctx.rect = function(x, y, w, h) {
	this.fillRect(x - w / 2, y - h / 2, w, h);
}//center rectangle function
ctx.drawImageC = function(img, x, y, w, h) {
	this.drawImage(img, x - w / 2, y - h / 2, w, h);
}//cneter image drawing

function close(targets, num){
    var allDists = [];
    for(var i = 0; i < targets.length; i++){
        allDists.push(Math.abs(targets[i] - num));
    }
    
    var currentLow = allDists[0], final = 0;
    for(var j = 0; j < allDists.length; j++){
        if(allDists[j] < currentLow){
            currentLow = allDists[j];
            final = j;
        }
    }
    return targets[final];
}//Closest value for array.

function collide(input1, input2) {
	return input1.x - input2.x < input2.w &&
		input2.x - input1.x < input1.w &&
		input1.y - input2.y < input2.h &&
		input2.y - input1.y < input1.h;
}//Block collision function

function collideHalf(player, block){
    return player.x + (player.w/2) > block.x - (blockSize/2) &&
           player.x - (player.w/2) < block.x + (blockSize/2) &&
           player.y + (player.h/2) > block.y - (blockSize/2) &&
           player.y - (player.h/2) < block.y + (blockSize/2);
}//Block collide for half

function dist(x1, y1, x2, y2) {
    return Math.hypot((x2 - x1), (y2 - y1));
}//Distance between two points

function lerp(num1, num2, amt) {
	return (num2 - num1) * amt + num1;
}//For smooth camera motion

function random(min, max) {
	var newMax = max - min;
	return (Math.random() * newMax) + min;
}//Tamney's Natani's random function

function randomInt(min, max) {
	var newMax = max - min;
	return Math.round((Math.random() * newMax) + min);
}//Random integer

function constrain(aNumber, aMin, aMax) { 
	return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber; 
}//Contrainting a number between two values.  Also made by Tamney Natani

function normalize(value, min, max) {
	var normalized = (value - min) / (max - min);
	return normalized;
}//https://stats.stackexchange.com/questions/70801/how-to-normalize-data-to-0-1-range

function returnToGame(){
	document.getElementById("links").style.display = "none";
	document.getElementById("game").style.display = "block";
	bdy.style.overflow = "hidden";
}//Reseting the CSS

function Button(txt, img1, img2, x, y, w, h, action) {
	this.txt = txt;//Self Explanitory
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img1 = img1;
	this.img2 = img2;
	this.action = action;//What action
}//Button object
Button.prototype.all = function() {
	if(mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY < this.y + this.h / 2 && mouseY > this.y - this.h / 2) {
		if(!dead) {
			bdy.style.cursor = "pointer";
		} else {
			bdy.style.cursor = "not-allowed";
		}
		ctx.drawImageC(this.img2, this.x, this.y, this.w, this.h);
		if(clicked) {
			this.action();
			clicked = false;
		}
	} else {
		ctx.drawImageC(this.img1, this.x, this.y, this.w, this.h);
	}
};

var Transition = function(){
	this.on = false;
	this.transTo = undefined;
	this.x = 0;
	this.xC = 40;
};//Transition objects.  Made by Matthew Anderson
Transition.prototype.start = function(where) {
	this.on = true;
	this.transTo = where;
	this.x = 0;
};
Transition.prototype.display = function() {
	ctx.save();
	ctx.translate(-screenSize.w, 0);
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(this.x, 0, screenSize.w, screenSize.h);
	ctx.restore();
};
Transition.prototype.update = function() {
	if(this.on){// if the tranition is on: 
		this.x += this.xC;

		if(this.x > screenSize.w){
			scene = this.transTo;
		}else if(this.x > screenSize.w * 2){
			this.on = false;
			this.xC = 40;
		}

	}
};
Transition.prototype.run = function() {
    this.update(); 
	if(this.on){ 
		this.display();    
	} 
};
var trans = new Transition();
