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

//Corner inner wall: right-down (normal)

    this.tileSystem.registerBlockType(10, new Block([
        [1, new BlockLayer(TilePosition.Left, grassFunc)],
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.UpLeft, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Up, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(16, 1)])],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(17, 1)])],
        [2, new BlockLayer(TilePosition.UpLeft, null, [new Vector2(16, 0)])],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(17, 0)])]
    ], true));

    //Corner inner wall: right-down (flipped)

    this.tileSystem.registerBlockType(11, new Block([
        [1, new BlockLayer(TilePosition.Left, grassFunc)],
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.UpLeft, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Up, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(16, 1)], true)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(17, 1)], true)],
        [2, new BlockLayer(TilePosition.UpLeft, null, [new Vector2(16, 0)], true)],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(17, 0)], true)]
    ], true));

    //Corner inner wall: right-up (normal)

    this.tileSystem.registerBlockType(12, new Block([
        [1, new BlockLayer(TilePosition.Up, grassFunc)],
        [1, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(18, 0)])],
        [2, new BlockLayer(TilePosition.UpRight, null, [new Vector2(19, 0)])],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(18, 1)])],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(19, 1)])]
    ], true));

    //Corner inner wall: right-up (flipped)

    this.tileSystem.registerBlockType(13, new Block([
        [1, new BlockLayer(TilePosition.Up, grassFunc)],
        [1, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(18, 0)], true)],
        [2, new BlockLayer(TilePosition.UpRight, null, [new Vector2(19, 0)], true)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(18, 1)], true)],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(19, 1)], true)]
    ], true));

    //Corner inner wall: left-up (normal)

    this.tileSystem.registerBlockType(14, new Block([
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Right, grassFunc)],
        [1, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [1, new BlockLayer(TilePosition.DownRight, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(12, 0)])],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(13, 0)])],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(12, 1)])],
        [2, new BlockLayer(TilePosition.DownRight, null, [new Vector2(13, 1)])]
    ], true));

    //Corner inner wall: left-up (flipped)

    this.tileSystem.registerBlockType(15, new Block([
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Right, grassFunc)],
        [1, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [1, new BlockLayer(TilePosition.DownRight, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(12, 0)], true)],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(13, 0)], true)],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(12, 1)], true)],
        [2, new BlockLayer(TilePosition.DownRight, null, [new Vector2(13, 1)], true)]
    ], true));

    //Corner inner wall: left-down (normal)

    this.tileSystem.registerBlockType(16, new Block([
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Left, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Down, grassFunc)],
        [1, new BlockLayer(TilePosition.DownLeft, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(15, 0)])],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(14, 0)])],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(15, 1)])],
        [2, new BlockLayer(TilePosition.DownLeft, null, [new Vector2(14, 1)])]
    ], true));

    //Corner inner wall: left-down (flipped)

    this.tileSystem.registerBlockType(17, new Block([
        [1, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Left, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Down, grassFunc)],
        [1, new BlockLayer(TilePosition.DownLeft, asphaltFunc)],
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(15, 0)], true)],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(14, 0)], true)],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(15, 1)], true)],
        [2, new BlockLayer(TilePosition.DownLeft, null, [new Vector2(14, 1)], true)]
    ], true));

    //Corner outer wall: right-up

    var rightUpLower = [
        [1, new BlockLayer(TilePosition.Centre, grassFunc)],
        [1, new BlockLayer(TilePosition.Left, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Up, grassFunc)],
        [1, new BlockLayer(TilePosition.UpLeft, asphaltFunc)],
        [1, new BlockLayer(new Vector2(0, -2), grassFunc)],
        [1, new BlockLayer(new Vector2(-1, -2), asphaltFunc)],
        [1, new BlockLayer(new Vector2(0, -3), grassFunc)],
        [1, new BlockLayer(new Vector2(-1, -3), asphaltFunc)],
        [1, new BlockLayer(new Vector2(0, -4), grassFunc)],
        [1, new BlockLayer(new Vector2(-1, -4), grassFunc)],
        [1, new BlockLayer(new Vector2(-2, -4), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-1, -5), grassFunc)],
        [1, new BlockLayer(new Vector2(-2, -5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-3, -5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-1, -6), grassFunc)],
        [1, new BlockLayer(new Vector2(-2, -6), grassFunc)],
        [1, new BlockLayer(new Vector2(-3, -6), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-2, -7), grassFunc)],
        [1, new BlockLayer(new Vector2(-3, -7), grassFunc)],
        [1, new BlockLayer(new Vector2(-4, -7), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-5, -7), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-3, -8), grassFunc)],
        [1, new BlockLayer(new Vector2(-4, -8), grassFunc)],
        [1, new BlockLayer(new Vector2(-5, -8), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-6, -8), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-4, -9), grassFunc)],
        [1, new BlockLayer(new Vector2(-5, -9), grassFunc)],
        [1, new BlockLayer(new Vector2(-6, -9), grassFunc)],
        [1, new BlockLayer(new Vector2(-7, -9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-8, -9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-9, -9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-10, -9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-6, -10), grassFunc)],
        [1, new BlockLayer(new Vector2(-7, -10), grassFunc)],
        [1, new BlockLayer(new Vector2(-8, -10), grassFunc)],
        [1, new BlockLayer(new Vector2(-9, -10), grassFunc)],
        [1, new BlockLayer(new Vector2(-10, -10), grassFunc)]
    ];

    this.tileSystem.registerBlockType(18, new Block(rightUpLower.concat([
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(28, 12)])],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(27, 12)])],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(28, 11)])],
        [2, new BlockLayer(TilePosition.UpLeft, null, [new Vector2(27, 11)])],
        [2, new BlockLayer(new Vector2(0, -2), null, [new Vector2(28, 10)])],
        [2, new BlockLayer(new Vector2(-1, -2), null, [new Vector2(27, 10)])],
        [2, new BlockLayer(new Vector2(0, -3), null, [new Vector2(28, 9)])],
        [2, new BlockLayer(new Vector2(-1, -3), null, [new Vector2(27, 9)])],
        [2, new BlockLayer(new Vector2(0, -4), null, [new Vector2(28, 8)])],
        [2, new BlockLayer(new Vector2(-1, -4), null, [new Vector2(27, 8)])],
        [2, new BlockLayer(new Vector2(-2, -4), null, [new Vector2(26, 8)])],
        [2, new BlockLayer(new Vector2(-1, -5), null, [new Vector2(27, 7)])],
        [2, new BlockLayer(new Vector2(-2, -5), null, [new Vector2(26, 7)])],
        [2, new BlockLayer(new Vector2(-3, -5), null, [new Vector2(25, 7)])],
        [2, new BlockLayer(new Vector2(-1, -6), null, [new Vector2(27, 6)])],
        [2, new BlockLayer(new Vector2(-2, -6), null, [new Vector2(26, 6)])],
        [2, new BlockLayer(new Vector2(-3, -6), null, [new Vector2(25, 6)])],
        [2, new BlockLayer(new Vector2(-2,  -7), null, [new Vector2(26, 5)])],
        [2, new BlockLayer(new Vector2(-3, -7), null, [new Vector2(25, 5)])],
        [2, new BlockLayer(new Vector2(-4, -7), null, [new Vector2(24, 5)])],
        [2, new BlockLayer(new Vector2(-5, -7), null, [new Vector2(23, 5)])],
        [2, new BlockLayer(new Vector2(-3,  -8), null, [new Vector2(25, 4)])],
        [2, new BlockLayer(new Vector2(-4, -8), null, [new Vector2(24, 4)])],
        [2, new BlockLayer(new Vector2(-5, -8), null, [new Vector2(23, 4)])],
        [2, new BlockLayer(new Vector2(-6, -8), null, [new Vector2(22, 4)])],
        [2, new BlockLayer(new Vector2(-4,  -9), null, [new Vector2(24, 3)])],
        [2, new BlockLayer(new Vector2(-5, -9), null, [new Vector2(23, 3)])],
        [2, new BlockLayer(new Vector2(-6, -9), null, [new Vector2(22, 3)])],
        [2, new BlockLayer(new Vector2(-7, -9), null, [new Vector2(21, 3)])],
        [2, new BlockLayer(new Vector2(-8, -9), null, [new Vector2(20, 3)])],
        [2, new BlockLayer(new Vector2(-9, -9), null, [new Vector2(19, 3)])],
        [2, new BlockLayer(new Vector2(-10, -9), null, [new Vector2(18, 3)])],
        [2, new BlockLayer(new Vector2(-6, -10), null, [new Vector2(22, 2)])],
        [2, new BlockLayer(new Vector2(-7, -10), null, [new Vector2(21, 2)])],
        [2, new BlockLayer(new Vector2(-8, -10), null, [new Vector2(20, 2)])],
        [2, new BlockLayer(new Vector2(-9, -10), null, [new Vector2(19, 2)])],
        [2, new BlockLayer(new Vector2(-10, -10), null, [new Vector2(18, 2)])]

    ]), true));

    this.tileSystem.registerBlockType(19, new Block(rightUpLower.concat([

        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(28, 12)], true)],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(27, 12)], true)],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(28, 11)], true)],
        [2, new BlockLayer(TilePosition.UpLeft, null, [new Vector2(27, 11)], true)],
        [2, new BlockLayer(new Vector2(0, -2), null, [new Vector2(28, 10)], true)],
        [2, new BlockLayer(new Vector2(-1, -2), null, [new Vector2(27, 10)], true)],
        [2, new BlockLayer(new Vector2(0, -3), null, [new Vector2(28, 9)], true)],
        [2, new BlockLayer(new Vector2(-1, -3), null, [new Vector2(27, 9)], true)],
        [2, new BlockLayer(new Vector2(0, -4), null, [new Vector2(28, 8)], true)],
        [2, new BlockLayer(new Vector2(-1, -4), null, [new Vector2(27, 8)], true)],
        [2, new BlockLayer(new Vector2(-2, -4), null, [new Vector2(26, 8)], true)],
        [2, new BlockLayer(new Vector2(-1, -5), null, [new Vector2(27, 7)], true)],
        [2, new BlockLayer(new Vector2(-2, -5), null, [new Vector2(26, 7)], true)],
        [2, new BlockLayer(new Vector2(-3, -5), null, [new Vector2(25, 7)], true)],
        [2, new BlockLayer(new Vector2(-1, -6), null, [new Vector2(27, 6)], true)],
        [2, new BlockLayer(new Vector2(-2, -6), null, [new Vector2(26, 6)], true)],
        [2, new BlockLayer(new Vector2(-3, -6), null, [new Vector2(25, 6)], true)],
        [2, new BlockLayer(new Vector2(-2,  -7), null, [new Vector2(26, 5)], true)],
        [2, new BlockLayer(new Vector2(-3, -7), null, [new Vector2(25, 5)], true)],
        [2, new BlockLayer(new Vector2(-4, -7), null, [new Vector2(24, 5)], true)],
        [2, new BlockLayer(new Vector2(-5, -7), null, [new Vector2(23, 5)], true)],
        [2, new BlockLayer(new Vector2(-3,  -8), null, [new Vector2(25, 4)], true)],
        [2, new BlockLayer(new Vector2(-4, -8), null, [new Vector2(24, 4)], true)],
        [2, new BlockLayer(new Vector2(-5, -8), null, [new Vector2(23, 4)], true)],
        [2, new BlockLayer(new Vector2(-6, -8), null, [new Vector2(22, 4)], true)],
        [2, new BlockLayer(new Vector2(-4,  -9), null, [new Vector2(24, 3)], true)],
        [2, new BlockLayer(new Vector2(-5, -9), null, [new Vector2(23, 3)], true)],
        [2, new BlockLayer(new Vector2(-6, -9), null, [new Vector2(22, 3)], true)],
        [2, new BlockLayer(new Vector2(-7, -9), null, [new Vector2(21, 3)], true)],
        [2, new BlockLayer(new Vector2(-8, -9), null, [new Vector2(20, 3)], true)],
        [2, new BlockLayer(new Vector2(-9, -9), null, [new Vector2(19, 3)], true)],
        [2, new BlockLayer(new Vector2(-10, -9), null, [new Vector2(18, 3)], true)],
        [2, new BlockLayer(new Vector2(-6, -10), null, [new Vector2(22, 2)], true)],
        [2, new BlockLayer(new Vector2(-7, -10), null, [new Vector2(21, 2)], true)],
        [2, new BlockLayer(new Vector2(-8, -10), null, [new Vector2(20, 2)], true)],
        [2, new BlockLayer(new Vector2(-9, -10), null, [new Vector2(19, 2)], true)],
        [2, new BlockLayer(new Vector2(-10, -10), null, [new Vector2(18, 2)], true)]
    ]), true));

    //Corner outer wall: right-down

    var rightDownLower = [
        [1, new BlockLayer(TilePosition.Centre, grassFunc)],
        [1, new BlockLayer(TilePosition.Up, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Right, grassFunc)],
        [1, new BlockLayer(TilePosition.UpRight, asphaltFunc)],
        [1, new BlockLayer(new Vector2(2, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(2, -1), asphaltFunc)],
        [1, new BlockLayer(new Vector2(3, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(3, -1), asphaltFunc)],
        [1, new BlockLayer(new Vector2(4, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(4, -1), grassFunc)],
        [1, new BlockLayer(new Vector2(4, -2), asphaltFunc)],
        [1, new BlockLayer(new Vector2(5, -1), grassFunc)],
        [1, new BlockLayer(new Vector2(5, -2), asphaltFunc)],
        [1, new BlockLayer(new Vector2(5, -3), asphaltFunc)],
        [1, new BlockLayer(new Vector2(6, -1), grassFunc)],
        [1, new BlockLayer(new Vector2(6, -2), grassFunc)],
        [1, new BlockLayer(new Vector2(6, -3), asphaltFunc)],
        [1, new BlockLayer(new Vector2(7, -2), grassFunc)],
        [1, new BlockLayer(new Vector2(7, -3), grassFunc)],
        [1, new BlockLayer(new Vector2(7, -4), asphaltFunc)],
        [1, new BlockLayer(new Vector2(7, -5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(8, -3), grassFunc)],
        [1, new BlockLayer(new Vector2(8, -4), grassFunc)],
        [1, new BlockLayer(new Vector2(8, -5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(8, -6), asphaltFunc)],
        [1, new BlockLayer(new Vector2(9, -4), grassFunc)],
        [1, new BlockLayer(new Vector2(9, -5), grassFunc)],
        [1, new BlockLayer(new Vector2(9, -6), grassFunc)],
        [1, new BlockLayer(new Vector2(9, -7), asphaltFunc)],
        [1, new BlockLayer(new Vector2(9, -8), asphaltFunc)],
        [1, new BlockLayer(new Vector2(9, -9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(9, -10), asphaltFunc)],
        [1, new BlockLayer(new Vector2(10, -6), grassFunc)],
        [1, new BlockLayer(new Vector2(10, -7), grassFunc)],
        [1, new BlockLayer(new Vector2(10, -8), grassFunc)],
        [1, new BlockLayer(new Vector2(10, -9), grassFunc)],
        [1, new BlockLayer(new Vector2(10, -10), grassFunc)]
    ];

    this.tileSystem.registerBlockType(20, new Block(rightDownLower.concat([
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(5, 14)])],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(5, 13)])],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(6, 14)])],
        [2, new BlockLayer(TilePosition.UpRight, null, [new Vector2(6, 13)])],
        [2, new BlockLayer(new Vector2(2, 0), null, [new Vector2(7, 14)])],
        [2, new BlockLayer(new Vector2(2, -1), null, [new Vector2(7, 13)])],
        [2, new BlockLayer(new Vector2(3, 0), null, [new Vector2(8, 14)])],
        [2, new BlockLayer(new Vector2(3, -1), null, [new Vector2(8, 13)])],
        [2, new BlockLayer(new Vector2(4, 0), null, [new Vector2(9, 14)])],
        [2, new BlockLayer(new Vector2(4, -1), null, [new Vector2(9, 13)])],
        [2, new BlockLayer(new Vector2(4, -2), null, [new Vector2(9, 12)])],
        [2, new BlockLayer(new Vector2(5, -1), null, [new Vector2(10, 13)])],
        [2, new BlockLayer(new Vector2(5, -2), null, [new Vector2(10, 12)])],
        [2, new BlockLayer(new Vector2(5, -3), null, [new Vector2(10, 11)])],
        [2, new BlockLayer(new Vector2(6, -1), null, [new Vector2(11, 13)])],
        [2, new BlockLayer(new Vector2(6, -2), null, [new Vector2(11, 12)])],
        [2, new BlockLayer(new Vector2(6, -3), null, [new Vector2(11, 11)])],
        [2, new BlockLayer(new Vector2(7, -2), null, [new Vector2(12, 12)])],
        [2, new BlockLayer(new Vector2(7, -3), null, [new Vector2(12, 11)])],
        [2, new BlockLayer(new Vector2(7, -4), null, [new Vector2(12, 10)])],
        [2, new BlockLayer(new Vector2(7, -5), null, [new Vector2(12, 9)])],
        [2, new BlockLayer(new Vector2(8, -3), null, [new Vector2(13, 11)])],
        [2, new BlockLayer(new Vector2(8, -4), null, [new Vector2(13, 10)])],
        [2, new BlockLayer(new Vector2(8, -5), null, [new Vector2(13, 9)])],
        [2, new BlockLayer(new Vector2(8, -6), null, [new Vector2(13, 8)])],
        [2, new BlockLayer(new Vector2(9, -4), null, [new Vector2(14, 10)])],
        [2, new BlockLayer(new Vector2(9, -5), null, [new Vector2(14, 9)])],
        [2, new BlockLayer(new Vector2(9, -6), null, [new Vector2(14, 8)])],
        [2, new BlockLayer(new Vector2(9, -7), null, [new Vector2(14, 7)])],
        [2, new BlockLayer(new Vector2(9, -8), null, [new Vector2(14, 6)])],
        [2, new BlockLayer(new Vector2(9, -9), null, [new Vector2(14, 5)])],
        [2, new BlockLayer(new Vector2(9, -10), null, [new Vector2(14, 4)])],
        [2, new BlockLayer(new Vector2(10, -6), null, [new Vector2(15, 8)])],
        [2, new BlockLayer(new Vector2(10, -7), null, [new Vector2(15, 7)])],
        [2, new BlockLayer(new Vector2(10, -8), null, [new Vector2(15, 6)])],
        [2, new BlockLayer(new Vector2(10, -9), null, [new Vector2(15, 5)])],
        [2, new BlockLayer(new Vector2(10, -10), null, [new Vector2(15, 4)])]
    ]), true));

    this.tileSystem.registerBlockType(21, new Block(rightDownLower.concat([
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(5, 14)], true)],
        [2, new BlockLayer(TilePosition.Up, null, [new Vector2(5, 13)], true)],
        [2, new BlockLayer(TilePosition.Right, null, [new Vector2(6, 14)], true)],
        [2, new BlockLayer(TilePosition.UpRight, null, [new Vector2(6, 13)], true)],
        [2, new BlockLayer(new Vector2(2, 0), null, [new Vector2(7, 14)], true)],
        [2, new BlockLayer(new Vector2(2, -1), null, [new Vector2(7, 13)], true)],
        [2, new BlockLayer(new Vector2(3, 0), null, [new Vector2(8, 14)], true)],
        [2, new BlockLayer(new Vector2(3, -1), null, [new Vector2(8, 13)], true)],
        [2, new BlockLayer(new Vector2(4, 0), null, [new Vector2(9, 14)], true)],
        [2, new BlockLayer(new Vector2(4, -1), null, [new Vector2(9, 13)], true)],
        [2, new BlockLayer(new Vector2(4, -2), null, [new Vector2(9, 12)], true)],
        [2, new BlockLayer(new Vector2(5, -1), null, [new Vector2(10, 13)], true)],
        [2, new BlockLayer(new Vector2(5, -2), null, [new Vector2(10, 12)], true)],
        [2, new BlockLayer(new Vector2(5, -3), null, [new Vector2(10, 11)], true)],
        [2, new BlockLayer(new Vector2(6, -1), null, [new Vector2(11, 13)], true)],
        [2, new BlockLayer(new Vector2(6, -2), null, [new Vector2(11, 12)], true)],
        [2, new BlockLayer(new Vector2(6, -3), null, [new Vector2(11, 11)], true)],
        [2, new BlockLayer(new Vector2(7, -2), null, [new Vector2(12, 12)], true)],
        [2, new BlockLayer(new Vector2(7, -3), null, [new Vector2(12, 11)], true)],
        [2, new BlockLayer(new Vector2(7, -4), null, [new Vector2(12, 10)], true)],
        [2, new BlockLayer(new Vector2(7, -5), null, [new Vector2(12, 9)], true)],
        [2, new BlockLayer(new Vector2(8, -3), null, [new Vector2(13, 11)], true)],
        [2, new BlockLayer(new Vector2(8, -4), null, [new Vector2(13, 10)], true)],
        [2, new BlockLayer(new Vector2(8, -5), null, [new Vector2(13, 9)], true)],
        [2, new BlockLayer(new Vector2(8, -6), null, [new Vector2(13, 8)], true)],
        [2, new BlockLayer(new Vector2(9, -4), null, [new Vector2(14, 10)], true)],
        [2, new BlockLayer(new Vector2(9, -5), null, [new Vector2(14, 9)], true)],
        [2, new BlockLayer(new Vector2(9, -6), null, [new Vector2(14, 8)], true)],
        [2, new BlockLayer(new Vector2(9, -7), null, [new Vector2(14, 7)], true)],
        [2, new BlockLayer(new Vector2(9, -8), null, [new Vector2(14, 6)], true)],
        [2, new BlockLayer(new Vector2(9, -9), null, [new Vector2(14, 5)], true)],
        [2, new BlockLayer(new Vector2(9, -10), null, [new Vector2(14, 4)], true)],
        [2, new BlockLayer(new Vector2(10, -6), null, [new Vector2(15, 8)], true)],
        [2, new BlockLayer(new Vector2(10, -7), null, [new Vector2(15, 7)], true)],
        [2, new BlockLayer(new Vector2(10, -8), null, [new Vector2(15, 6)], true)],
        [2, new BlockLayer(new Vector2(10, -9), null, [new Vector2(15, 5)], true)],
        [2, new BlockLayer(new Vector2(10, -10), null, [new Vector2(15, 4)], true)]
    ]), true));

    //Corner outer wall: left-down

    var leftDownLower = [
        [1, new BlockLayer(TilePosition.Centre, grassFunc)],
        [1, new BlockLayer(TilePosition.Down, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Left, grassFunc)],
        [1, new BlockLayer(TilePosition.DownLeft, asphaltFunc)],
        [1, new BlockLayer(new Vector2(-2, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(-2, 1), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-3, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(-3, 1), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-4, 0), grassFunc)],
        [1, new BlockLayer(new Vector2(-4, 1), grassFunc)],
        [1, new BlockLayer(new Vector2(-4, 2), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-5, 1), grassFunc)],
        [1, new BlockLayer(new Vector2(-5, 2), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-5, 3), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-6, 1), grassFunc)],
        [1, new BlockLayer(new Vector2(-6, 2), grassFunc)],
        [1, new BlockLayer(new Vector2(-6, 3), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-7, 2), grassFunc)],
        [1, new BlockLayer(new Vector2(-7, 3), grassFunc)],
        [1, new BlockLayer(new Vector2(-7, 4), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-7, 5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-8, 3), grassFunc)],
        [1, new BlockLayer(new Vector2(-8, 4), grassFunc)],
        [1, new BlockLayer(new Vector2(-8, 5), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-8, 6), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-9, 4), grassFunc)],
        [1, new BlockLayer(new Vector2(-9, 5), grassFunc)],
        [1, new BlockLayer(new Vector2(-9, 6), grassFunc)],
        [1, new BlockLayer(new Vector2(-9, 7), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-9, 8), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-9, 9), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-9, 10), asphaltFunc)],
        [1, new BlockLayer(new Vector2(-10, 6), grassFunc)],
        [1, new BlockLayer(new Vector2(-10, 7), grassFunc)],
        [1, new BlockLayer(new Vector2(-10, 8), grassFunc)],
        [1, new BlockLayer(new Vector2(-10, 9), grassFunc)],
        [1, new BlockLayer(new Vector2(-10, 10), grassFunc)]
    ];

    this.tileSystem.registerBlockType(24, new Block(leftDownLower.concat([
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(13, 2)])],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(12, 2)])],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(13, 3)])],
        [2, new BlockLayer(TilePosition.DownLeft, null, [new Vector2(12, 3)])],
        [2, new BlockLayer(new Vector2(-2, 0), null, [new Vector2(11, 2)])],
        [2, new BlockLayer(new Vector2(-2, 1), null, [new Vector2(11, 3)])],
        [2, new BlockLayer(new Vector2(-3, 0), null, [new Vector2(10, 2)])],
        [2, new BlockLayer(new Vector2(-3, 1), null, [new Vector2(10, 3)])],
        [2, new BlockLayer(new Vector2(-4, 0), null, [new Vector2(9, 2)])],
        [2, new BlockLayer(new Vector2(-4, 1), null, [new Vector2(9, 3)])],
        [2, new BlockLayer(new Vector2(-4, 2), null, [new Vector2(9, 4)])],
        [2, new BlockLayer(new Vector2(-5, 1), null, [new Vector2(8, 3)])],
        [2, new BlockLayer(new Vector2(-5, 2), null, [new Vector2(8, 4)])],
        [2, new BlockLayer(new Vector2(-5, 3), null, [new Vector2(8, 5)])],
        [2, new BlockLayer(new Vector2(-6, 1), null, [new Vector2(7, 3)])],
        [2, new BlockLayer(new Vector2(-6, 2), null, [new Vector2(7, 4)])],
        [2, new BlockLayer(new Vector2(-6, 3), null, [new Vector2(7, 5)])],
        [2, new BlockLayer(new Vector2( -7, 2), null, [new Vector2(6, 4)])],
        [2, new BlockLayer(new Vector2(-7, 3), null, [new Vector2(6, 5)])],
        [2, new BlockLayer(new Vector2(-7, 4), null, [new Vector2(6, 6)])],
        [2, new BlockLayer(new Vector2(-7, 5), null, [new Vector2(6, 7)])],
        [2, new BlockLayer(new Vector2( -8, 3), null, [new Vector2(5, 5)])],
        [2, new BlockLayer(new Vector2(-8, 4), null, [new Vector2(5, 6)])],
        [2, new BlockLayer(new Vector2(-8, 5), null, [new Vector2(5, 7)])],
        [2, new BlockLayer(new Vector2(-8, 6), null, [new Vector2(5, 8)])],
        [2, new BlockLayer(new Vector2( -9, 4), null, [new Vector2(4, 6)])],
        [2, new BlockLayer(new Vector2(-9, 5), null, [new Vector2(4, 7)])],
        [2, new BlockLayer(new Vector2(-9, 6), null, [new Vector2(4, 8)])],
        [2, new BlockLayer(new Vector2(-9, 7), null, [new Vector2(4, 9)])],
        [2, new BlockLayer(new Vector2(-9, 8), null, [new Vector2(4, 10)])],
        [2, new BlockLayer(new Vector2(-9, 9), null, [new Vector2(4, 11)])],
        [2, new BlockLayer(new Vector2(-9, 10), null, [new Vector2(4, 12)])],
        [2, new BlockLayer(new Vector2(-10, 6), null, [new Vector2(3, 8)])],
        [2, new BlockLayer(new Vector2(-10, 7), null, [new Vector2(3, 9)])],
        [2, new BlockLayer(new Vector2(-10, 8), null, [new Vector2(3, 10)])],
        [2, new BlockLayer(new Vector2(-10, 9), null, [new Vector2(3, 11)])],
        [2, new BlockLayer(new Vector2(-10, 10), null, [new Vector2(3, 12)])]
    ]), true));

    this.tileSystem.registerBlockType(25, new Block(leftDownLower.concat([
        [2, new BlockLayer(TilePosition.Centre, null, [new Vector2(13, 2)], true)],
        [2, new BlockLayer(TilePosition.Left, null, [new Vector2(12, 2)], true)],
        [2, new BlockLayer(TilePosition.Down, null, [new Vector2(13, 3)], true)],
        [2, new BlockLayer(TilePosition.DownLeft, null, [new Vector2(12, 3)], true)],
        [2, new BlockLayer(new Vector2(-2, 0), null, [new Vector2(11, 2)], true)],
        [2, new BlockLayer(new Vector2(-2, 1), null, [new Vector2(11, 3)], true)],
        [2, new BlockLayer(new Vector2(-3, 0), null, [new Vector2(10, 2)], true)],
        [2, new BlockLayer(new Vector2(-3, 1), null, [new Vector2(10, 3)], true)],
        [2, new BlockLayer(new Vector2(-4, 0), null, [new Vector2(9, 2)], true)],
        [2, new BlockLayer(new Vector2(-4, 1), null, [new Vector2(9, 3)], true)],
        [2, new BlockLayer(new Vector2(-4, 2), null, [new Vector2(9, 4)], true)],
        [2, new BlockLayer(new Vector2(-5, 1), null, [new Vector2(8, 3)], true)],
        [2, new BlockLayer(new Vector2(-5, 2), null, [new Vector2(8, 4)], true)],
        [2, new BlockLayer(new Vector2(-5, 3), null, [new Vector2(8, 5)], true)],
        [2, new BlockLayer(new Vector2(-6, 1), null, [new Vector2(7, 3)], true)],
        [2, new BlockLayer(new Vector2(-6, 2), null, [new Vector2(7, 4)], true)],
        [2, new BlockLayer(new Vector2(-6, 3), null, [new Vector2(7, 5)], true)],
        [2, new BlockLayer(new Vector2( -7, 2), null, [new Vector2(6, 4)], true)],
        [2, new BlockLayer(new Vector2(-7, 3), null, [new Vector2(6, 5)], true)],
        [2, new BlockLayer(new Vector2(-7, 4), null, [new Vector2(6, 6)], true)],
        [2, new BlockLayer(new Vector2(-7, 5), null, [new Vector2(6, 7)], true)],
        [2, new BlockLayer(new Vector2( -8, 3), null, [new Vector2(5, 5)], true)],
        [2, new BlockLayer(new Vector2(-8, 4), null, [new Vector2(5, 6)], true)],
        [2, new BlockLayer(new Vector2(-8, 5), null, [new Vector2(5, 7)], true)],
        [2, new BlockLayer(new Vector2(-8, 6), null, [new Vector2(5, 8)], true)],
        [2, new BlockLayer(new Vector2( -9, 4), null, [new Vector2(4, 6)], true)],
        [2, new BlockLayer(new Vector2(-9, 5), null, [new Vector2(4, 7)], true)],
        [2, new BlockLayer(new Vector2(-9, 6), null, [new Vector2(4, 8)], true)],
        [2, new BlockLayer(new Vector2(-9, 7), null, [new Vector2(4, 9)], true)],
        [2, new BlockLayer(new Vector2(-9, 8), null, [new Vector2(4, 10)], true)],
        [2, new BlockLayer(new Vector2(-9, 9), null, [new Vector2(4, 11)], true)],
        [2, new BlockLayer(new Vector2(-9, 10), null, [new Vector2(4, 12)], true)],
        [2, new BlockLayer(new Vector2(-10, 6), null, [new Vector2(3, 8)], true)],
        [2, new BlockLayer(new Vector2(-10, 7), null, [new Vector2(3, 9)], true)],
        [2, new BlockLayer(new Vector2(-10, 8), null, [new Vector2(3, 10)], true)],
        [2, new BlockLayer(new Vector2(-10, 9), null, [new Vector2(3, 11)], true)],
        [2, new BlockLayer(new Vector2(-10, 10), null, [new Vector2(3, 12)])]
    ]), true));


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

