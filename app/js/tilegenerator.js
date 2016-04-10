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
    this.minPosition = new Vector2();
    this.maxPosition = new Vector2();

    this.stuctureBounds = new Map();
    this.stuctureBounds.set(NodeType.FINISH, new Vector2(2, 10));
    this.stuctureBounds.set(NodeType.START, new Vector2(6, 10));
    this.stuctureBounds.set(NodeType.STRAIGHT, new Vector2(8, 10));
    this.stuctureBounds.set(NodeType.CORNER, new Vector2(11, 11));

    var tileSelectFunc = function(startPos, tileSystem, worldPos){
        var tileOffset = worldPos.clone().wrap(16).abs();

        //if (worldPos.lessThan(new Vector2(0))) tileOffset = new Vector2(15, 15).sub(tileOffset);

        return startPos.clone().add(tileOffset);
    };

    //Grass

    var grassFunc = curry(tileSelectFunc, new Vector2(0,16))
    var grassLayer = new BlockLayer(TilePosition.Centre, grassFunc);

    this.tileSystem.registerBlockType(1, new Block([
        [0, grassLayer]
    ], true));

    //Asphalt
    var asphaltFunc = curry(tileSelectFunc, new Vector2(16,16));
    var asphaltLayer = new BlockLayer(TilePosition.Centre, asphaltFunc);

    this.tileSystem.registerBlockType(2, new Block([
        [0, asphaltLayer]
    ], true));

    //Wall Red Whole

    this.tileSystem.registerBlockType(3, new Block([
        [0, new BlockLayer(TilePosition.Centre, null, [new Vector2(0, 0)])]
    ], true));

    //Wall White Whole

    this.tileSystem.registerBlockType(4, new Block([
        [0, new BlockLayer(TilePosition.Centre, null, [new Vector2(1, 0)])]
    ], true));

    //Straight arrow left-right

    this.tileSystem.registerBlockType(5, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [0, new BlockLayer(TilePosition.DownRight, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(0, 1)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(1, 1)])],
        [1, new BlockLayer(TilePosition.Down, null, [new Vector2(0, 2)])],
        [1, new BlockLayer(TilePosition.DownRight, null, [new Vector2(1, 2)])]
    ], true));

    //Straight arrow up-down

    this.tileSystem.registerBlockType(6, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [0, new BlockLayer(TilePosition.DownRight, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(4, 1)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(5, 1)])],
        [1, new BlockLayer(TilePosition.Down, null, [new Vector2(4, 2)])],
        [1, new BlockLayer(TilePosition.DownRight, null, [new Vector2(5, 2)])]
    ], true));

    //Finish line up-down

    this.tileSystem.registerBlockType(7, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(3, 3)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(4, 3)])],
    ], true));

    //Start line up-down

    this.tileSystem.registerBlockType(8, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [0, new BlockLayer(TilePosition.DownRight, asphaltFunc)],
        [0, new BlockLayer(TilePosition.DownDown, asphaltFunc)],
        [0, new BlockLayer(TilePosition.DownDownRight, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(4, 1)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(5, 1)])],
        [1, new BlockLayer(TilePosition.Down, null, [new Vector2(1, 3)])],
        [1, new BlockLayer(TilePosition.DownRight, null, [new Vector2(2, 3)])],
        [1, new BlockLayer(TilePosition.DownDown, null, [new Vector2(4, 2)])],
        [1, new BlockLayer(TilePosition.DownDownRight, null, [new Vector2(5, 2)])]
    ], true));

    //Corner inner wall: right-up

    this.tileSystem.registerBlockType(9, new Block([
        [0, new BlockLayer(TilePosition.Up, grassFunc)],
        [0, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Up, null, [new Vector2(6, 0)])],
        [1, new BlockLayer(TilePosition.UpRight, null, [new Vector2(7, 0)])],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(6, 1)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(7, 1)])]
    ], true));

    //Corner inner wall: left-up

    this.tileSystem.registerBlockType(10, new Block([
        [0, new BlockLayer(TilePosition.Up, grassFunc)],
        [0, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Up, null, [new Vector2(8, 0)])],
        [1, new BlockLayer(TilePosition.UpRight, null, [new Vector2(9, 0)])],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(8, 1)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(9, 1)])]
    ], true));

    //Corner inner wall: right-down

    this.tileSystem.registerBlockType(11, new Block([
        [0, new BlockLayer(TilePosition.Left, grassFunc)],
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.UpLeft, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Up, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Left, null, [new Vector2(10, 1)])],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(11, 1)])],
        [1, new BlockLayer(TilePosition.UpLeft, null, [new Vector2(10, 0)])],
        [1, new BlockLayer(TilePosition.Up, null, [new Vector2(11, 0)])]
    ], true));

    //Corner inner wall: left-down

    this.tileSystem.registerBlockType(12, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Left, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Down, grassFunc)],
        [0, new BlockLayer(TilePosition.DownLeft, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(13, 0)])],
        [1, new BlockLayer(TilePosition.Left, null, [new Vector2(12, 0)])],
        [1, new BlockLayer(TilePosition.Down, null, [new Vector2(13, 1)])],
        [1, new BlockLayer(TilePosition.DownLeft, null, [new Vector2(12, 1)])]
    ], true));

    //Corner outer wall: right-up

    this.tileSystem.registerBlockType(13, new Block([
        [0, new BlockLayer(TilePosition.Centre, grassFunc)],
        [0, new BlockLayer(TilePosition.Up, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, grassFunc)],
        [0, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [0, new BlockLayer(new Vector2(2, 0), grassFunc)],
        [0, new BlockLayer(new Vector2(2, -1), asphaltFunc)],
        [0, new BlockLayer(new Vector2(3, 0), grassFunc)],
        [0, new BlockLayer(new Vector2(3, -1), asphaltFunc)],
        [0, new BlockLayer(new Vector2(4, 0), grassFunc)],
        [0, new BlockLayer(new Vector2(4, -1), grassFunc)],
        [0, new BlockLayer(new Vector2(4, -2), asphaltFunc)],
        [0, new BlockLayer(new Vector2(5, -1), grassFunc)],
        [0, new BlockLayer(new Vector2(5, -2), asphaltFunc)],
        [0, new BlockLayer(new Vector2(5, -3), asphaltFunc)],
        [0, new BlockLayer(new Vector2(6, -1), grassFunc)],
        [0, new BlockLayer(new Vector2(6, -2), grassFunc)],
        [0, new BlockLayer(new Vector2(6, -3), asphaltFunc)],
        [0, new BlockLayer(new Vector2(7, -2), grassFunc)],
        [0, new BlockLayer(new Vector2(7, -3), grassFunc)],
        [0, new BlockLayer(new Vector2(7, -4), asphaltFunc)],
        [0, new BlockLayer(new Vector2(7, -5), asphaltFunc)],
        [0, new BlockLayer(new Vector2(8, -3), grassFunc)],
        [0, new BlockLayer(new Vector2(8, -4), grassFunc)],
        [0, new BlockLayer(new Vector2(8, -5), asphaltFunc)],
        [0, new BlockLayer(new Vector2(8, -6), asphaltFunc)],
        [0, new BlockLayer(new Vector2(9, -4), grassFunc)],
        [0, new BlockLayer(new Vector2(9, -5), grassFunc)],
        [0, new BlockLayer(new Vector2(9, -6), grassFunc)],
        [0, new BlockLayer(new Vector2(9, -7), asphaltFunc)],
        [0, new BlockLayer(new Vector2(9, -8), asphaltFunc)],
        [0, new BlockLayer(new Vector2(9, -9), asphaltFunc)],
        [0, new BlockLayer(new Vector2(9, -10), asphaltFunc)],
        [0, new BlockLayer(new Vector2(10, -6), grassFunc)],
        [0, new BlockLayer(new Vector2(10, -7), grassFunc)],
        [0, new BlockLayer(new Vector2(10, -8), grassFunc)],
        [0, new BlockLayer(new Vector2(10, -9), grassFunc)],
        [0, new BlockLayer(new Vector2(10, -10), grassFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(5, 14)])],
        [1, new BlockLayer(TilePosition.Up, null, [new Vector2(5, 13)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(6, 14)])],
        [1, new BlockLayer(TilePosition.UpRight, null, [new Vector2(6, 13)])],
        [1, new BlockLayer(new Vector2(2, 0), null, [new Vector2(7, 14)])],
        [1, new BlockLayer(new Vector2(2, -1), null, [new Vector2(7, 13)])],
        [1, new BlockLayer(new Vector2(3, 0), null, [new Vector2(8, 14)])],
        [1, new BlockLayer(new Vector2(3, -1), null, [new Vector2(8, 13)])],
        [1, new BlockLayer(new Vector2(4, 0), null, [new Vector2(9, 14)])],
        [1, new BlockLayer(new Vector2(4, -1), null, [new Vector2(9, 13)])],
        [1, new BlockLayer(new Vector2(4, -2), null, [new Vector2(9, 12)])],
        [1, new BlockLayer(new Vector2(5, -1), null, [new Vector2(10, 13)])],
        [1, new BlockLayer(new Vector2(5, -2), null, [new Vector2(10, 12)])],
        [1, new BlockLayer(new Vector2(5, -3), null, [new Vector2(10, 11)])],
        [1, new BlockLayer(new Vector2(6, -1), null, [new Vector2(11, 13)])],
        [1, new BlockLayer(new Vector2(6, -2), null, [new Vector2(11, 12)])],
        [1, new BlockLayer(new Vector2(6, -3), null, [new Vector2(11, 11)])],
        [1, new BlockLayer(new Vector2(7, -2), null, [new Vector2(12, 12)])],
        [1, new BlockLayer(new Vector2(7, -3), null, [new Vector2(12, 11)])],
        [1, new BlockLayer(new Vector2(7, -4), null, [new Vector2(12, 10)])],
        [1, new BlockLayer(new Vector2(7, -5), null, [new Vector2(12, 9)])],
        [1, new BlockLayer(new Vector2(8, -3), null, [new Vector2(13, 11)])],
        [1, new BlockLayer(new Vector2(8, -4), null, [new Vector2(13, 10)])],
        [1, new BlockLayer(new Vector2(8, -5), null, [new Vector2(13, 9)])],
        [1, new BlockLayer(new Vector2(8, -6), null, [new Vector2(13, 8)])],
        [1, new BlockLayer(new Vector2(9, -4), null, [new Vector2(14, 10)])],
        [1, new BlockLayer(new Vector2(9, -5), null, [new Vector2(14, 9)])],
        [1, new BlockLayer(new Vector2(9, -6), null, [new Vector2(14, 8)])],
        [1, new BlockLayer(new Vector2(9, -7), null, [new Vector2(14, 7)])],
        [1, new BlockLayer(new Vector2(9, -8), null, [new Vector2(14, 6)])],
        [1, new BlockLayer(new Vector2(9, -9), null, [new Vector2(14, 5)])],
        [1, new BlockLayer(new Vector2(9, -10), null, [new Vector2(14, 4)])],
        [1, new BlockLayer(new Vector2(10, -6), null, [new Vector2(15, 8)])],
        [1, new BlockLayer(new Vector2(10, -7), null, [new Vector2(15, 7)])],
        [1, new BlockLayer(new Vector2(10, -8), null, [new Vector2(15, 6)])],
        [1, new BlockLayer(new Vector2(10, -9), null, [new Vector2(15, 5)])],
        [1, new BlockLayer(new Vector2(10, -10), null, [new Vector2(15, 4)])]


    ], true));

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

