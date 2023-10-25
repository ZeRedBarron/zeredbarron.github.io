
//Variables for the blocks and platformer stuff.
var blockSize = 45;

var player, blocks = [], lamps = [], portals = [];

var update;
var randomBlock;

var levelMap;
var level = 0;
var levels = [];//This is where the levels will go.

var speed = 1;//This is the scrolling speed
var sensitivity = 45;//the higher the less sensitive it is
var seaLevel = 0;
var xDist = 0;//how far along we are. 
var renderDist = 500;//How far from the player blocks will spawn
var lampClickDist = 200;//How far from the player lamps will turn on

var particles = [];
var playerParticles = [];
var rain = [];
var splashes = [];

var center = {
	x: window.innerWidth/2,
	y: window.innerHeight/2
}
var screenSize = {
	w: canvas.width,
	h: canvas.height
}

function configureSize() {
	renderDist = screenSize.w/3;
	lampClickDist = renderDist/3;
}
configureSize();

var cam = {
	x: 0,
	y: 0,
};//Camera stuff

function randomBlock() {
	let x = randomInt(1, 11);
	switch(x) {
		case 1:
			return "BlockTexture";
		break;
		case 2:
			return "BlockTexture2";
		break;
		case 3:
			return "BlockTexture3";
		break;
		case 4:
			return "BlockTexture4";
		break;
		case 5:
			return "BlockTexture5";
		break;
		case 6:
			return "BlockTexture6";
		break;
		case 7:
			return "BlockTexture7";
		break;
		case 8:
			return "BlockTexture8";
		break;
		case 9:
			return "BlockTexture9";
		break;
		case 10:
			return "BlockTexture10";
		break;
		case 11:
			return "BlockTexture11";
		break;
		case 12:
			return "BlockTexture12";
		break;
	}
}

function config() {
	update();

	var lowest;
	var blockYs = [];
	for(var i in blocks) {
		
		blockYs.push(blocks[i].y);
	}

	seaLevel = player.y;

	xDist = player.x;

	//sound.play();
	
}

