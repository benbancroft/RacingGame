var StructurePiece = function(type, position){
    this.type = type;
    this.position = position;
    this.chunks = new Array();
    this.metadata = 0;
}

function calculatePosition(position, direction, bounds){
    switch (direction){
        case 0:
            position.add(new Vector2(0, -1).scale(bounds.y));
            break;
        case 1:
            position.add(new Vector2(1, 0).scale(bounds.x));
            break;
        case 2:
            position.add(new Vector2(0, 1).scale(bounds.y));
            break;
        case 3:
            position.add(new Vector2(-1, 0).scale(bounds.x));
            break;
    }
}

var TileGenerator = function(tileSystem, trackUrl){

    this.tileSystem = tileSystem;

    this.genRoad = false;

    this.track = Tracks.get(trackUrl);

    this.structurePieces = new Array();

    this.stuctureBounds = new Map();
    this.stuctureBounds.set(NodeType.FINISH, new Vector2(1, 10));
    this.stuctureBounds.set(NodeType.START, new Vector2(5, 10));
    this.stuctureBounds.set(NodeType.STRAIGHT, new Vector2(8, 10));
    this.stuctureBounds.set(NodeType.CORNER, new Vector2(10, 10));

    this.generateStructures();

};

TileGenerator.prototype.generateChunk = function(position){

    var chunk = this.tileSystem.getChunk(position);

    //chunk.setBlock(new Vector2(0,1), 1);
    //chunk.setBlock(new Vector2(tileSystem.chunkSize-1,tileSystem.chunkSize-1), 1);

    for (var x = 0; x < this.tileSystem.chunkSize; x++){
        for (var y = 0; y < this.tileSystem.chunkSize; y++){
            chunk.setBlock(new Vector2(x, y), 1);
        }
    }

    this.generateStructuresChunk(position);
};

TileGenerator.prototype.generateStructuresChunk = function(position){

    for (var i = 0; i < this.structurePieces.length; i++) {
        var structurePiece = this.structurePieces[i];

        if (!structurePiece.chunks.some(function(c) { return c.equals(position); } )) continue;

        switch(structurePiece.type){
            case NodeType.FINISH:
            {
                this.generateFinish(structurePiece.position, structurePiece.direction);
            }break;
            case NodeType.START:
            {
                this.generateStart(structurePiece.position, structurePiece.direction, structurePiece.metadata);
            }break;
            case NodeType.STRAIGHT:
            {
                this.generateRoad(structurePiece.position, structurePiece.direction);
            }break;
        }
    }

};

function generateStructure(tileSystem, node, position, direction, bounds, structurePieces, metadata){
    var structurePiece = new StructurePiece(node.type, position.clone());

    structurePiece.chunks = tileSystem.getChunksInRange(position, bounds);
    structurePiece.metadata = metadata;

    structurePieces.push(structurePiece);

    Engine.log("Loaded structure: " + node.type);

    calculatePosition(position, direction, bounds);
}

TileGenerator.prototype.generateStructures = function(){
    var position = new Vector2(0,0);
    var direction = this.track.startOrientation;

    for (var i = 0; i < this.track.nodes.length; i++) {
        var node = this.track.nodes[i];

        var bounds = new Vector2();

        switch(node.type){
            case NodeType.FINISH:
            {
                generateStructure(this.tileSystem, node, position, direction, new Vector2(2, 10), this.structurePieces);

            }break;
            case NodeType.START:
            {
                for (var j = 0; j < node.range; j++) generateStructure(this.tileSystem, node, position, direction, new Vector2(6, 10), this.structurePieces, j % 2);
            }break;
            case NodeType.STRAIGHT:
            {
                for (var j = 0; j < node.range; j++) generateStructure(this.tileSystem, node, position, direction, new Vector2(8, 10), this.structurePieces);
            }break;
            default:
                continue;
        }

    }

};

TileGenerator.prototype.generateRoad = function(position, direction){

    var blocks = new HashMap();

    for (var i = 0; i < 8; i++){
        blocks.set(new Vector2(i, 0), 3+i%2);
        blocks.set(new Vector2(i, 9), 3+i%2);

        for (var j = 0; j < 8; j++){
            if (j == 3 && i == 3){
                blocks.set(new Vector2(i, 1+j), 5);
            }else{
                blocks.set(new Vector2(i, 1+j), 2);
            }
        }
    }

    var self = this;
    blocks.forEach(function(block){
        var pos = position.clone().add(block.key);
        self.tileSystem.removeBlock(pos);
        self.tileSystem.setBlock(pos, block.value);
    });
};

TileGenerator.prototype.generateFinish = function(position, direction){

    var blocks = new HashMap();


    for (var i = 0; i < 2; i++){
        blocks.set(new Vector2(i, 0), 3+i%2);
        blocks.set(new Vector2(i, 9), 3+i%2);

        for (var j = 0; j < 8; j++){
            if (i == 0) blocks.set(new Vector2(i, 1+j), 6);
            else blocks.set(new Vector2(i, 1+j), 2);
        }
    }

    var self = this;
    blocks.forEach(function(block){
        var pos = position.clone().add(block.key);
        self.tileSystem.removeBlock(pos);
        self.tileSystem.setBlock(pos, block.value);
    });
};

TileGenerator.prototype.generateStart = function(position, direction, metadata){

    var blocks = new HashMap();

    for (var i = 0; i < 6; i++){
        blocks.set(new Vector2(i, 0), 3+i%2);
        blocks.set(new Vector2(i, 9), 3+i%2);

        for (var j = 0; j < 8; j++){
            blocks.set(new Vector2(i, 1+j), 2);
        }
    }

    if (metadata == 0) blocks.set(new Vector2(0, 1), 7);
    else blocks.set(new Vector2(0, 6), 7);

    var self = this;
    blocks.forEach(function(block){
        var pos = position.clone().add(block.key);
        self.tileSystem.removeBlock(pos);
        self.tileSystem.setBlock(pos, block.value);
    });
};
