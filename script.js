
var ctx = window.document.getElementById("canvas").getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
ctx.rect = function(x, y, w, h) {
	this.fillRect(x - w / 2, y - h / 2, w, h);
}
ctx.drawImageC = function(img, x, y, w, h) {
	this.drawImage(img, x - w / 2, y - h / 2, w, h);
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
	{
		name: "BlockTexture",
		url: "Green Block.png"
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
var xDist = 0;//how far along we are. 

var particles = [];

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
           player.y + (player.h/2) > block.y &&
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

function config() {
	update();

	var lowest;
	var blockYs = [];
	for(var i in blocks) {
		
		blockYs.push(blocks[i].y);
	}

	seaLevel = player.y;

	xDist = player.x;
	
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
	this.angle = 0;
	this.gravity = 0;
	this.canJump = false;
}
Player.prototype.draw = function() {
	ctx.fillStyle = "rgb(255, 0, 0)";
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * Math.PI / 180);
	ctx.rect(0, 0, this.w, this.h);

	//particles.push(new Particle(400, 400, 1, 3, [0, 0, 0], random(180, 210)));
	
	ctx.restore();
	
}
Player.prototype.update = function() {
    this.prevX = this.x;
    this.prevY = this.y;

    this.gravity += 0.18;
    this.y += this.gravity;
	this.angle += 5;
    
	for(var i = 0; i < blocks.length; i++){
		if(blocks[i].half && collideHalf(this, blocks[i])){
			this.gravity = 0;
			this.angle = close([0, 90, 180, 270, 360], this.angle);
			
			if(this.y < blocks[i].y){
				this.canJump = true;
				this.y = blocks[i].y - (this.h/2);
			} else {
				this.y = blocks[i].y + (blockSize/2) + (this.h/2);
			}
			
		} else if(collide(this, blocks[i]) && !blocks[i].half){
			this.gravity = 0;
			this.angle = close([0, 90, 180, 270, 360], this.angle);
			
			if(this.y < blocks[i].y){
				this.canJump = true;
				this.y = blocks[i].y - (blockSize/2) - (this.h/2);
			} else {
				this.y = blocks[i].y + (blockSize/2) + (this.h/2);
			}
			
		}
		if(collide(this, blocks[i])) {
			if(this.prevY < blocks[i].prevY) {
            	this.canJump = true;
        	}
		}
	}

	/*
	for(var i in blocks) {
        if(collide(this, blocks[i])) {
            if(this.prevY < blocks[i].prevY) {
                this.canJump = true;
            }
            this.gravity = 0;
            this.angle = close([0, 90, 180, 270, 360], this.angle);
            this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h : blocks[i].y + blockSize;
        }
    }
	*/
    
    this.x += speed;

	for(var i = 0; i < blocks.length; i++){
		if(collide(this, blocks[i]) && !blocks[i].half){
			//update();
			this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blockSize;
		}
	}
	
	/*
    for(var i in blocks) {
        if(collide(this, blocks[i])) {
            this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blockSize;
        }
    }
	*/
    
    if((keys[32] || keys[38]) && this.canJump) {
        this.gravity = -8;
		this.canJump = false;
    }
    

	this.angle = this.angle % 360;

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
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.strokeStyle = "rgb(0, 0, 0)";
	if(this.w > 1) {
		//ctx.rect(this.x, this.y, this.w, this.h);
		ctx.drawImageC(imgs.get("BlockTexture"), this.x, this.y, this.w, this.h);
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

//Particle Object
function Particle(x, y, speed, sze, color, angle) {
	this.x = x;
	this.y = y;
	this.col = color;
	this.size = sze;
	this.speed = speed;
	this.angle = angle;
	this.life = 200;
	this.startLife = 0;
	this.dead = false;
	this.rot = 0;
}
Particle.prototype.draw = function() {
	var change;
	ctx.save();
	ctx.translate(this.x, this.y);
	/*if(this.startLife > 100) {
		change = this.life/100;
	} else {
		change = this.startLife/100;
	}*/
	
	ctx.fillStyle = "rgba(" + this.col[0] + "," + this.col[1] + "," + this.col[2] + "," + this.life + ")"
	ctx.beginPath();
	ctx.ellipse(0, 0, this.size/2, this.size/2, 0, 0, Math.PI*8);
	ctx.fill();
	ctx.closePath();
	ctx.restore();
};
Particle.prototype.update = function() {
	this.x += Math.cos(this.angle * Math.PI/180) * this.speed;
	this.y += Math.sin(this.angle * Math.PI/180) * this.speed;
	
	this.rot++;
	
	this.life--;
	this.startLife++;
	if(this.life < 0) {
		this.dead = true;
	}
};

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

	xDist += speed;
	
}

levelMapIndex = {
	'p':'player',
	'g':'normal',
};

levels = [
	[
		'                               gggggggggggggggg  g',
		'                                                  ',
		'                                                  ',
		'                     gggggggggggg                 ',
		'                                                  ',
		'                                                  ',
		'p     gggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggg',
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

	for(var i = particles.length - 1; i > 0; i--) {
		particles[i].draw();
		particles[i].update();
		if(particles[i].dead) {
			particles.splice(i, 1);
			continue;
		}
	}

	//console.log(player.x + " " + xDist)

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