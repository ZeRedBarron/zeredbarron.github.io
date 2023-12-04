//Variables for the blocks and platformer stuff.
var player, blocks = [], lamps = [], portals = [], portalPoints = [], menuBlocks = [];

var update, updateMenu;
var randomBlock;

var levelMap;
var level = 0;
var levels = [];//This is where the levels will go.

var speed = 1;//This is the scrolling speed
var menuSpeed = 1;
var sensitivity = 45;//the higher the less sensitive it is
var seaLevel = 0;
var menuSeaLevel = 0;
var xDist = 0;//how far along we are. 
var renderDist = 500;//How far from the player blocks will spawn
var lampClickDist = 200;//How far from the player lamps will turn on

var particles = [];
var playerParticles = [];
var rain = [];
var splashes = [];
var brightness = 0;
var nearPortal = false;

var dead = false;
var win = false;
var win2 = !false;
var winDist;

var firstTime = true;
var paused = false;
var deathPaused = false;

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

function randomDirt() {
	let x = randomInt(1, 12);
	switch(x) {
		case 1:
			return "DirtTexture1";
		break;
		case 2:
			return "DirtTexture2";
		break;
		case 3:
			return "DirtTexture3";
		break;
		case 4:
			return "DirtTexture4";
		break;
		case 5:
			return "DirtTexture5";
		break;
		case 6:
			return "DirtTexture6";
		break;
		case 7:
			return "DirtTexture7";
		break;
		case 8:
			return "DirtTexture8";
		break;
		case 9:
			return "DirtTexture9";
		break;
		case 10:
			return "DirtTexture10";
		break;
		case 11:
			return "DirtTexture11";
		break;
		case 12:
			return "DirtTexture12";
		break;
	}
}

function randomWood() {
	let x = randomInt(0, 4);
	switch(x) {
		case 0:
			return "WoodTexture";
		break;
		case 1:
			return "WoodTexture2";
		break;
		case 2:
			return "WoodTexture3";
		break;
		case 3:
			return "WoodTexture4";
		break;
		case 4:
			return "WoodTexture5";
		break;
	}
}

function config() {
	update();
	
	seaLevel = player.y;

	xDist = player.x;
}

function configMenu() {
	updateMenu();

	menuSeaLevel = menuPlayer.y + 6;
}

