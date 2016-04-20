/**
 * This code was written by Ben Bancroft
 */

var BlockLayer = function(position, tilePositionPredicate, tiles, flipX, flipY, tileIndexPredicate){
    this.position = position;
    this.tiles = tiles;
    this.flipX = flipX;
    this.flipY = flipY;
    this.tilePositionPredicate = tilePositionPredicate;
    this.tileIndexPredicate = tileIndexPredicate;
};

var Block = function(blockLayers, isSolid){
    this.blockLayers = blockLayers;
    this.isSolid = isSolid;
};

var TileSystem = function(level, tilesheetUrl, tileSize, chunkSize, tickOnce){
    this.level = level;
    this.generator = null;
    this.tileSize = tileSize;
    this.chunkSize = chunkSize;
    this.tilesheetUrl = tilesheetUrl;

    this.tickOnce = tickOnce;
    this.tickCount = 0;

    this.blocks = new Map();

    this.tileChunks = new HashMap();

    //generator.setLevel(level);
    //generator.setTileSystem(this);
}

TileSystem.prototype.setGenerator = function(generator){
    this.generator = generator;
}

TileSystem.prototype.tick = function(viewports){
    //calculate all chunks inside viewport

    //Slight hack as it needs to tick twice to deal with shadow chunks
    if (this.generator == null || this.tickCount > 2) return;
    if (this.tickOnce) this.tickCount++;

    //new array

    var loadedChunks = new Array();
    var tileSystem = this;

    viewports.forEach(function(viewport) {

        var minX = Math.floor((-viewport.levelX+viewport.levelWidth/2) / tileSystem.chunkSize / tileSystem.tileSize)-1;
        var maxX = Math.floor(((-viewport.levelX+viewport.levelWidth/2) + viewport.levelWidth) / tileSystem.chunkSize / tileSystem.tileSize)+1;

        //minX = 0, maxX = 5;

        var minY = Math.floor((-viewport.levelY+viewport.levelHeight/2) / tileSystem.chunkSize / tileSystem.tileSize)-1;
        var maxY = Math.floor(((-viewport.levelY+viewport.levelHeight/2) + viewport.levelHeight) / tileSystem.chunkSize / tileSystem.tileSize)+1;

        //minY = 0, maxY = 5;

        for (var x = minX; x <= maxX; x++) {
            for (var y = minY; y <= maxY; y++) {

                var chunkExists = false;
                tileSystem.tileChunks.forEach(function (chunk) {
                    if (chunk.key.x == x && chunk.key.y == y) {
                        loadedChunks.push(chunk.key);
                        chunkExists = true;
                        return;
                    }
                });

                if (!chunkExists) {
                    //at this point, the chunk doesnt exist and needs generating!
                    var location = new Vector2(x, y);
                    var chunk = tileSystem.getChunk(location, true);

                    tileSystem.generator.generateChunk(location)

                    loadedChunks.push(location);
                }

            }

        }

    });


    //Do this earlier to shadow load chunks
    this.createTiles(true, true);

    //unload old chunks
    this.tileChunks.keys().difference(loadedChunks).forEach(function(chunkPosition) {
        var chunk = tileSystem.getChunk(chunkPosition, false);
        if (chunk){
            chunk.removeRenderables();
            tileSystem.tileChunks.remove(chunkPosition)
        }
    });

    //this.generator.generateRoad(new Vector2(10,10))

    Engine.log("Loaded chunks: " + this.tileChunks.size());
};

TileSystem.prototype.render = function(renderer, viewport){
    //Not needed as tile chunks are handled by renderables, and so are globably registered
};

TileSystem.prototype.getBlockById = function(blockId){
    return this.blocks.get(blockId);
};

TileSystem.prototype.getChunk = function(chunkPosition, create){
    var chunk = this.tileChunks.get(chunkPosition);
    if (!chunk && create) {
        chunk = new TileChunk(this, chunkPosition);
        this.tileChunks.set(chunkPosition, chunk);
        this.generator.generateChunk(chunk.location);
    }
    return chunk;
};

TileSystem.prototype.getChunkDependencies = function(chunkPosition){
    return this.tileChunks.values().filter(function(c) {
        var deps = c.chunkDependencies.get(chunkPosition);
        return deps != null && deps.length > 0;
    });
};

TileSystem.prototype.getChunksInRange = function(position, bounds){
    var chunkPositionStartUN = position.clone().divScalar(this.chunkSize).floor();
    var chunkPositionEndUN = position.clone().add(bounds).divScalar(this.chunkSize).floor();

    var chunkPositionStart = chunkPositionStartUN.minPoint(chunkPositionEndUN);
    var chunkPositionEnd = chunkPositionStartUN.maxPoint(chunkPositionEndUN);

    var boundedChunks = new Array();

    for (var x = chunkPositionStart.x; x <= chunkPositionEnd.x; x++) {
        for (var y = chunkPositionStart.y; y <= chunkPositionEnd.y; y++) {
            boundedChunks.push(new Vector2(x, y));
        }
    }

    return boundedChunks;
};


TileSystem.prototype.setBlock = function(position, blockId){
    var chunkPosition = position.clone().divScalar(this.chunkSize).floor();

    var chunk = this.getChunk(chunkPosition, true);

    if (chunk){
        chunk.setBlock(position.clone().wrap(this.chunkSize), blockId);

        return true;
    }

    return false;
};

TileSystem.prototype.removeBlock = function(position){
    var chunkPosition = position.clone().divScalar(this.chunkSize).floor();

    var chunk = this.getChunk(chunkPosition);

    var chunkBlockPos = position.clone().mod(this.chunkSize);

    if (chunk) chunk.removeBlock(position.clone().wrap(this.chunkSize));
};

TileSystem.prototype.getBlock = function(position){
    var chunkPosition = position.clone().divScalar(this.chunkSize).floor();

    var chunk = this.getChunk(chunkPosition, false);

    if (chunk) {
        return chunk.getBlock(position.clone().wrap(this.chunkSize));
    }else{
        return 0;
    }
};

TileSystem.prototype.registerBlockType = function(blockId, block){
    this.blocks.set(blockId, block);
};

TileSystem.prototype.createTile = function(depth, position, tile, flipX, flipY, createChunk, hideUpdate){
    var chunkPosition = this.getChunkPosition(position);
    var chunk = this.getChunk(chunkPosition, createChunk);
    if (chunk) {
        chunk.createTile(depth, position.clone().wrap(this.chunkSize), tile, flipX, flipY, hideUpdate);

        return true;
    }

    return false;
};

TileSystem.prototype.getChunkPosition = function(position){
    return position.clone().divScalar(this.chunkSize).floor();
};

TileSystem.prototype.createTiles = function(update, noCreate){

    this.tileChunks.forEach(function (chunk) {
        if (chunk.value.createTiles() && update) chunk.value.commitTiles();
    });
}