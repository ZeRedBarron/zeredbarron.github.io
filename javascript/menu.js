
var creditScroll = 0;

var creditsBar = [];

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
for(var i = 100; i < 700; i += 45) {
	creditsBar.push(imgs.get(randomRedWood()));
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
	pixelFont("CREDITS", center.x - (center.x * 1/3.6 - 40)/*255*/, creditScroll + 100, 50);

	pixelFont("Made by The Dash Devs", center.x - 355, creditScroll + 175, 25);
	
	pixelFont("Programming:\n  Paul Barron\n  Tomas Garcia", center.x - 465, creditScroll + 260, 25);

	pixelFont("Graphics:\n  Eduardo Jauregui", center.x - 465, creditScroll + 400, 25);

	pixelFont("With help from:\n  Derek Lueng\n  JP Roche\n  Matthew Anderson", center.x - 465, creditScroll + 520, 25);

	pixelFont("Built using Replit\nSound managed with Howler JS\nSounds from Pixabay\nSound edited on Audacity\nPixal Art built in Pixalorama\nMusic composed in Finale v27\nMusic performed by Noteperformer 4\n", center.x - 465, creditScroll + 700, 25);

	for(var i = 100, j = 0; i < 700; i += blockSize, j++) {
		ctx.drawImageC(creditsBar[j], center.x - 565, 100+ i, blockSize, blockSize);
	}
}

function menu() {
    
}