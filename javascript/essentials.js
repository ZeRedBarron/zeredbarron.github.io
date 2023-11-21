//This file contains important setup for JS

var bdy = window.document.querySelector("body");
var canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var keys = [], clicked = false, mouseX, mouseY;//Mouse and keyboard controls

var inter, runGame, frameClick = 0;

var scene = "credits";

var center = {
	x: window.innerWidth/2,
	y: window.innerHeight/2
}
var screenSize = {
	w: canvas.width,
	h: canvas.height
}
var blockSize = 45;

var ambienceRunning = false;

var imageLoaded = new Event("imgLoad");
var soundLoaded  = new Event("soundLoad");
var fullLoaded = new Event("fullLoad");

var soundComplete = new Promise(function(resolve) {
	window.addEventListener("soundLoad", resolve);
})
var imageComplete = new Promise(function(resolve) {
	window.addEventListener("imgLoad", resolve);
})

bdy.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});
bdy.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});

bdy.addEventListener("mousedown", function() {
	clicked = true;
});
bdy.addEventListener("mouseup", function() {
	clicked = false;
});
bdy.addEventListener("mousemove", function(e) {
	mouseX = e.pageX;
	mouseY = e.pageY;
});
    
var ctx = window.document.getElementById("canvas").getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
ctx.rect = function(x, y, w, h) {
	this.fillRect(x - w / 2, y - h / 2, w, h);
}
ctx.drawImageC = function(img, x, y, w, h) {
	this.drawImage(img, x - w / 2, y - h / 2, w, h);
}

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
}

function lerp(num1, num2, amt) {//For smooth camera motion
	return (num2 - num1) * amt + num1;
}

function random(min, max) {
	var newMax = max - min;
	return (Math.random() * newMax) + min;
}//Tamney's Natani's random function

function randomInt(min, max) {
	var newMax = max - min;
	return Math.round((Math.random() * newMax) + min);
}

function constrain(aNumber, aMin, aMax) { 
	return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber; 
}

function normalize(value, min, max) {
	var normalized = (value - min) / (max - min);
	return normalized;
}//https://stats.stackexchange.com/questions/70801/how-to-normalize-data-to-0-1-range

function waitForEvents(eventTarget, eventNames) {

	eventTarget = eventTarget || document;
	eventNames = (!Array.isArray(eventNames)) ? String(eventNames).split(',') : eventNames;

	// clean event names
	eventNames = eventNames.map(function(item) {
		return String(item).trim();
	})
	.filter(function(item) {
		return item !== '';
	});

	var items = [];

	// create a promise to wait for each event
	var listeners = eventNames.map(function(eventName) {
		return new Promise(function(resolve) {
			eventTarget.addEventListener(eventName, function(e) {
				items.push(e);
				resolve();
			}, false);
		});
	});

	// resolve once all events have fired
	return Promise.all(listeners).then(function() {
		return Promise.resolve(items);
	});
}

function Button(txt, img1, img2, x, y, w, h, action) {
	this.txt = txt;//Self Explanitory
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img1 = img1;
	this.img2 = img2;
	this.action = action;//What action
}
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


