
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
var playerParticles = [];

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
function Player(x, y, mode) {
	this.x = x;
	this.y = y;
	this.prevX = x;
	this.prevY = y;
	this.w = 45;
	this.h = 45;
	this.angle = 0;
	this.gravity = 0;
	this.flightSensitivity = 6;
	this.fallRate = 2;
	this.canJump = false;
	this.jumping = false;
	this.mode = mode;
}
Player.prototype.draw = function() {
	ctx.fillStyle = "rgb(255, 0, 0)";
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * Math.PI / 180);
	if(!this.jumping) {
		for(var i = 0; i <= 5; i++) {
			playerParticles.push(new Particle(this.x - blockSize/2 + 5, this.y + blockSize/2 - 1, random(0.5, 2), random(1, 3), [0, 0, 0], random(180, 210), 50));	
		}
	}
	ctx.rect(0, 0, this.w, this.h);
	ctx.restore();
}
Player.prototype.update = function() {
	if(this.mode === "ground") {
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
			//console.log("hi");
			
	    }
	
		if(this.angle != close([0, 90, 180, 270, 360], this.angle)) {
			this.jumping = true;
		} else {
			this.jumping = false;
		}
		
		this.angle = this.angle % 360;
	} 
	else if (this.mode === "flight") {
		this.prevX = this.x;
	    this.prevY = this.y;
		
	    this.y += this.fallRate;

		for(var i in blocks) {
	        if(collide(this, blocks[i])) {
	            this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h : blocks[i].y + blocks[i].h;
	        }
	    }

		this.x += speed;
	
		for(var i in blocks){
			if(collide(this, blocks[i])){
				this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blocks[i].h;
			}
		}

		if(keys[32] || keys[38]) {
			this.fallRate -= 0.5;
		} else {
			this.fallRate += 0.5;
		}

		this.fallRate = constrain(this.fallRate, -this.flightSensitivity, this.flightSensitivity);

		
		
	}

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
function Particle(x, y, speed, sze, color, angle, life) {
	this.x = x;
	this.y = y;
	this.prevX = x;
	this.prevY = y;
	this.gravity = -3;
	this.w = sze;
	this.h = sze;
	this.col = color;
	this.size = sze;
	this.speed = speed;
	this.angle = angle;
	this.life = life;
	this.startLife = 0;
	this.dead = false;
	this.rot = 0;
	this.startLifeValue = this.life;
}
Particle.prototype.draw = function() {
	ctx.save();
	ctx.translate(this.x, this.y);
	
	ctx.fillStyle = "rgba(" + this.col[0] + "," + this.col[1] + "," + this.col[2] + "," + this.life/this.startLifeValue + ")"
	ctx.beginPath();
	ctx.ellipse(0, 0, this.size/2, this.size/2, 0, 0, Math.PI*8);
	ctx.fill();
	ctx.closePath();
	ctx.restore();
};
Particle.prototype.updateFly = function() {
	this.x += Math.cos(this.angle * Math.PI/180) * this.speed;
	this.y += Math.sin(this.angle * Math.PI/180) * this.speed;
	
	this.rot++;
	
	this.life--;
	if(this.life < 0) {
		this.dead = true;
	}
};
Particle.prototype.updateFall = function() {
	this.prevX = this.x;
    this.prevY = this.y;

    this.gravity += 0.18;
    this.y += this.gravity;

	for(var i in blocks) {
        if(collideHalf(this, blocks[i])) {
            this.gravity = 0;
            this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h/2 - blockSize/2: blocks[i].y + blockSize/2 + this.h/2;
        }
    }

	/*for(var i in blocks){
		if(collide(this, blocks[i])){
			this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blocks[i].h;
		}
	}*/
	
	this.life--;
	if(this.life < 0) {
		this.dead = true;
	}
};

function PlayerParticle() {
	Particle.call(this, [this.prevX, this.prevY, 1, 3, [0, 0, 0], random(180, 210)]);
}
PlayerParticle.prototype = Object.create(Particle.prototype);
Particle.prototype.playerDraw = function() {
	ctx.save();
	ctx.translate(this.x, this.y);
	
	ctx.fillStyle = "rgba(" + this.col[0] + "," + this.col[1] + "," + this.col[2] + "," + this.life/this.startLifeValue + ")"
	ctx.rect(0, 0, this.size, this.size, 0, 0);
	ctx.restore();
}

var player = new Player(undefined, undefined, "flight");

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
	
	for(var i = playerParticles.length - 1; i > 0; i--) {
		playerParticles[i].playerDraw();
		playerParticles[i].updateFall();
		if(playerParticles[i].dead) {
			playerParticles.splice(i, 1);
			continue;
		}
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
	ctx.fillText("Mode: " + player.mode, 20, 100);
	//console.log(cam.x + " " + cam.y);
	

	game();

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

inter = window.setInterval(runGame, 1000 / 60);