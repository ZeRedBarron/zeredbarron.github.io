
function buildSound(source, loop, vol) {
	return new Howl({
		src: [source],
		loop: (typeof loop === "boolean") ? loop : false,
		volume: (typeof vol === "undefined") ? 1 : vol,
	})
}

var lampSounds = [
	buildSound("audio/sound effects/Click1.wav", false, 0.5),
	buildSound("audio/sound effects/Click2.wav", false, 0.5),
	buildSound("audio/sound effects/Click3.wav", false, 0.5),
	buildSound("audio/sound effects/Click4.wav", false, 0.5),
	buildSound("audio/sound effects/Click5.wav", false, 0.5),
	buildSound("audio/sound effects/Click6.wav", false, 0.5),
];

var lampAmbience = buildSound("audio/sound effects/lampbuzz.mp3", true, 0);

//var deathSound = 
function randomSound() {
	return lampSounds[randomInt(0, 5)];
}

function lampClick() {
	randomSound().play();
}