TileGenerator.prototype.generateStructure = function(tileSystem, node, position, direction, bounds, structurePieces, metadata, overrideBounds){

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

                var cornerDirection = 0;
                var cornerType = false;

                if ((direction == 1 && node.orientation == 0) || (direction == 2 && node.orientation == 3)){
                    cornerDirection = 1;
                    if (direction == 2 && node.orientation == 3){
                        position.add(new Vector2(-11, 0));
                        bounds.x *= -1;
                        cornerType = true;
                    }else{
                        position.add(new Vector2(0, -1));
                    }
                }
                else if ((direction == 0 && node.orientation == 3) || (direction == 1 && node.orientation == 2)){
                    cornerDirection = 0;
                    if (direction == 1 && node.orientation == 2){
                        position.add(new Vector2(0, 11));
                        bounds.y *= -1;
                        cornerType = true;
                    }else{
                        position.add(new Vector2(-1, 0));
                    }
                }
                else if ((direction == 3 && node.orientation == 2) || (direction == 0 && node.orientation == 1)){
                    cornerDirection = 3;
                    if (direction == 0 && node.orientation == 1){
                        position.add(new Vector2(11, 0));
                        bounds.x *= -1;
                        cornerType = true;
                    }else{
                        position.add(new Vector2(0, 1));
                    }
                }
                else if ((direction == 2 && node.orientation == 1) || (direction == 3 && node.orientation == 0)){
                    cornerDirection = 2;
                    if (direction == 3 && node.orientation == 0){
                        position.add(new Vector2(0, -11));
                        bounds.y *= -1;
                        cornerType = true;
                    }else{
                        position.add(new Vector2(1, 0));
                    }
                }


                var checkPoint = directPosition(position, new Vector2(5, 5), cornerDirection).scale(this.tileSystem.tileSize);
                if (checkPoint) this.checkPoints.push(checkPoint);

                //special case for corner
                var offset = new Vector2(1, 1);
                calculateBounds(offset, node.orientation);


                this.generateStructure(this.tileSystem, node, position, cornerDirection, bounds, this.structurePieces, cornerType);
                direction = node.orientation;

                if (!cornerType) {
                    switch (cornerDirection) {
                        case 0:
                            position.add(new Vector2(-12, 10));
                            break;
                        case 1:
                            position.add(new Vector2(-10, -12));
                            break;
                        case 2:
                            position.add(new Vector2(12, -10));
                            break;
                        case 3:
                            position.add(new Vector2(10, 12));
                            break;
                    }
                }else{
                    switch (cornerDirection) {
                        case 0:
                            position.add(new Vector2(-1, 11));
                            break;
                        case 1:
                            position.add(new Vector2(-11, -1));
                            break;
                        case 2:
                            position.add(new Vector2(1, -11));
                            break;
                        case 3:
                            position.add(new Vector2(11, 1));
                            break;
                    }
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

TileGenerator.prototype.generateCorner = function(position, direction, type){

    var blocks = new HashMap();

    var innerBlockId = 10 + direction*2 + (type ? 1 : 0);


    blocks.set(new Vector2(0, 1), innerBlockId);
    blocks.set(new Vector2(0, 10), 18 + direction*2 + (type ? 1 : 0));

    for (var i = 2; i < 9; i++){
        for (var j = 0; j < 5; j++){

            var pos = new Vector2(j, i)

            blocks.set(pos, 2);
            blocks.set(pos.clone().swap(), 2);
        }
    }

    for (var x = 0; x < 2; x++){
        for (var y = 0; y < 2; y++){
            blocks.set(new Vector2(5+x, 5+y), 2);
        }
    }

    var startPosition = position.clone();
    if (type){
        switch (direction){
            case 0:
                startPosition.add(new Vector2(0, -1));
                break;
            case 1:
                startPosition.add(new Vector2(1, 0));
                break;
            case 2:
                startPosition.add(new Vector2(0, 1));
                break;
            case 3:
                startPosition.add(new Vector2(-1, 0));
                break;
        }
    }

    addStructureBlocks(this.tileSystem, startPosition, direction, blocks);
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
