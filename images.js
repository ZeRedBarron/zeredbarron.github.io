//

//I'm using Derek Leung Image Loader method: https://jsfiddle.net/user/DerekL

//ImageCollection class
function ImageCollection(list, callback){
    var total = 0, images = {};
    for(var i = 0; i < list.length; i++){
        var img = new Image();
        images[list[i].name] = img;
        img.onload = function(){
            total++;
            if(total == list.length){
                void(callback && callback());
            }
        };
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
	for(var i = 0; i < list.length; i++) {
		var img = new Image();
		this.images[list[i].name] = img;
		img.onload = function(){
			this.total++;
			if(this.total == list.length) {
				void(this.callback && this.callback());
			}
		};
		img.src = list[i].url;
	}
}
ImageCollection.prototype.get = function(name){
	return this.images[name];
}

//var backgroundImage = document.getElementsById("image");
//backgroundImage.src = "https://replit.com/@ZeRedBarron/HTML-Base#Moon%20Background.png";