function raining() {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
	for(var i = 0; i < 2; i++) {
		rain.push(new Particle(
			player.x + random(-screenSize.w, screenSize.w + speed * 4), 
			player.y - screenSize.h/2 - 400, 
			undefined, 
			2, 
			[105, 202, 221], 
			undefined, 
			0, 
			0, 
			"fall", 
			false, 
			false
		));	
	}
	if(!ambienceRunning) {
		sounds.get("rain").play();
		ambienceRunning = true;//hehe all the shenaganszzzz
	}
	for(var i = rain.length - 1; i > 0; i--) {
		rain[i].playerDraw();//drawRain();
		rain[i].updateFall();
		if(rain[i].dead) {
			for(var j = 0; j < 3; j++) {
				splashes.push(new Particle(
					rain[i].x + random(-5, 5), 
					rain[i].y + random(-2, 2), 
					undefined, 
					2, 
					[105, 202, 221], 
					undefined, 
					20, 
					random(1, 2.5), 
					"fall", 
					false, 
					true
				));	
			}
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
}

function screenFlash() {
	brightness = 255;
}

function DeathPause() {
	this.time = 100;
	this.timer = 0;
	this.running = false;
	this.done = false;
}
DeathPause.prototype.start = function() {
	this.running = true;
}
DeathPause.prototype.waiting = function() {
	if(this.running && this.timer <= this.time) {
		return true;
	} else {
		return false;
	}
}
DeathPause.prototype.reset = function() {
	this.running = false;
	this.timer = 0;
}
DeathPause.prototype.update = function() {
	if(this.running) {
		this.timer++;
	}
	if(this.timer > this.time) {
		this.done = true;
		this.running = false;
		this.timer = 0;
	}
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
	this.deathSoundPlayed = false;
}
Player.prototype.draw = function() {
	if(this.mode === "ground") {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		if(!this.jumping) {
			for(var i = 0; i <= 3; i++) {
				if(!paused) {
					playerParticles.push(new Particle(
						this.x - blockSize/2 + speed, 
						this.y + blockSize/2 - 2 + random(0, -12), 
						undefined, 
						4, 
						[255, 255, 255], 
						undefined, 
						random(10, 30), 
						random(0.5, 3.5), 
						"fall", 
						true, 
						true
					));	
				}
			}
		}
		ctx.drawImageC(imgs.get("PlayerTexture2"), 0, 0, this.w, this.h);
		ctx.restore();
	} else if("flight") {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		for(var i = 0; i <= 3; i++) {
			if(!paused) {
				playerParticles.push(new Particle(
					this.x - blockSize/2 + speed, 
					this.y + 12, 
					random(-2, 2), 
					4, 
					[255, 255, 255], 
					random(90, 270), 
					random(10, 30), 
					random(0.5, 3.5), 
					"fly", 
					false, 
					true));	
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
			if(collide(this, blocks[i]) && (blocks[i].type === "s"|| blocks[i].type === "S")) {
				dead = true;
				if(!this.deathSoundPlayed) {
					hitWall();
					for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
						playerParticles.push(new Particle(
							this.x + random(-blockSize/2, blockSize/2), 
							this.y + random(-blockSize/2, blockSize/2), 
							undefined, 
							4, 
							[255, 255, 255], 
							undefined, 
							random(50, 200), 
							random(1, 6), 
							"fall", 
							false, 
							true
						));	
					}
				}
				this.deathSoundPlayed = true;
			}
			if(blocks[i].half && collideHalf(this, blocks[i]) && blocks[i].type !== "b"){
				if(blocks[i].type !== 't') {
					this.gravity = 0;
				} else {
					this.gravity = -10;//Tramps jumper
					bounceSound();
				}
				this.angle = close([0, 90, 180, 270, 360], this.angle);
				
				if(this.y < blocks[i].y){
					this.canJump = true;
					this.y = blocks[i].y - (this.h/2);
				} else {
					this.y = blocks[i].y + (blockSize/2) + (this.h/2);
				}
				
			} else if(collide(this, blocks[i]) && !blocks[i].half && blocks[i].type !== "b"){
				if(blocks[i].type !== 't') {
					this.gravity = 0;
				} else {
					this.gravity = -10;//Tramps
					bounceSound();
				}
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
			if(collide(this, blocks[i]) && !blocks[i].half && blocks[i].type !== "b"){
				this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blockSize;
				//update();
				dead = true;
				if(!this.deathSoundPlayed) {
					hitWall();
					for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
						playerParticles.push(new Particle(
							this.x + random(-blockSize/2, blockSize/2), 
							this.y + random(-blockSize/2, blockSize/2), 
							undefined, 
							4, 
							[255, 255, 255], 
							undefined, 
							random(50, 200), 
							random(1, 6), 
							"fall", 
							false, 
							true
						));	
					}
				}
				this.deathSoundPlayed = true;
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

		if(dead === false) {
			this.deathSoundPlayed = false;
		}
	} 
	else if (this.mode === "flight") {
		this.canJump = false;
		this.prevX = this.x;
	    this.prevY = this.y;
		
	    this.y += this.fallRate;

		this.angle = 0;

		for(var i = 0; i < blocks.length; i++) {
			if(collide(this, blocks[i]) && (blocks[i].type === "s" || blocks[i].type === "S")) {
				dead = true;
				if(!this.deathSoundPlayed) {
					hitWall();
					for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
						playerParticles.push(new Particle(
							this.x + random(-blockSize/2, blockSize/2), 
							this.y + random(-blockSize/2, blockSize/2), 
							undefined, 
							4, 
							[255, 255, 255], 
							undefined, 
							random(50, 200), 
							random(1, 6), 
							"fall", 
							false, 
							true
						));	
					}
				}
				this.deathSoundPlayed = true;
			}
	        if(collide(this, blocks[i])) {
	            this.y = (this.prevY < blocks[i].prevY) ? blocks[i].y - this.h : blocks[i].y + blocks[i].h;
	        }
	    }

		this.x += speed;
	
		for(var i = 0; i < blocks.length; i++){
			if(collide(this, blocks[i])){
				this.x = (this.prevX < blocks[i].prevX) ? blocks[i].x - this.w : blocks[i].x + blocks[i].h;
				dead = true;
				if(!this.deathSoundPlayed) {
					hitWall();
					for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
						playerParticles.push(new Particle(
							this.x + random(-blockSize/2, blockSize/2), 
							this.y + random(-blockSize/2, blockSize/2), 
							undefined, 
							4, 
							[255, 255, 255], 
							undefined, 
							random(50, 200), 
							random(1, 6), 
							"fall", 
							false, 
							true
						));	
					}
				}
				this.deathSoundPlayed = true;
			}
		}

		if(keys[32] || keys[38]) {
			this.fallRate -= 0.5;
		} else {
			this.fallRate += 0.5;
		}

		this.fallRate = constrain(this.fallRate, -this.flightSensitivity, this.flightSensitivity);

		if(dead === false) {
			this.deathSoundPlayed = false;
		}
	}

	speed = ((seaLevel - this.y)/150) + 3;

	if(this.y > 8000) {
		dead = true;
	}
};
Player.prototype.menuUpdate = function() {
	this.prevX = this.x;
	this.prevY = this.y;

	this.gravity += 0.18;
	this.y += this.gravity;
	this.angle += 5;

	for(var i = 0; i < menuBlocks.length; i++){
		if(collide(this, menuBlocks[i]) && (menuBlocks[i].type === "s"|| menuBlocks[i].type === "S")) {
			dead = true;
			if(!this.deathSoundPlayed) {
				hitWall();
				for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
					playerParticles.push(new Particle(
						this.x + random(-blockSize/2, blockSize/2), 
						this.y + random(-blockSize/2, blockSize/2), 
						undefined, 
						4, 
						[255, 255, 255], 
						undefined, 
						random(50, 200), 
						random(1, 6), 
						"fall", 
						false, 
						true
					));	
				}
			}
			this.deathSoundPlayed = true;
		}
		if(menuBlocks[i].half && collideHalf(this, menuBlocks[i]) && menuBlocks[i].type !== "b"){
			if(menuBlocks[i].type !== 't') {
				this.gravity = 0;
			} else {
				this.gravity = -10;//Tramps jumper
				bounceSound();
			}
			this.angle = close([0, 90, 180, 270, 360], this.angle);

			if(this.y < menuBlocks[i].y){
				this.canJump = true;
				this.y = menuBlocks[i].y - (this.h/2);
			} else {
				this.y = menuBlocks[i].y + (blockSize/2) + (this.h/2);
			}

		} else if(collide(this, menuBlocks[i]) && !menuBlocks[i].half && menuBlocks[i].type !== "b"){
			if(menuBlocks[i].type !== 't') {
				this.gravity = 0;
			} else {
				this.gravity = -10;//Tramps
				bounceSound();
			}
			this.angle = close([0, 90, 180, 270, 360], this.angle);

			if(this.y < menuBlocks[i].y){
				this.canJump = true;
				this.y = menuBlocks[i].y - (blockSize/2) - (this.h/2);
			} else {
				this.y = menuBlocks[i].y + (blockSize/2) + (this.h/2);
			}

		}
		if(collide(this, menuBlocks[i])) {
			if(this.prevY < menuBlocks[i].prevY) {
				this.canJump = true;
			}
		}
	}
	
	this.x += menuSpeed;

	for(var i = 0; i < menuBlocks.length; i++){
		if(collide(this, menuBlocks[i]) && !menuBlocks[i].half && menuBlocks[i].type !== "b"){
			this.x = (this.prevX < menuBlocks[i].prevX) ? menuBlocks[i].x - this.w : menuBlocks[i].x + blockSize;
			//update();
			dead = true;
			if(!this.deathSoundPlayed) {
				hitWall();
				for(var i = 100; i > 0; i--) {//x, y, speed, sze, color, angle, life, height, mode, wiggle, die
					playerParticles.push(new Particle(
						this.x + random(-blockSize/2, blockSize/2), 
						this.y + random(-blockSize/2, blockSize/2), 
						undefined, 
						4, 
						[255, 255, 255], 
						undefined, 
						random(50, 200), 
						random(1, 6), 
						"fall", 
						false, 
						true
					));	
				}
			}
			this.deathSoundPlayed = true;
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

	if(dead === false) {
		this.deathSoundPlayed = false;
	}
	menuSpeed = ((menuSeaLevel - this.y)/50) + 5;//was 3
};

function Block(x, y, type, image) {
	this.x = x; 
	this.y = y;
	this.w = 0;
	this.h = 0;
	this.prevX = x;
	this.prevY = y;
	this.speed = 3;

	this.image = image;

	this.type = type;
}
Block.prototype.display = function(drawn) {
	this.drawn = drawn;
	
	this.prevX = this.x;
	this.prevY = this.y;
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.strokeStyle = "rgb(0, 0, 0)";
	if(this.w > 1) {
		ctx.drawImageC(this.image, this.x, this.y, this.w, this.h);
	}
	if (this.drawn) {
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
PortalChange.prototype.frontDark = function() {
	ctx.drawImage(imgs.get("portalDarkFront"), this.x - 10, this.y - blockSize + 5, blockSize * 2, blockSize * 4)
}
PortalChange.prototype.backDark = function() {
	ctx.drawImage(imgs.get("portalDarkBack"), this.x - blockSize, this.y - blockSize + 5, blockSize * 2, blockSize * 4)
}
PortalChange.prototype.frontLit = function() {
	
	ctx.drawImage(imgs.get("portalLitFront"), this.x - 10, this.y - blockSize + 5, blockSize * 2, blockSize * 4);
}
PortalChange.prototype.backLit = function() {
	ctx.drawImage(imgs.get("portalLitBack"), this.x - blockSize, this.y - blockSize + 5, blockSize * 2, blockSize * 4)
}

var portalCooldown = 0;
function PortalChangeDark(x, y) {
	PortalChange.apply(this, arguments);
	this.soundPlayed = false;
}
PortalChangeDark.prototype.all = function() {
	
	if(collide(this, player)) {
		if(portalCooldown <= 0){
			teleportSound();
			if(player.mode === "flight") {
				player.mode = "ground";
				portalCooldown = 60;
			} else {
				player.mode = "flight";
				portalCooldown = 60;
			}
		}
		
		if(!this.soundPlayed) {
			//teleportSound();
			
		}
		this.soundPlayed = true;
	} else {
		this.soundPlayed = !true;
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
					ctx.drawImageC(imgs.get("fadeLeft"), this.x - blockSize - (blockSize / 2) - 2, this.y + 11, this.w * 2.5, this.h * 2.5);
					ctx.drawImageC(imgs.get("fadeRight"), this.x + blockSize + (blockSize / 2) + 2, this.y + 14.5, this.w * 2.5, this.h * 2.5);
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

	lampAmbience.volume = normalize(lampClickDist, 0, 1);
	
}

var pauseButton = new Button(null, imgs.get("pause2"), imgs.get("pause2"), screenSize.w - 100, 100, blockSize, blockSize, function(){
	paused = true;
});
var playButton = new Button(null, imgs.get("play2"), imgs.get("play2"), screenSize.w - 100, 100, blockSize, blockSize, function(){
	paused = false;
});

var player = new Player(undefined, undefined, "ground");
var menuPlayer = new Player(undefined, undefined, "ground");

var timer = new DeathPause();

function game() {
	//Put background here.
	portalCooldown --;
	//ctx.drawImage(imgs.get("backgroundTest"), 0, 0, blockSize * 20, blockSize * 10);

	if(scene !== "game") {
		paused = true;
	}

	cam.x = lerp(cam.x, window.innerWidth / 2 - 20 / 2 - player.x, 0.1);
    cam.y = lerp(cam.y, window.innerHeight / 2 - 20 / 2 -      player.y, 0.1);
	
	ctx.save();
	ctx.translate(cam.x * 2, cam.y * 2);
	ctx.restore();

	ctx.save();
	ctx.translate(cam.x, cam.y);

	for (var i = 0; i < blocks.length; i++) {
		if(1 * (dist(player.x, player.y, blocks[i].x, blocks[i].y) < renderDist)) {
			blocks[i].display(true);
		} else {
			blocks[i].display(false);
		}
	}
	for (var i = 0; i < lamps.length; i++) {
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
	for (var i = 0; i < portalPoints.length; i++) {
		portalPoints[i].all();
	}
	for(var i = 0; i < portals.length; i++) {
		if(dist(player.x, player.y, portals[i].x, portals[i].y) < renderDist) {
			portals[i].backLit();
			nearPortal = true;
		} else {
			portals[i].backDark();
			nearPortal = false;
		}
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
	
	if(!paused) {
		player.update();
	}
	if(!dead) {
		player.draw();
	}

	for(var i = 0; i < portals.length; i++) {
		if(dist(player.x, player.y, portals[i].x, portals[i].y) < renderDist) {
			portals[i].frontLit();
		} else {
			portals[i].frontDark();
		}
	}

	raining();
	
	ctx.restore();

	if(!paused) {
		pauseButton.all();
	} else {
		if(timer.timer === 0) {
			playButton.all();
		} else {
			pauseButton.all();
		}
	}
	//console.log(paused + " " + dead);

	if(dead) {
		paused = true;
		timer.start();
	}
	if(timer.timer === timer.time) {
		update();
		paused = false;
	}

	timer.update();
	
	if(player.x > winDist) {
		win = true;
	}

	xDist += speed;

	if(nearPortal === true && portalAmbience.playing === false) {
		portalAmbience.play();
	} else if (portalAmbience.playing === false){
		portalAmbience.stop();
	}

	if(win && win2) {
		trans.start("win");
		win2 = false;
	}
}

levelMapIndex = {
	'p':'player',
	'g':'normal',
	'w':'wood',
	'd':'dirt',
	's':'spike',
	'S':'downSpike',
	'1':'lampB',
	'2':'lampM',
	'3':'lampT',
	'c':'portal',
	'C':'portalInvis',
	't':'trampoline',
	'b':'bush',
	'e':'win',
	'P':'menuPlayer'
};

/*
levels = [//The e is used to find out where the end of the game is
	[
    '                                                                                                                                                                                                         ',
    '                                                                                                                                                                     3                                   ',
    '                                                                                                                           3                                         2                                   ',
	'                                                                 3                                                         2                                bbbbbbbb 1 bbbbbbb                           ',
	'                                                                 2                                                 bbbbbbb 1 bbbbbbbb                       wwwwwwwwwwwwwwwwww                           ',
	'                                                                 1                                                 wwwwwwwwwwwwwwwwww                                                                  cC',
	'                  3                                      bb  gggggggg                       3                                                                                                           C',
	'                  2                                     gggggddddddddgggg  bb               2                                                                                                           C',
	'                  1bbbbbbbb   ss   bbbbbbb  bbbbbbbbbgggdddddddddddddddddggggg      bbbbb   1             bb       ss    bb    ss                   bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb   ss    bbbbbbbbbbbbbC',
	'                gggggggggggggggggggggggggggggggggggggdddddddddddddddddddddddddgggggggggggggggggggggggtggggggggggggggggggggggggggggggggggggggtgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
	'             gggddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'          gggdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'p       ggddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'gggggtggggddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
	],
];
*/

var levels = [[
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"",
	"                                                                                                                                                                                                                                                                                                             gggg",
	"                                                                                                                                                                                                                                                                                                        dddddddddgg",
	"                                                                                                                                                                                                                                                                                                      dddddddddddddggg",
	"                                                                                                                                                                                                                                                                                                    dd    2       dddgg",
	"                                                                                                                                                                                                                                                                                                   dd     2         ddggg",
	"                                                                                                                                                                                                                                                                                                  dd      2           ddg",
	"                                                                                                                                                                                                                                                                                                ddd       2            ddd",
	"                                                                                                                                                                                                                                                                                       dddddddddd         2             ddd",
	"                                                                                                                                                                                                                                                                                        2       2         2             2ddgg",
	"                                                                                                                                                                                                                                                                                        2       2         2             2 ddgg",
	"                                                                                                                                                                                                                                                                                        2       2         2             2  ddgg",
	"                                                                                                                                                                                                                                                                                        2       2         2             2   ddgggb",
	"                                                                                                                                                                                                                                                                                        2       2         2             2     ddgggg",
	"                                                                                                                                                                                                                                                                                        2       2         2             2      ddddgg",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                     ddddggb",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                       dddgg",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                         ddddd",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                               C",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                               c",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                               C             3                                 wwwwwwwwwwww",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                               C             2                                  ddddddddddwww",
	"                                                                                                                                                                                                                                     2     2                                            2       2         2                               C     b   b   1        gggtgtgt                   dddddddddddwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            2       2     bb  1   b                           C  gggggggggggggggggggggggdgggg                     dddddddddddwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            2       2    wwwwwwwwwww                         bggggggggggggddddddddggggddddg                          ddddddddddwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            2       2    w         w                         gddggggdddddddddddddddddddddg                                    dddwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            2       2                                       gddddddddddddddd       ddddd                                       ddddwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            1  b  b 1                                     bdddddddddd                                                            ddddwwwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                           wwwwwwwwwww                                    ddddddd                                                                   ddddd",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                                     w                  w                bdddd                                                                                       3",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                                                        wwwwwwwwwwwwwwwddddd                                                                               sb        2       www",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                                                         2           ddddd                                                                                gggg sb  s 1 ss    dwww",
	"                                                                     2   2      2         2     2                                                                                                                                    2     2                                            C                            2          ddgdd                                                                                gdgdggggggggggggg    ddww                                                     3",
	"                                                                     2   2      2         2     2                                                                                                                 3                  2     2                                            c                            2        bdddd                                                                                   ddddddggggddddd      ddww                                                    2",
	"                                                                     2   2      2         2     2                                                                                                                 2                ss2sssss2ss                                          C                            2        gddd                                                                                       ddddddddd         dddww                                                   1    ss",
	"                                                                     2   2      2         2     2                                                                                                                 1  b             wwwwwwwwwww                                          C                       bb b 2     bggdd                                                                                                            dddwb                                                wwwwwwwwwww",
	"                                                                     2   2      2         2     2                                                                                3                           gggggggggggg          w 2     2 w                       3          b b     C                     wwwwwwwwwwwwgggdd                                                                                                              dddgg                                                2       2",
	"                                                                     2   2      2         2     2                                                                                2                        ggggggggdgddggggg          2     2                         2         gggggggggC                     w 2    2   ggdd                                                                                                                ddddgg                                        gg     2       2",
	"                                                                     2   2      2         2     2                                              wwwwwww    wwwwwww    wwwwwww     1  b   bb              gggdddddddddddddddggg        2     2                      bb 1 ggggggggddddgggggg                       2    2 ddddd                                                                                                                  ddddgg                              b         d     2       2     bb   b e",
	"                                                                     2   2     www        2     2                                               2   2      2   2      2   1    ggggggggggggggggttd     dddddd       ddddddddg        2     2                b  ggggggggggggdddddddddgddgg                       2    1ddddd                                                                                                                     dddww                            ggg              2       2   gggggggggg",
	"                                                                     2   2                2    s2           g              3            wwwww   2   1  s s 1b  1   ss 1   ggggggdggggdddddddddddddd                       dg         2     2     ggggggggggggggggggggggddddd     dddddddg                       2  ddddd                                                                                                                         dddww                   b  ss    dd           ss 2     s 2    dddgggdd",
	"                                                             3       wwwww               wwwwwwwww          w              2    b     b 1   1   1  bggggggggggggggggggggggggddddddddddd    dddddd                                  wwwwwwwwwww     dddgggggggggggdddddddddd          ddddgg                     1 ddddd                                                                                                                           dddww                 gggggg               wwwwwwwwwwwwww      ddddd",
	"                                                             2                                              w            bb1 ggggggggggggggggggggggggggggdggggggggdddddddddddddd                                                                    dddddddddddddddddddd               dddgg                    dddddd                                                                                                                              ddgg                 ddgg                     2       2",
	"                                  3                          1 b                                           gg bb  ggggggggggggggggggggggggggddddggggggdddddddddddddddd   ddd                                                                          ddddd                             dddgg                  dddd                                                                                                                                  ddgw                  dd                     2       2",
	"                                  2                     gggtggggggg                              ss s  tttggggggggggggggggggggggggddggddddddddddddddddddddddddddddd                                                      wwwwwwt                                                         dddg                 dddd                                                                                                                                   dddww                                        2       2",
	"                                  1       ssbggggggggggggggggggddgd                             ggggggggggggddggdggggddddgdddddddddddddd           dddddddddddddddd                                                    www   2                                                            ddgb           bggdddd                                                                                                                                      dddwwwwt                                    2       2",
	"                        b b   b ggggggggggggggggdgdddggggdggddddddddd s     s     ss s         ddgggdgggddddddddddddddddddddddddd                         dddddd                                             wwwwwwwwwww     2                                                             ddg          bggddd                                                                                                                                         ddddddd                                    2       2",
	"                     ggggggggggggggggdggdgggggdgddddddddddddddddddddddddssdddd    dddddddd ssdddddddddddddddddddddddd                                                                              wwwwwwwwwww   2           2                                                             ddgb        gggdddd                                                                                                                                          ddddd                                     2       2",
	"   p      bb  gwwwwgggdgggggggdggddddddddddgdddddddddddddddddd     ddddddddddddddddddddddddddddddddddddd                                                                                              2          2           2                                                              dggb      dgddd                                                                                                                                                                                       2       2",
	"   ggggggggggggggggggddddgggdddddddddddddddddddddd    dd                  ddddddddddddddddd                                                                                                           2          2           2                                                               dgg    dddddd                                                                                                                                                                                        2       2",
	" gggdgggdggdgggddddddddddddddddddddddddddddddd                                                                                                                                                        2          2           2                                                                dg  ddddd                                                                                                                                                                                           2       2",
	"gggddddddgddddddddddddddddddddddddddddd                                                                                                                                                               2          2           2                                                                dddddd                                                                                                                                                                                              2       2",
	"ggddddddddddddddddddddddddddddddddddd                                                                                                                                                                 2          2           2                                                                 ddddd                                                                                                                                                                                              2       2",
	" ddddddddddddddddddddddddddddddddd                                                                                                                                                                    2          2           2                                                                                                                                                                                                                                                                    2       2",
	" ddddddddd     dddddddddddd                                                                                                                                                                           2          2           2                                                                                                                                                                                                                                                                    2       2",
	" dddddd           ddddddd                                                                                                                                                                             2          2           2                                                                                                                                                                                                                                                                    2       2",
	"  dddd             ddd                                                                                                                                                                                2          2           2                                                                                                                                                                                                                                                                    2       2",
	"                                                                                                                                                                                                      2          2           2                                                                                                                                                                                                                                                                    2       2",
	"                                                                                                                                                                                                      2          2           2                                                                                                                                                                                                                                                                    2       2",
	"                                                                                                                                                                                                      2          2           2                                                                                                                                                                                                                                                                    2       2",
	"                                                                                                                                                                                                      2          2           2                                                                                                                                                                                                                                                                    2       2",
	"                                                                                                                                                                                                      2          2           2                                                                                                                                                                                                                                                                    2       2",
]]; 

var levelMapMenu = [
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'P',
	'gggggggggggggggggggggggggggggtgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
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
				case "wood":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get(randomWood())));
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
				case "portalInvis":
					portalPoints.push(new PortalChangeDark(j * blockSize, i * blockSize));
				break;
				case "trampoline":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get("trampoline")));
				break;
				case "dirt":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get(randomDirt())));
				break;
				case "downSpike":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get("spikeDown")));
				break;
				case "bush":
					blocks.push(new Block(j * blockSize, i * blockSize, levelMap[i][j], imgs.get("bush")));
				break;
				case "win":
					winDist = j * blockSize;
				break;
			}
		}
		if(i ===  levelMap.length + 1) {
			blocks[i].y = seaLevel;
		}
	}

	player.gravity = 0;
	player.angle = 180;
	if(!firstTime) {
		spikeDeath();
		screenFlash();
		//timer.start();
	}
    firstTime = false;
	dead = false;
	player.mode = "ground";
}

