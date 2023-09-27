//This file contains important setup for JS

var bdy = window.document.querySelector("body");
var canvas = document.getElementById("canvas");

var keys = [], clicked = false, mouseX, mouseY;//Mouse and keyboard controls

var inter, runGame, frameClick = 0;

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
