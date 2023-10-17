//

var loaded = false;

//I'm using Derek Leung Image Loader method: https://jsfiddle.net/user/DerekL

//ImageCollection class
function ImageCollection(list) {
	this.list = list;
	this.total = 0;
	this.images = {};
	this.config(list);
}
ImageCollection.prototype.config = function(list){
	var total = this.total
	for(var i = 0; i < list.length; i++) {
		var img = new Image();
		this.images[list[i].name] = img;
		window.addEventListener("load", function(){
            total++;
            if(total === list.length){
				loaded = true;
            }
        });
		img.src = list[i].url;
	}
}
ImageCollection.prototype.get = function(name){
	return this.images[name];
}
ImageCollection.prototype.waitToRun = function(){
	return new Promise(function(resolve, reject){
		if(loaded) {
			resolve();
		}
		else {
			window.addEventListener("load", function(){
				resolve();
			});
		}
		if(reject) {
			window.addEventListener("error", function(){
				throw new Error("Image fetching failed");
			});
			
		}
	});
}


var imgs = new ImageCollection([
	{
		name: "MoonBackground",
		url: "Moon Background 2.png"
	},
	{
		name: "BlockTexture",
		url: "graphics/block_01.png"
	},
	{
		name: "BlockTexture2",
		url: "graphics/block_02.png"
	},
	{
		name: "BlockTexture3",
		url: "graphics/block_03.png"
	},
	{
		name: "BlockTexture4",
		url: "graphics/block_04.png"
	},
	{
		name: "BlockTexture5",
		url: "graphics/block_05.png"
	},
	{
		name: "BlockTexture6",
		url: "graphics/block_06.png"
	},
	{
		name: "BlockTexture7",
		url: "graphics/block_07.png"
	},
	{
		name: "BlockTexture8",
		url: "graphics/block_08.png"
	},
	{
		name: "BlockTexture9",
		url: "graphics/block_09.png"
	},
	{
		name: "BlockTexture10",
		url: "graphics/block_10.png"
	},
	{
		name: "BlockTexture11",
		url: "graphics/block_11.png"
	},
	{
		name: "BlockTexture12",
		url: "block_12.png"
	},
	{
		name: "WoodTexture",
		url: "graphics/wood_block_01.png",
	},
    {
    	name: "WoodTexture2",
    	url: "graphics/wood_block_02.png",
    },
    {
    	name: "WoodTexture3",
    	url: "graphics/wood_block_03.png",
    },
    {
    	name: "WoodTexture4",
    	url: "graphics/wood_block_04.png",
    },
    {
    	name: "WoodTexture5",
    	url: "graphics/wood_block_05.png",
    },
    {
    	name: "PlayerTexture",
    	url: "player_block.png",
    },
    {
    	name: "PlayerTexture2",
	  	url: "graphics/player_block_02.png",
    },
	{
		name: "blank",
		url: "blank_01.png"
	},
	{
		name: "PlayerTextureFlight",
		url: "graphics/player_flight.png"
	},
	{
		name: "Spike",
		url: "graphics/spike_01.png"
	},
	{
		name: "LeafTexture",
		url: "graphics/leaves_01.png"
	}
]);