function updateMenu() {
	menuBlocks = [];

	for(var i = 0; i < levelMapMenu.length; i++) {
		for(var j = 0; j < levelMapMenu[i].length; j++) {
			switch(levelMapIndex[levelMapMenu[i][j]]) {
				case "player":
					player.x = 15/2 + j * blockSize;
					player.y = 15/2 + i * blockSize;
				break;
				case "normal":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get(randomBlock())));
				break;
				case "wood":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get(randomWood())));
				break;
				case "spike":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get("Spike")));
				break;
				case "lampB":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMapMenu[i][j], null));
				break;
				case "lampM":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMapMenu[i][j], null));
				break;
				case "lampT":
					lamps.push(new Lamp(j * blockSize, i * blockSize, levelMapMenu[i][j], null));
				break;
				case "portal":
					portals.push(new PortalChange(j * blockSize, i * blockSize));
				break;
				case "portalInvis":
					portalPoints.push(new PortalChangeDark(j * blockSize, i * blockSize));
				break;
				case "trampoline":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get("trampoline")));
				break;
				case "dirt":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get(randomDirt())));
				break;
				case "downSpike":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get("spikeDown")));
				break;
				case "bush":
					menuBlocks.push(new Block(j * blockSize, i * blockSize, levelMapMenu[i][j], imgs.get("bush")));
				break;
				case "win":
					winDist = j * blockSize;
				break;
				case "menuPlayer":
					menuPlayer.x = 15/2 + j * blockSize;
					menuPlayer.y = 15/2 + i * blockSize;
					playerReset = 15/2 + i * blockSize;
				break;
			}
		}
		if(i ===  levelMapMenu.length + 1) {
			menuBlocks[i].y = seaLevel;
		}
	}

	menuPlayer.gravity = 0;
	menuPlayer.angle = 0;
}

config();
configMenu();