TileGenerator.prototype.generateStructure = function(tileSystem, node, position, direction, bounds, structurePieces, metadata, overrideBounds, overrideStartPosition){

    var structurePiece = new StructurePiece(node.type, position.clone(), direction);

    structurePiece.chunks = tileSystem.getChunksInRange(position, bounds);

    this.minPosition = position.minPoint(this.minPosition);
    this.minPosition = position.clone().add(bounds).minPoint(this.minPosition);
    this.maxPosition = position.maxPoint(this.maxPosition)
    this.maxPosition = position.clone().add(bounds).maxPoint(this.maxPosition)

    structurePiece.metadata = metadata;

    structurePieces.push(structurePiece);

    Engine.log("Loaded structure: " + node.type);

    calculatePosition(position, direction, overrideBounds || bounds, node.type == NodeType.CORNER);
};

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
                var checkPoint = directPosition(position, new Vector2(11, 5), direction).scale(this.tileSystem.tileSize);
                if (checkPoint) this.checkPoints.push(checkPoint);

                this.generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces);

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

                    this.generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces, metadata);
                }
            }break;
            case NodeType.STRAIGHT:
            {
                for (var j = 0; j < node.range; j++) this.generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces);
            }break;
            case NodeType.CORNER:
            {
                //special case for corner
                var offset = new Vector2(1, 1);
                calculateBounds(offset, node.orientation);

                var checkPoint = directPosition(position, new Vector2(4, 3), direction).scale(this.tileSystem.tileSize);
                if (checkPoint) this.checkPoints.push(checkPoint);

                this.generateStructure(this.tileSystem, node, position, direction, bounds, this.structurePieces, node.orientation, offset, new Vector2(0, -1));
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
