var TilePosition = {
    Centre: new Vector2(0,0),
    Up: new Vector2(0,-1),
    Down: new Vector2(0,1),
    Left: new Vector2(-1,0),
    Right: new Vector2(1,0),
    DownLeft: new Vector2(-1,1),
    DownRight: new Vector2(1,1),
    UpLeft: new Vector2(-1,-1),
    UpRight: new Vector2(1,-1),
    DownDown: new Vector2(0,2),
    DownDownLeft: new Vector2(-1,2),
    DownDownRight: new Vector2(1,2),
};

var TileChunk = function(tileSystem, location){
    this.tileSystem = tileSystem;
    this.location = location;

    this.tileLayers = new Map();
    this.blocks = new HashMap();
    this.hasChanged = false;

    this.chunkDependencies = new HashMap();
};

TileChunk.prototype.needsUpdate = function (){
    return this.hasChanged;
};

TileChunk.prototype.setBlock = function(position, blockId){
    var block = this.tileSystem.getBlockById(blockId);

    if (block == null) return;

    var blockIt = this.blocks.get(position);
    if (blockIt) this.removeBlock(position);

    this.blocks.set(position, blockId);
    this.hasChanged = true;
};

TileChunk.prototype.getBlock = function(position){

    var blockIt = this.blocks.get(position);
    if (blockIt){
        return blockIt;
    }
    else return 0;
};

TileChunk.prototype.removeBlock = function(position){

    var blockIt = this.blocks.get(position);
    if (blockIt) {

        var blockId = blockIt;

        this.blocks.remove(position);
    }
};

TileChunk.prototype.getLayer = function(depth){
    var layer = this.tileLayers.get(depth);
    if (layer){}
    else{
        layer = new TileLayer(depth, this);
        this.tileLayers.set(depth, layer);
    }
    return layer;
};

TileChunk.prototype.createTile = function(depth, position, tile, hideUpdate){
    if (!hideUpdate) this.hasChanged = true;

    var layer = this.getLayer(depth);

    layer.createTile(position, tile);
};

TileChunk.prototype.createTilesFromBlock = function(position, value, hideUpdate){

    var self = this;

    if (!value) value = this.getBlock(position);

    var blockInfo = this.tileSystem.getBlockById(value);

    blockInfo.blockLayers.forEach(function (layerArray) {

        if (layerArray.length < 2) return;

        var layerInfo = layerArray[1];
        var layerDepth = layerArray[0];

        var chunkPos = self.location.clone();
        var worldPos = chunkPos.scale(self.tileSystem.chunkSize).add(position).add(layerInfo.position);

        var tilePosition = null;

        if (layerInfo.tilePositionPredicate != null){
            tilePosition = layerInfo.tilePositionPredicate(self.tileSystem, worldPos);
        }else {

            var tileIndex = 0;
            if (layerInfo.tileIndexPredicate) tileIndex = layerInfo.tileIndexPredicate(self.tileSystem, worldPos);

            if (tileIndex < 0) return;

            tilePosition = layerInfo.tiles[tileIndex];
        }

        if (tilePosition == null) return;

        if (layerInfo.position.equals(TilePosition.Centre)){
            self.createTile(layerDepth, position, tilePosition, hideUpdate);
        }else{
            self.tileSystem.createTile(layerDepth, worldPos, tilePosition, false, hideUpdate);

            var chunkPos = self.tileSystem.getChunkPosition(worldPos);
            if (!chunkPos.equals(self.location)){
                var deps = self.chunkDependencies.get(chunkPos)

                if (deps == null){
                    deps = [];
                    self.chunkDependencies.set(chunkPos, deps)
                }

                if (!deps.some(function(i) { return i.equals(position)})) deps.push(position);
            }
        }
    });
};

TileChunk.prototype.createTiles = function(){
    var tileChunk = this;
    this.blocks.data().sort(function(val1, val2) {

        var blockInfo1 = tileChunk.tileSystem.getBlockById(val1.value);
        var blockInfo2 = tileChunk.tileSystem.getBlockById(val2.value);


        return blockInfo1.blockLayers.length - blockInfo2.blockLayers.length;
    }).forEach(function (block) {
        tileChunk.createTilesFromBlock(block.key, block.value);
    });

    this.tileSystem.getChunkDependencies(this.location).forEach(function (chunk) {
        chunk.chunkDependencies.get(tileChunk.location).forEach(function (pos) {
            chunk.createTilesFromBlock(pos, null, true);
        });
    });

    this.hasChanged = false;
};

TileChunk.prototype.commitTiles = function(){
    var tileChunk = this;
    this.tileLayers.forEach(function (layer, depth) {

        var chunkSize = tileChunk.tileSystem.chunkSize;
        var tileMapArray = [];

        for (var h = 0; h < chunkSize; h++) {
            for (var w = 0; w < chunkSize; w++) {

                var tile = new Vector4(0,0,0,0);

                //pass by reference
                var tilePos = layer.getTile(new Vector2(w,h));
                if (tilePos){
                    tile = new Vector4(tilePos.x, tilePos.y, 255, 0);
                }

                tileMapArray.push(tile.x);
                tileMapArray.push(tile.y);
                tileMapArray.push(tile.z);
                tileMapArray.push(tile.w);

            }
        }

        layer.layerDataTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, layer.layerDataTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, chunkSize, chunkSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(tileMapArray));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    });

    Engine.log("Loaded tile chunk at X: " + this.location.x + ", Y: " + this.location.y + " with " + this.tileLayers.size + " layers");

}

TileChunk.prototype.removeRenderables = function(){
    var self = this;
    this.tileLayers.forEach(function (layer, depth) {
        self.tileSystem.level.removeRenderable(layer);
    });
};