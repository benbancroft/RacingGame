var TileLayer = function(depth, chunk){
    this.chunk = chunk;

    this.layerDataTexture = null;

    this.tileMap = new Array();

    Renderable.call(this, depth);

    this.addRenderable()
};

TileLayer.prototype = Object.create(Renderable.prototype);
TileLayer.prototype.constructor = TileLayer;

TileLayer.prototype.addRenderable = function(){
    this.chunk.tileSystem.level.addRenderable(this);
}

TileLayer.prototype.createTile = function(position, tile){
    this.tileMap[position.x*this.chunk.tileSystem.chunkSize+position.y] = tile;
};

TileLayer.prototype.getTile = function(position){
    return this.tileMap[position.x*this.chunk.tileSystem.chunkSize+position.y];
};

TileLayer.prototype.render = function(renderer){

    renderer.drawTileChunk(this.chunk.location, this.chunk.tileSystem.tilesheetUrl, this.chunk.tileSystem.tileSize, this.chunk.tileSystem.chunkSize, this.layerDataTexture, this.depth);
};