function Game() {
    Engine.call(this);

    Sprites.load("assets/sprites/police");

    Textures.load("assets/textures/tilesheet_p");

    Tracks.load("assets/tracks/1");
};

Game.prototype = Object.create(Engine.prototype);
Game.prototype.constructor = Game;

Game.prototype.loaded = function () {
    var resolution = this.getResolution();

    this.mainLevel = new Level(resolution.x, resolution.y);

    this.tilesystem = new TileSystem(this.mainLevel, "assets/textures/tilesheet_p", 32.0, 10)
    this.generator = new TileGenerator(this.tilesystem, "assets/tracks/1");
    this.tilesystem.setGenerator(this.generator);

    var tileSelectFunc = function(startPos, tileSystem, worldPos){
        var tileOffset = worldPos.clone().wrap(16).abs();

        //if (worldPos.lessThan(new Vector2(0))) tileOffset = new Vector2(15, 15).sub(tileOffset);

        return startPos.clone().add(tileOffset);
    };

    //Grass

    var grassFunc = curry(tileSelectFunc, new Vector2(0,16))
    var grassLayer = new BlockLayer(TilePosition.Centre, grassFunc);

    this.tilesystem.registerBlockType(1, new Block([
        [0, grassLayer]
    ], true));

    //Asphalt
    var asphaltFunc = curry(tileSelectFunc, new Vector2(16,16));
    var asphaltLayer = new BlockLayer(TilePosition.Centre, asphaltFunc);

    this.tilesystem.registerBlockType(2, new Block([
        [0, asphaltLayer]
    ], true));

    //Wall Red Whole

    this.tilesystem.registerBlockType(3, new Block([
        [0, new BlockLayer(TilePosition.Centre, null, [new Vector2(0, 0)])]
    ], true));

    //Wall White Whole

    this.tilesystem.registerBlockType(4, new Block([
        [0, new BlockLayer(TilePosition.Centre, null, [new Vector2(1, 0)])]
    ], true));

    //Straight arrow left-right

    this.tilesystem.registerBlockType(5, new Block([
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

    this.tilesystem.registerBlockType(6, new Block([
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

    this.tilesystem.registerBlockType(7, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(3, 3)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(4, 3)])],
    ], true));

    //Start line up-down

    this.tilesystem.registerBlockType(8, new Block([
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

    this.tilesystem.registerBlockType(9, new Block([
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

    this.tilesystem.registerBlockType(10, new Block([
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

    this.tilesystem.registerBlockType(11, new Block([
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

    this.tilesystem.registerBlockType(12, new Block([
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

    this.tilesystem.registerBlockType(13, new Block([
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



    this.mainLevel.setTileSystem(this.tilesystem);

    this.registerLevel(this.mainLevel);

    this.mainViewport = this.registerViewport(new Viewport(this.mainLevel, 0, 0, resolution.x, resolution.y, resolution.x/2, resolution.y/2, resolution.x, resolution.y));

    var ai = new AICar(this.mainLevel);

    this.player = new PlayerCar(this.mainLevel);
    this.player.direction = Math.PI/2;

    this.generator.startPositions.forEach(function(position){
        ai.setPosition(position.key)
        ai.direction = Math.PI/2;
    });

    this.player.setPosition(new Vector2(ai.x-200, ai.y));


    //this.player.x = resolution.x/2;
    //this.player.y = resolution.y/2;

    /*this.aiTest = new AICar(this.mainLevel);
     this.aiTest.x = resolution.x/2;
     this.aiTest.y = resolution.y/2;

     this.coldebug1 = new coldebug(this.mainLevel);
     this.coldebug1.x = resolution.x/4;
     this.coldebug1.y = resolution.y/4;
     this.coldebug1.direction = Math.PI/4;

     this.coldebug2 = new coldebug(this.mainLevel);
     this.coldebug2.x = this.coldebug1.x + this.coldebug1.width;
     this.coldebug2.y = this.coldebug1.y + this.coldebug1.height/2;
     this.coldebug2.direction = Math.PI/2;
     this.coldebug2.angularVelocity = Math.PI/1000;


     this.coldebug3 = new coldebug(this.mainLevel);
     this.coldebug3.x = 3*resolution.x/4;
     this.coldebug3.y = 3*resolution.y/4;
     this.coldebug3.direction = Math.PI;
     this.coldebug3.angularVelocity = Math.PI/1000;

     this.coldebug4 = new coldebug(this.mainLevel);
     this.coldebug4.x = this.coldebug3.x;
     this.coldebug4.y = this.coldebug3.y + this.coldebug1.height;
     this.coldebug4.direction = Math.PI;
     this.coldebug4.angularVelocity = Math.PI/1000;
     //this.coldebug2.direction = Math.PI/4;*/

    this.coldebug5 = new coldebug(this.mainLevel);
    //this.coldebug5.x = resolution.x;
    //this.coldebug5.y = 20;
    this.coldebug5.x = resolution.x/4;
    this.coldebug5.y = resolution.y/4;
    //this.coldebug5.directTowards(new Vector2(resolution.x/2, resolution.y/2));
    this.player.addViewportTrack(this.mainViewport);

    /*this.coldebug6 = new coldebug(this.mainLevel);
     this.coldebug6.directTowards(new Vector2(resolution.x/2, resolution.y/2));*/

    /*for (var i = 0; i < 15; i++) {
     var car = new Car(this.mainLevel);
     car.x = Engine.random(0, this.mainLevel.width);
     car.y = Engine.random(0, this.mainLevel.height);
     }*/
};

Game.prototype.animate = function(time){
    //Engine.log(this.lastTime);
    Engine.prototype.animate.call(this, time);
};