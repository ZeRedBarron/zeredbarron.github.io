
var creditScroll = 0;

var creditsBar = [];

var text = [
	[
		"Programming:",
		"Paul Barron",
		"Tomas Garcia"
	],
	[
		"Graphics:",
		"Eduardo Jauregui",
	],
	[
		"With Help from:",
		"JP Roche",
		"Matthew Anderson",
		"Derek Leung",
	],
	[
		"Graphic Progrmas:",
		"Pixalorama",
	],
	[
		"Audio Programs:",
		"Library: Howler.js",
		"Editing: Audacity",
		"Source: Pixabay",
		"Music: Finale 27",
		"Music Performince:\nNoteperformer 4",
	],
];

var creditsButtons = [
	new Button(null, imgs.get("backOff"), imgs.get("backOn"), 200, screenSize.h - 175, blockSize*3, blockSize*2),
]

function randomRedWood() {
	let x = randomInt(0, 2);
	switch(x) {
		case 0:
			return "RedWoodTexture1";
		break;
		case 1:
			return "RedWoodTexture2";
		break;
		case 2:
			return "RedWoodTexture3";
		break;
	}
}
for(var i = 0; i < 50; i++) {
	creditsBar.push(imgs.get(randomRedWood()));
}

function creditBanners(masterLoc) {
	var x = masterLoc.x;
	var y = masterLoc.y;

	for(var i = 0, j = 0, m = 0; i < text.length; i++, j += blockSize, m++) {
		for(var k = 0, l = 0; k < text[i].length; k++, j += blockSize, m++) {
			if(k > 0) {
				ctx.drawImageC(creditsBar[m], x, y + j, blockSize, blockSize);
				m++;
				ctx.drawImageC(creditsBar[m], x + blockSize, y + j, blockSize, blockSize);
				pixelFont(text[i][k], x + 2*blockSize, y + j, 25);
			} else {
				ctx.drawImageC(creditsBar[m], x, y + j, blockSize, blockSize);
				pixelFont(text[i][k], x + blockSize, y + j, 25);
			}
			
		}
		ctx.drawImageC(imgs.get("RedWoodTexture1"), x, y + j, blockSize, blockSize);
	}
	
}

function pixelFont(txt, x, y, sze){
	txt = txt.split("\n");
	for(var i in txt){
		for(var j in txt[i]){
			ctx.save();
			ctx.translate(x + j * sze * 1.6, y + i * sze * 1.6);
			ctx.drawImageC(imgs.get(txt[i][j]), 0, 0, sze, sze);
			ctx.restore();
		}
	}
}

function credits() {


	creditBanners({x:center.x - 465, y: 250});

	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.strokeStyle = "rgb(255, 0, 0)";
	ctx.fillRect(0, 0, screenSize.w, 200);
	ctx.fillRect(0, screenSize.h - 200, screenSize.w, 200);

	ctx.fillRect(0, 0, 200, screenSize.h);
	ctx.fillRect(screenSize.w - 200, 0, 200, screenSize.w);
	
	pixelFont("CREDITS", center.x - (center.x * 1/3.6 - 40)/*255*/, creditScroll + 100, 50);

	pixelFont("Made by The Dash Devs", center.x - 355, creditScroll + 175, 25);

	for(var i in creditsButtons) {
		creditsButtons[i].all();
	}
	
	/*pixelFont("Programming:\n  Paul Barron\n  Tomas Garcia", center.x - 465, creditScroll + 260, 25);

	pixelFont("Graphics:\n  Eduardo Jauregui", center.x - 465, creditScroll + 400, 25);

	pixelFont("With help from:\n  Derek Lueng\n  JP Roche\n  Matthew Anderson", center.x - 465, creditScroll + 520, 25);

	pixelFont("Built using Replit\nSound managed with Howler JS\nSounds from Pixabay\nSound edited on Audacity\nPixal Art built in Pixalorama\nMusic composed in Finale v27\nMusic performed by Noteperformer 4\n", center.x - 465, creditScroll + 700, 25);

	for(var i = 100, j = 0; i < 700; i += blockSize, j++) {
		ctx.drawImageC(creditsBar[j], center.x - 565, 100+ i, blockSize, blockSize);
	}
	*/
}

function menu() {
    
}

