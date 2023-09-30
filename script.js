
var ctx = window.document.getElementById("canvas").getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
ctx.rect = function(x, y, w, h) {
	this.fillRect(x - w / 2, y - h / 2, w, h);
}

var imgs = new ImageCollection([
	{
		name: "test1",
		url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Maestro_Batik_Tulis_di_Imogiri.jpg/500px-Maestro_Batik_Tulis_di_Imogiri.jpg"
	},
	{
		name: "MoonBackground",
		url: "Moon Background 2.png"
	},
]);

//All setup

//Variables for the blocks and platformer stuff.
var blockSize = 45;

var player, blocks = [];

var update;

var levelMap;
var level = 0;
var levels = [];//This is where the levels will go.

var speed = 1;//This is the scrolling speed
var sensitivity = 45;//the higher the less sensitive it is
var seaLevel = 0;

var center = {
	x: window.innerWidth/2,
	y: window.innerHeight/2
}
var screenSize = {
	w: canvas.width,
	h: canvas.height
}

var cam = {
	x: 0,
	y: 0,
};//Camera stuff

function collide(input1, input2) {
	return input1.x - input2.x < input2.w &&
		input2.x - input1.x < input1.w &&
		input1.y - input2.y < input2.h &&
		input2.y - input1.y < input1.h;
}//Block collision function

function dist(x1, y1, x2, y2) {
    return Math.hypot((x2 - x1), (y2 - y1));
}

function lerp(num1, num2, amt) {//For smooth camera motion
	return (num2 - num1) * amt + num1;
}

function config() {
	update();

	var lowest;
	var blockYs = [];
	for(var i in blocks) {
		
		blockYs.push(blocks[i].y);
	}

	seaLevel = player.y;
	
}

/*Array.prototype.min = function (){
	return Math.min.apply(null, this);
};*/

//Player Object
function Player(x, y) {
	this.x = x;
	this.y = y;
	this.prevX = x;
	this.prevY = y;
	this.w = 45;
	this.h = 45;
	this.gravity = 0;
	this.canJump = false;
}
Player.prototype.draw = function() {
	ctx.fillStyle = "rgb(255, 0, 0)"
	ctx.rect(this.x, this.y, this.w, this.h);
}
Player.prototype.update = function() {
    this.prevX = this.x;
    this.prevY = this.y;

    this.y += this.gravity;
    
    this.gravity += 0.18;

    for(var i in blocks) {
        if(collide(this, blocks[i])) {
            if(this.prevY < blocks[i].prevY) {
                this.canJump = true;
            }
            this.gravity = 0;
            
            this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h : blocks[i].y + blockSize;
        }
    }
    
    this.x += speed;

    for(var i in blocks) {
        if(collide(this, blocks[i])) {
            this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blockSize;
        }
    }
    
    if((keys[32] || keys[38]) && this.canJump) {
        this.gravity = -8;
    }
    this.canJump = false;

	speed = ((seaLevel - this.y)/50) + 3;
};

function Block(x, y, type) {
	this.x = x; 
	this.y = y;
	this.w = 0;
	this.h = 0;
	this.prevX = x;
	this.prevY = y;
	this.speed = 5;

	this.type = type;
}
Block.prototype.display = function(drawn) {
	this.prevX = this.x;
	this.prevY = this.y;
	
	ctx.fillStyle = "rgb(0, 0, 0)"
	if(this.w > 1) {
		ctx.rect(this.x, this.y, this.w, this.h);
	}
	if (drawn) {
		void((this.fadeIn()) ? this.fadeIn:null);
	} else {
		this.fadeOut();
	}
	
}
Block.prototype.fadeIn = function() {
	this.w += this.speed;
	this.h += this.speed;

	if(this.w >= blockSize || this.h >= blockSize) {
		this.w = blockSize;
		this.h = blockSize;
		return true;
	} else {
		return false;
	}
}
Block.prototype.fadeOut = function() {
	if(this.w >= 0 || this.h >= 0){
		
		this.w -= this.speed;
		this.h -= this.speed;

		if(this.w <= 0 || this.h <= 0) {
			return false;
		} else {
			return true;
		}
		
	}
}

var player = new Player(undefined, undefined);

function game() {
	//Put background here.

	cam.x = lerp(cam.x, window.innerWidth / 2 - 20 / 2 - player.x, 0.1);
    cam.y = lerp(cam.y, window.innerHeight / 2 - 20 / 2 - player.y, 0.1);

	ctx.save();
	ctx.translate(cam.x, cam.y);

	for (var i in blocks) {
		if(1 * (dist(player.x, player.y, blocks[i].x, blocks[i].y) < 500)) {
			blocks[i].display(true);
		} else {
			blocks[i].display(false);
		}
		//blocks[i].display();
	}
	player.update();
	player.draw();

	ctx.restore();
}

levelMapIndex = {
	'p':'player',
	'g':'normal',
};

levels = [
	[
		'                           gggggggggggggg   ',
		'                                            ',
		'                                            ',
		'                     gggggggggggg           ',
		'                                            ',
		'                                            ',
		'p     gggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggg',
	],
];

function update() {
	blocks = [];
	levelMap = levels[level];

	for(var i = 0; i < levelMap.length; i++) {
		for(var j = 0; j < levelMap[i].length; j++) {
			switch(levelMapIndex[levelMap[i][j]]) {
				case "player":
					player.x = 15/2 + j * blockSize;
					player.y = 15/2 + i * blockSize;
				break;
				case "normal":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j]));
				break;
			}
		}
		if(i ===  levelMap.length + 1) {
			blocks[i].y = seaLevel;
		}
	}
}
config();

function runGame() {
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);//redraw a white background for resetting the screen

	ctx.fillStyle = "rgb(0, 0, 0)";
	//ctx.textFont("20px Arial");
	ctx.fillText("Speed: " + speed, 20, 20);
	ctx.fillText("Sea Level: " + seaLevel, 20, 40);
	ctx.fillText("Cam X: " + cam.x, 20, 60);
	ctx.fillText("Cam Y: " + cam.y, 20, 80);
	//console.log(cam.x + " " + cam.y);
	

	game();

	//if(frameClick > 100) {
		//ctx.drawImage(imgs.get("test2"), 30, 30);
	//}
	//ctx.drawImage(imgs.get("MoonBackground"), 30, 30);


	frameClick++;

	if(speed < 1) {
		speed = 1;
	}
}

inter = window.setInterval(runGame, 1000 / 60)