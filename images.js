//

var loaded = false;

//I'm using Derek Leung Image Loader method: https://jsfiddle.net/user/DerekL

//ImageCollection class
function ImageCollection(list, callback){
    var total = 0, images = {};
    for(var i = 0; i < list.length; i++){
        var img = new Image();
        images[list[i].name] = img;
        window.addEventListener("load", function(){
            total++;
            if(total === list.length){
                loaded = true;
				console.log("actually here")
            }
			console.log("actually here")
        });
        img.src = list[i].url;
    }
    this.get = function(name){
        return images[name];
    };
}

function ImageCollection(list, callback) {
	this.list = list;
	this.callback = callback;
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
                //void(callback && callback());
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
		name: "test1",
		url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Maestro_Batik_Tulis_di_Imogiri.jpg/500px-Maestro_Batik_Tulis_di_Imogiri.jpg"
	},
	{
		name: "MoonBackground",
		url: "Moon Background 2.png"
	},
	{
		name: "BlockTexture",
		url: "block_01.png"
	},
	{
		name: "BlockTexture2",
		url: "block_02.png"
	},
	{
		name: "BlockTexture3",
		url: "block_03.png"
	},
	{
		name: "BlockTexture4",
		url: "block_04.png"
	},
	{
		name: "BlockTexture5",
		url: "block_05.png"
	},
	{
		name: "BlockTexture6",
		url: "block_06.png"
	},
	{
		name: "BlockTexture7",
		url: "block_07.png"
	},
	{
		name: "BlockTexture8",
		url: "block_08.png"
	},
	{
		name: "BlockTexture9",
		url: "block_09.png"
	},
	{
		name: "BlockTexture10",
		url: "block_10.png"
	},
	{
		name: "BlockTexture11",
		url: "block_11.png"
	},
]);