function raining() {
	//for(var i = 0; i < 2; i++) {
		rain.push(new RainParticle(
			cam.x,
			120,
			4,
			5,
			{r: 255, g: 255, b: 255},
		))
	//}
}

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
	if(this.mode === "ground") {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		if(!this.jumping) {
			for(var i = 0; i <= 3; i++) {
				playerParticles.push(new Particle(this.x - blockSize/2 + speed, this.y + blockSize/2 - 2 + random(0, -12), undefined, 4, [255, 255, 255], undefined, random(10, 30), random(0.5, 3.5), "fall", true, true));	
			}
		}
		ctx.drawImageC(imgs.get("PlayerTexture2"), 0, 0, this.w, this.h);
		ctx.restore();
	} else if("flight") {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		if(!this.jumping) {
			for(var i = 0; i <= 3; i++) {
				playerParticles.push(new Particle(this.x - blockSize/2 + speed, this.y + 12, random(-2, 2), 4, [255, 255, 255], random(90, 270), random(10, 30), random(0.5, 3.5), "fly", false, true));	
			}
		}
		ctx.drawImageC(imgs.get("PlayerTextureFlight"), 0, -1, this.w + 19, this.h + 19);
		ctx.restore();
	}
	
}
Player.prototype.update = function() {
	if(this.mode === "ground") {
		this.prevX = this.x;
	    this.prevY = this.y;
	
	    this.gravity += 0.18;
	    this.y += this.gravity;
		this.angle += 5;
	    
		for(var i = 0; i < blocks.length; i++){
			if(collide(this, blocks[i]) && blocks[i].type === "s") {
				update();
			}
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
				this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blockSize;
				//update();
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
	        this.gravity = -6.5;
			this.canJump = false;
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

function Block(x, y, type, image) {
	this.x = x; 
	this.y = y;
	this.w = 0;
	this.h = 0;
	this.prevX = x;
	this.prevY = y;
	this.speed = 5;

	this.image = image;

	this.type = type;
}
Block.prototype.display = function(drawn) {
	this.prevX = this.x;
	this.prevY = this.y;
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.strokeStyle = "rgb(0, 0, 0)";
	if(this.w > 1) {
		switch(this.type) {
			case "g":
				ctx.drawImageC(this.image, this.x, this.y, this.w, this.h);
			break;
			case 's':
				ctx.drawImageC(this.image, this.x, this.y, this.w, this.h);
			break;
			case '1':
				ctx.drawImageC(this.image, this.x, this.y, this.w, this.h);
			break;
		}
		
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

function PortalChange(x, y) {
	this.x = x;
	this.y = y;
	this.w = blockSize;
	this.h = blockSize;
}
PortalChange.prototype.all = function() {
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.rect(this.x, this.y, this.w, this.h);

	if(collide(this, player)) {
		player.mode = "flight";
	}
}

function Lamp() {
	Block.apply(this, arguments);
	this.upperLit = false;
	this.clickedOn = false;
	this.clickedOff = false;
}
Lamp.prototype = Object.create(Block.prototype);
Lamp.prototype.display = function(drawn, lit) {
	this.prevX = this.x;
	this.prevY = this.y;
	
	if(this.w > 1) {
		switch(this.type) {
			case "1":
				ctx.drawImageC(imgs.get("LampBase"), this.x, this.y, this.w, this.h);
			break;
			case "2":
				if(lit){
					ctx.drawImageC(imgs.get("LampMiddleLit"), this.x, this.y, this.w, this.h);
				} else {
					ctx.drawImageC(imgs.get("LampMiddleDark"), this.x, this.y, this.w, this.h);
				}
			break;
			case "3":
				if(lit){
					ctx.drawImageC(imgs.get("LampTopLit"), this.x, this.y, this.w, this.h);
					this.upperLit = true;
				} else {
					ctx.drawImageC(imgs.get("LampTopDark"), this.x, this.y, this.w, this.h);
					this.upperLit = false;
				}
				
			break;
		}

	}
	if (drawn) {
		void((this.fadeIn()) ? this.fadeIn:null);
	} else {
		this.fadeOut();
	}

	if(this.upperLit) {
		
	}

	if(this.upperLit && !this.clickedOn) {
		lampClick();
		this.clickedOn = true;
		this.clickedOff = false;
	}
	if(!this.upperLit && this.clickedOn && !this.clickedOff) {
		lampClick();
		this.clickedOn = false;
		this.clickedOff = true;
	}
	
}

function PlayerParticle() {
	Particle.call(this, [this.prevX, this.prevY, 1, 3, [0, 0, 0], random(180, 210)]);
}
PlayerParticle.prototype = Object.create(Particle.prototype);

function RainParticle(x, y, fall, sze, color) {
	this.x = x;
	this.y = y;
	this.prevX = x;
	this.prevY = y;
	this.w = sze;
	this.h = sze;
	this.col = color;
	this.size = sze;
	this.dead = false;
}
RainParticle.prototype.drawRain = function(){
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.fillStyle = "rgb(" + this.col.r + "," + this.col.g + "," + this.col.b + "," + ")";
	ctx.fill();
	ctx.rect(0, 0, this.sze, this.sze * 2);
	ctx.restore();
};
RainParticle.prototype.updateFall = function() {
	this.prevX = this.x;
	this.prevY = this.y;

	this.y += this.fall;

	for(var i in blocks) {
		if(collideHalf(this, blocks[i])) {
			this.dead = true;
			/*this.gravity = this.originalGrav / 2;
			this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h/2 - blockSize/2: blocks[i].y + blockSize/2 + this.h/2;
			this.originalGrav /= 2;*/
		}
	}
};

var player = new Player(undefined, undefined, "ground");

function game() {
	//Put background here.

	//ctx.drawImage(imgs.get("backgroundTest"), 0, 0, blockSize * 20, blockSize * 10);

	cam.x = lerp(cam.x, window.innerWidth / 2 - 20 / 2 - player.x, 0.1);
    cam.y = lerp(cam.y, window.innerHeight / 2 - 20 / 2 - player.y, 0.1);

	ctx.save();
	ctx.translate(cam.x, cam.y);

	for (var i in blocks) {
		if(1 * (dist(player.x, player.y, blocks[i].x, blocks[i].y) < renderDist)) {
			blocks[i].display(true);
		} else {
			blocks[i].display(false);
		}
	}
	for (var i in lamps) {
		if(1 * (dist(player.x, player.y, lamps[i].x, lamps[i].y) < renderDist)) {
			if(1 * (dist(player.x, player.y, lamps[i].x, lamps[i].y) < lampClickDist)) {
				lamps[i].display(true, true);
			} else {
				lamps[i].display(true, false);
			}	
		} else {
			lamps[i].display(false, false);
		}
	}
	for (var i in portals) {
		portals[i].all();
	}
	
	for(var i = playerParticles.length - 1; i > 0; i--) {
		playerParticles[i].playerDraw();
		if(playerParticles[i].mode === "fall") {
			playerParticles[i].updateFall();
		} else if (playerParticles[i].mode === "fly") {
			playerParticles[i].updateFly();
		}
		if(playerParticles[i].dead) {
			playerParticles.splice(i, 1);
			continue;
		}
	}

	//raining();
	for(var i = rain.length - 1; i > 0; i--) {
		rain[i].drawRain();
		rain[i].updateFall();
		if(rain[i].dead) {
			rain.splice(i, 1);
			continue;
		}
	}
	for(var i = splashes.length - 1; i > 0; i--) {
		splashes[i].playerDraw();
		splashes[i].updateFall();
		if(splashes[i].dead) {
			splashes.splice(i, 1);
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
	's':'spike',
	'1':'lampB',
	'2':'lampM',
	'3':'lampT',
	'c':'portal',
};

levels = [
	[
		'                                                                                                                          ',
		'                                                                                                                          ',
		'                                                                                 3              gggggggggggg              ',
		'                                                                                 2                                        ',
		'                                                                                 1                              3         ',
		'                             3                                               ggggggggggg                        2         ',
		'      3                      2                                          gg                                      1       c ',
		'      2                      1                ss           ss        ggggg       ss        gggg         gggggggggggggggggg',
		'p     1  ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
		'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
	],
];

function update() {
	blocks = [];
	lamps = [];
	levelMap = levels[level];

	for(var i = 0; i < levelMap.length; i++) {
		for(var j = 0; j < levelMap[i].length; j++) {
			switch(levelMapIndex[levelMap[i][j]]) {
				case "player":
					player.x = 15/2 + j * blockSize;
					player.y = 15/2 + i * blockSize;
				break;
				case "normal":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get(randomBlock())));
				break;
				case "spike":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get("Spike")));
				break;
				case "lampB":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMap[i][j], null));
				break;
				case "lampM":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMap[i][j], null));
				break;
				case "lampT":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMap[i][j], null));
				break;
				case "portal":
					portals.push(new PortalChange(j * blockSize, i * blockSize));
				break;
			}
		}
		if(i ===  levelMap.length + 1) {
			blocks[i].y = seaLevel;
		}
	}

	player.gravity = 0;
	player.angle = 180;
}
config();