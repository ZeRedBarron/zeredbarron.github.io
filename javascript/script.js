//Variables for the blocks and platformer stuff.
var blockSize = 45;

var player, blocks = [], lamps = [], portals = [], portalPoints = [];

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
var brightness = 0;
var nearPortal = false;

var dead = false;

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

	var lowest;
	var blockYs = [];
	for(var i in blocks) {
		
		blockYs.push(blocks[i].y);
	}

	seaLevel = player.y;

	xDist = player.x;
	
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
			if(collide(this, blocks[i]) && blocks[i].type === "s") {
				dead = true;
			}
			if(blocks[i].half && collideHalf(this, blocks[i])){
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
				
			} else if(collide(this, blocks[i]) && !blocks[i].half){
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
			if(collide(this, blocks[i]) && !blocks[i].half){
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

function PortalChangeDark(x, y) {
	PortalChange.apply(this, arguments);
}
PortalChangeDark.prototype.all = function() {
	if(collide(this, player)) {
		player.mode = "flight";
        teleportSound();
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

var pauseButton = new Button("Pause", screenSize.w - 100, 100, blockSize, blockSize, function(){
	if(!paused) {
		paused = true;
	} else if (paused) {
		paused = false;
	}
	
});

var player = new Player(undefined, undefined, "ground");

var timer = new DeathPause();

function game() {
	//Put background here.

	//ctx.drawImage(imgs.get("backgroundTest"), 0, 0, blockSize * 20, blockSize * 10);

	if(scene !== "game") {
		paused = true;
	}

	cam.x = lerp(cam.x, window.innerWidth / 2 - 20 / 2 - player.x, 0.1);
    cam.y = lerp(cam.y, window.innerHeight / 2 - 20 / 2 - player.y, 0.1);
	
	ctx.save();
	ctx.translate(cam.x * 2, cam.y * 2);
	ctx.restore();

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
	for (var i in portalPoints) {
		portalPoints[i].all();
	}
	for(var i in portals) {
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

	for(var i in portals) {
		if(dist(player.x, player.y, portals[i].x, portals[i].y) < renderDist) {
			portals[i].frontLit();
		} else {
			portals[i].frontDark();
		}
	}

	raining();
	
	ctx.restore();

	if((!paused) && (!dead)) {
		pauseButton.displayPause();
	} else {
		pauseButton.displayPlay();
	}
	pauseButton.update();

	if(dead) {
		paused = true;
		timer.start();
		
	}
	if(timer.timer === timer.time) {
		update();
		paused = false;
	}

	timer.update();

	xDist += speed;

	if(nearPortal === true && portalAmbience.playing === false) {
		portalAmbience.play();
	} else if (portalAmbience.playing === false){
		portalAmbience.stop();
	}
}

levelMapIndex = {
	'p':'player',
	'g':'normal',
	'w':'wood',
	'd':'dirt',
	's':'spike',
	'1':'lampB',
	'2':'lampM',
	'3':'lampT',
	'c':'portal',
	'C':'portalInvis',
	't':'trampoline',
};

levels = [
	[
        '                                                                                                                                                                   ',
        '                                                                                                                                                                   ',
        '                                                                                                                               3                                   ',
		'                                                                                                                               2                                   ',
		'                                                                                                    3                 ddddd    1                                   ',
		'                                                                                                    2                      dddddddd                                      c    ',
		'                                                                                                    1                              dddddddd                    3         C    ',
		'                                                                                           ddddddddddddddddddtdddd                         dddddddd            2         C    ',
		'                                                                                                                                                   dddddddd    1         C    ',
		'                                                                                                                                               3           ddddddddddddd C    ',
		'                             3                       3                         ggggggtggg    3                                                 2                         C    ',
		'     3                       2                       2                   gg                  2                                sss              1      ss                 C    ',
		'     2                       1                ss     1      ss        ggggg                  1           gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg   ',
		'p    1   gggggggggggggggggggggggggggtggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
		'ggggggggggddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
		'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
		'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
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
}
config();