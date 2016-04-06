var StructurePiece = function(type, position, direction){
    this.type = type;
    this.position = position;
    this.direction = direction;
    this.chunks = new Array();
    this.metadata = 0;
}

var TileGenerator = function(tileSystem, trackUrl){

    this.tileSystem = tileSystem;

    this.genRoad = false;

    this.track = Tracks.get(trackUrl);

    this.startPositions = new HashMap();
    this.checkPoints = new Array();

    this.structurePieces = new Array();

    this.stuctureBounds = new Map();
    this.stuctureBounds.set(NodeType.FINISH, new Vector2(2, 10));
    this.stuctureBounds.set(NodeType.START, new Vector2(6, 10));
    this.stuctureBounds.set(NodeType.STRAIGHT, new Vector2(8, 10));
    this.stuctureBounds.set(NodeType.CORNER, new Vector2(11, 11));

    this.generateStructures();

};

TileGenerator.prototype.isOnStructure = function(position){

    for (var i = 0; i < this.structurePieces.length; i++) {
        var structurePiece = this.structurePieces[i];

        var bounds = this.stuctureBounds.get(structurePiece.type).clone();
        calculateBounds(bounds, structurePiece.direction);

        var positionStartUN = structurePiece.position.clone();
        var positionEndUN = structurePiece.position.clone().add(bounds);

        var positionStart = positionStartUN.minPoint(positionEndUN).scale(this.tileSystem.tileSize);
        var positionEnd = positionStartUN.maxPoint(positionEndUN).scale(this.tileSystem.tileSize);

        if (positionStart.lessThanEqual(position) && positionEnd.greaterThanEqual(position)) return true;
    }
    return false;
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
            case NodeType.CORNER:
            {
                this.generateCorner(structurePiece.position, structurePiece.direction, structurePiece.metadata);
            }break;
        }
    }

};

function calculatePosition(position, direction, bounds, both){
    var scaleVector = null;
    var scaleFactor = 1;
    if (both){
        scaleVector = bounds;
    }else {
        switch (direction) {
            case 1:
            case 3:
                scaleVector = new Vector2(1, 0);
                scaleFactor = bounds.x;
                break;
            case 0:
            case 2:
                scaleVector = new Vector2(0, 1);
                scaleFactor = bounds.y;
                break;
        }
    }
    position.add(scaleVector.scale(scaleFactor));
}

function calculateBounds(bounds, direction){
    switch (direction){
        case 0:
            bounds.swap();
            bounds.multiply(new Vector2(1,-1));
            break;
        case 2:
            bounds.swap();
            bounds.multiply(new Vector2(-1,1));
            break;
        case 3:
            bounds.multiply(new Vector2(-1,-1));
            break;
    }
}

function generateStructure(tileSystem, node, position, direction, bounds, structurePieces, metadata, overrideBounds, overrideStartPosition){

    var structurePiece = new StructurePiece(node.type, position.clone(), direction);

    structurePiece.chunks = tileSystem.getChunksInRange(position, bounds);
    structurePiece.metadata = metadata;

    structurePieces.push(structurePiece);

    Engine.log("Loaded structure: " + node.type);

    calculatePosition(position, direction, overrideBounds || bounds, node.type == NodeType.CORNER);
}

TileGenerator.prototype.generateStructures = function(){
    var position = new Vector2(0,0);
    var direction = this.track.startOrientation;

    for (var i = 0; i < this.track.nodes.length; i++) {
        var node = this.track.nodes[i];

        var bounds = this.stuctureBounds.get(node.type).clone();
        calculateBounds(bounds, direction);

        switch(node.type){
            case NodeType.FINISH:
            {
                generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces);

            }break;
            case NodeType.START:
            {
                for (var j = 0; j < node.range; j++){

                    var startPoint = null;
                    var metadata = j % 2;

                    if (metadata == 0){
                        startPoint = new Vector2(2.5, 2.5)
                    }
                    else{
                        startPoint = new Vector2(2.5, 7.5)
                    }

                    if (startPoint) startPoint = directPosition(position, startPoint, direction).scale(this.tileSystem.tileSize);
                    if (startPoint) this.startPositions.set(startPoint, direction);

                    generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces, metadata);
                }
            }break;
            case NodeType.STRAIGHT:
            {
                for (var j = 0; j < node.range; j++) generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces);
            }break;
            case NodeType.CORNER:
            {
                //special case for corner
                var offset = new Vector2(1, 1);
                calculateBounds(offset, node.orientation);

                var checkPoint = directPosition(position, new Vector2(4, 3), direction).scale(this.tileSystem.tileSize);
                if (checkPoint) this.checkPoints.push(checkPoint);

                generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces, node.orientation, offset, new Vector2(0, -1));
                direction = node.orientation;

                switch(direction){
                    case 0:
                        position.add(new Vector2(0, -1));
                        break;
                    case 1:
                        position.add(new Vector2(1, 0));
                        break;
                    case 2:
                        position.add(new Vector2(0, 1));
                        break;
                    case 3:
                        position.add(new Vector2(-1, 0));
                        break;
                }

            }break;
            default:
                continue;
        }

    }

};


