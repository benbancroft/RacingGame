function Game() {
    Engine.call(this);

    Sprites.load("assets/sprites/police");

    Textures.load("assets/textures/tilesheet_p");

    Textures.load("assets/textures/arrow");

    Tracks.load("assets/tracks/1");

    this.numberPlayers = 0;
    this.running = false;

    this.gameState = 0;
};

Game.prototype = Object.create(Engine.prototype);
Game.prototype.constructor = Game;

function setEntitySpawnPosition(positions, entity){
    var index = Math.floor(Math.random() * positions.length);

    entity.setPosition(positions[index])
    entity.direction = Math.PI/2;

    positions.splice(index, 1);
}

Game.prototype.calculatePosition = function(target){
    var position = 1;

    for (var i = 0; i < this.mainLevel.entities.length; i++) {
        var entity = this.mainLevel.entities[i];
        if (entity == target) continue;

        if (entity.currentLap > target.currentLap
            || (entity.currentLap == target.currentLap && entity.checkPointIndex > target.checkPointIndex)
            || (entity.currentLap == target.currentLap && entity.checkPointIndex == target.checkPointIndex && entity.getDistanceToCheckpoint(this) <= target.getDistanceToCheckpoint(this))) position++;

    }

    return position;
}

Game.prototype.loaded = function () {

    //start screen

    this.startScreen();



};

Game.prototype.startScreen = function(){
    //this.startGame();

    this.running = false;
    this.gameState = 0;

    var resolution = this.getResolution();

    this.setupGame("assets/tracks/1");

    var scaleFactor = this.tilesystem.tileSize;
    var minPoint = this.generator.minPosition.clone().scale(scaleFactor);
    var maxPoint = this.generator.maxPosition.clone().scale(scaleFactor);


    var levelDimensions = maxPoint.clone().sub(minPoint).applyAspectRatio(resolution);

    var levelCentre = minPoint.midPoint(maxPoint).reverse().add(levelDimensions);

    this.mainViewport = this.registerViewport(new Viewport(this.mainLevel, 0, 0, resolution.x, resolution.y, levelCentre.x, levelCentre.y, levelDimensions.x, levelDimensions.y));


    var startPositionPoints = this.generator.startPositions.keys();

    while (startPositionPoints.length > 0){

        var ai = new AICar(this.mainLevel);

        setEntitySpawnPosition(startPositionPoints, ai);

        this.numberPlayers++;
    }

    //GUI

    var self = this;

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 50)), new Vector2(150, 40), "Single Player", function(){
        self.startGame();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2), new Vector2(150, 40), "Multi Player", function(){

    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 50)), new Vector2(150, 40), "Hiscores", function(){

    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 100)), new Vector2(150, 40), "About", function(){

    }));
};

Game.prototype.drawMainMenu = function(renderer){
    var resolution = this.getResolution();

    var dimensions = new Vector2(400, 400);


    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(new Vector4(0.2, 0.2, 0.2, 0.4));

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(dimensions.clone().divScalar(2));
    renderer.setDimensions(dimensions, false);

    renderer.draw(resolution.clone().divScalar(2));

    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
    renderer.setFont("Arial", 32);

    renderer.drawText("Torque Triumph", resolution.clone().divScalar(2).sub(new Vector2(0, 130)));

    renderer.setFont("Arial", 20);
    renderer.drawText("By Ben Bancroft", resolution.clone().divScalar(2).sub(new Vector2(0, 105)));

};

Game.prototype.setupGame = function(trackUrl){

    this.unregisterGuiComponents();
    this.unregisterLevels();
    this.unregisterViewports();

    var resolution = this.getResolution();

    this.mainLevel = new Level(this, resolution.x, resolution.y);

    this.tilesystem = new TileSystem(this.mainLevel, "assets/textures/tilesheet_p", 32.0, 10)
    this.generator = new TileGenerator(this.tilesystem, trackUrl);
    this.tilesystem.setGenerator(this.generator);



    this.mainLevel.setTileSystem(this.tilesystem);

    this.registerLevel(this.mainLevel);
};

Game.prototype.startGame = function(){

    this.gameState = 2;

    this.running = true;
    this.numberPlayers = 0;

    this.setupGame("assets/tracks/1");

    var resolution = this.getResolution();

    this.mainViewport = this.registerViewport(new PlayerViewport(this, this.mainLevel, 0, 0, resolution.x, resolution.y, resolution.x/2, resolution.y/2, resolution.x, resolution.y));

    this.numberPlayers = 0;

    this.player = new PlayerCar(this.mainLevel);
    this.player.direction = Math.PI/2;

    var startPositionPoints = this.generator.startPositions.keys();

    if (startPositionPoints.length > 0){
        setEntitySpawnPosition(startPositionPoints, this.player);
        this.numberPlayers++;
    }

    while (startPositionPoints.length > 0){

        var ai = new AICar(this.mainLevel);

        setEntitySpawnPosition(startPositionPoints, ai);

        this.numberPlayers++;
    }

    this.player.addViewportTrack(this.mainViewport);
};

Game.prototype.animate = function(time){
    //Engine.log(this.lastTime);
    Engine.prototype.animate.call(this, time);
};

Game.prototype.renderGui = function(){

    if (this.gameState == 0) this.drawMainMenu(this);

    Engine.prototype.renderGui.call(this);
};

Game.prototype.render = function(){
    Engine.prototype.render.call(this);
};