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
        var tileOffset = worldPos.clone().mod(16).abs();

        if (worldPos.lessThan(new Vector2(0))) tileOffset = new Vector2(15, 15).sub(tileOffset);

        return startPos.clone().add(tileOffset);
    };

    //Grass

    var grassLayer = new BlockLayer(TilePosition.Centre, curry(tileSelectFunc, new Vector2(0,16)));

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

    //Start line up-down

    this.tilesystem.registerBlockType(6, new Block([
        [0, new BlockLayer(TilePosition.Centre, asphaltFunc)],
        [0, new BlockLayer(TilePosition.Right, asphaltFunc)],
        [1, new BlockLayer(TilePosition.Centre, null, [new Vector2(3, 3)])],
        [1, new BlockLayer(TilePosition.Right, null, [new Vector2(4, 3)])],
    ], true));

    this.tilesystem.registerBlockType(7, new Block([
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



    this.mainLevel.setTileSystem(this.tilesystem);

    this.registerLevel(this.mainLevel);

    this.mainViewport = this.registerViewport(new Viewport(this.mainLevel, 0, 0, resolution.x, resolution.y, resolution.x/2, resolution.y/2, resolution.x, resolution.y));

    this.player = new PlayerCar(this.mainLevel);
    this.player.x = resolution.x/2;
    this.player.y = resolution.y/2;

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