function directPosition(structurePos, position, direction){

    var pos = null;

    switch (direction){
        case 0:
        {
            pos = structurePos.clone().add(position.clone().rotate(-Math.PI/2).floor());
        }break;
        case 1:
        {
            pos = structurePos.clone().add(position);
        }break;
        case 2:
        {
            pos = structurePos.clone().add(position.clone().rotate(Math.PI/2).floor());
        }break;
        case 3:
        {
            pos = structurePos.clone().add(position.clone().reverse());
        }break;
    }

    return pos;
}

function addStructureBlocks(tileSystem, position, direction, blocks){
    var self = this;
    blocks.forEach(function(block){
        var pos = directPosition(position, block.key, direction);

        if (pos != null){
            tileSystem.removeBlock(pos);
            tileSystem.setBlock(pos, block.value);
        }
    });
}

TileGenerator.prototype.generateCorner = function(position, direction, orientation){

    var blocks = new HashMap();

    var innerBlockId = 9;


    if (direction == 1 && orientation == 0) innerBlockId = 9;
    else if (direction == 2 && orientation == 1) innerBlockId = 10;
    else if (direction == 0 && orientation == 3) innerBlockId = 11;
    else if (direction == 3 && orientation == 2) innerBlockId = 12;


    blocks.set(new Vector2(0, 0), innerBlockId);
    blocks.set(new Vector2(0, 9), 13);

    for (var i = 1; i < 8; i++){
        for (var j = 0; j < 5; j++){

            var pos = new Vector2(j, i)

            blocks.set(pos, 2);
            blocks.set(pos.clone().swap().add(new Vector2(1, -1)), 2);
        }
    }

    for (var x = 0; x < 2; x++){
        for (var y = 0; y < 2; y++){
            blocks.set(new Vector2(5+x, 4+y), 2);
        }
    }

    addStructureBlocks(this.tileSystem, position, direction, blocks);
};

TileGenerator.prototype.generateRoad = function(position, direction){

    var blocks = new HashMap();

    for (var i = 0; i < 8; i++){
        blocks.set(new Vector2(i, 0), 3+(i)%2);
        blocks.set(new Vector2(i, 9), 3+(i)%2);

        for (var j = 0; j < 8; j++){
            if (((direction == 0 || direction == 1) && j == 3 && i == 3) || ((direction == 2 || direction == 3) && j == 4 && i == 4)){
                blocks.set(new Vector2(i, 1+j), direction == 1 || direction == 3 ? 5 : 6);
            }else{
                blocks.set(new Vector2(i, 1+j), 2);
            }
        }
    }

    addStructureBlocks(this.tileSystem, position, direction, blocks);
};

TileGenerator.prototype.generateFinish = function(position, direction){

    var blocks = new HashMap();


    for (var i = 0; i < 2; i++){
        blocks.set(new Vector2(i, 0), 3+(i)%2);
        blocks.set(new Vector2(i, 9), 3+(i)%2);

        for (var j = 0; j < 8; j++){
            if (i == 0) blocks.set(new Vector2(i, 1+j), 7);
            else blocks.set(new Vector2(i, 1+j), 2);
        }
    }

    addStructureBlocks(this.tileSystem, position, direction, blocks);
};

TileGenerator.prototype.generateStart = function(position, direction, metadata){

    var blocks = new HashMap();

    for (var i = 0; i < 6; i++){
        blocks.set(new Vector2(i, 0), 3+(i)%2);
        blocks.set(new Vector2(i, 9), 3+(i)%2);

        for (var j = 0; j < 8; j++){
            blocks.set(new Vector2(i, 1+j), 2);
        }
    }

    if (metadata == 0){
        blocks.set(new Vector2(4, 1), 8);
    }
    else{
        blocks.set(new Vector2(4, 6), 8);
    }

    addStructureBlocks(this.tileSystem, position, direction, blocks);
};
