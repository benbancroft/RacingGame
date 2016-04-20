/**
 * This code was written by Ben Bancroft
 */

var TileLayer = function(depth, chunk){
    this.chunk = chunk;

    this.layerDataTexture = null;

    this.tileMap = new Array();
    this.tileMapFlipX = new Array();
    this.tileMapFlipY = new Array();

    Renderable.call(this, depth);

    this.addRenderable()
};

TileLayer.prototype = Object.create(Renderable.prototype);
TileLayer.prototype.constructor = TileLayer;

TileLayer.prototype.addRenderable = function(){
    this.chunk.tileSystem.level.addRenderable(this);
}

TileLayer.prototype.createTile = function(position, tile, flipX, flipY){
    var index = position.x*this.chunk.tileSystem.chunkSize+position.y;

    this.tileMap[index] = tile;
    this.tileMapFlipX[index] = flipX;
    this.tileMapFlipY[index] = flipY;

};

TileLayer.prototype.getTile = function(position){
    return this.tileMap[position.x*this.chunk.tileSystem.chunkSize+position.y];
};

TileLayer.prototype.getTileFlipX = function(position){
    return this.tileMapFlipX[position.x*this.chunk.tileSystem.chunkSize+position.y];
};

TileLayer.prototype.getTileFlipY = function(position){
    return this.tileMapFlipY[position.x*this.chunk.tileSystem.chunkSize+position.y];
};

TileLayer.prototype.render = function(renderer){

    renderer.drawTileChunk(this.chunk.location, this.chunk.tileSystem.tilesheetUrl, this.chunk.tileSystem.tileSize, this.chunk.tileSystem.chunkSize, this.layerDataTexture, this.depth);
};