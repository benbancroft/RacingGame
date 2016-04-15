function Game() {
    Engine.call(this);

    Sprites.load("assets/sprites/police");
    Sprites.load("assets/sprites/sports");
    Sprites.load("assets/sprites/muscle");
    Sprites.load("assets/sprites/taxi");
    Sprites.load("assets/sprites/truck");
    Sprites.load("assets/sprites/mini_van");
    Sprites.load("assets/sprites/mini_truck");
    Sprites.load("assets/sprites/ambulance");
    Sprites.load("assets/sprites/sports2");

    Textures.load("assets/textures/tilesheet_p");

    Textures.load("assets/textures/arrow");

    Tracks.load("assets/tracks/1");
    Tracks.load("assets/tracks/2");

    this.numberPlayers = 0;
    this.running = false;

    this.gameState = 0;

    this.carFactory = new CarFactory();
    this.maxCarStats = this.carFactory.getMaxStats();
    this.carIndex = 0;

    this.trackIndex = 1;
    this.currentTrack = null;
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

    position += this.playersComplete;

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

    this.mainLevel = new Level(this);
    this.registerLevel(this.mainLevel);

    this.previewLevel = new Level(this);
    this.registerLevel(this.previewLevel);

    this.availableTracks = Tracks.getAll();

    //start screen

    this.startScreen(true);



};

Game.prototype.loadTrackPreview = function(trackPosition){
    this.currentTrack = this.availableTracks[this.trackIndex];

    this.setupGame(this.currentTrack.url, true, this.previewLevel);

    var tilesystem = this.previewLevel.tileSystem;
    var generator = tilesystem.generator;

    var scaleFactor = tilesystem.tileSize;
    var minPoint = generator.minPosition.clone().sub(new Vector2(10, 10)).scale(scaleFactor);
    var maxPoint = generator.maxPosition.clone().add(new Vector2(10, 10)).scale(scaleFactor);

    var trackDimensions = new Vector2(256, 256);
    var levelDimensions = maxPoint.clone().sub(minPoint).applyAspectRatio(trackDimensions);

    var levelCentre = minPoint.midPoint(maxPoint).reverse().add(levelDimensions);

    this.racetrackPreviewViewport = new Viewport(this.previewLevel, trackPosition.x, trackPosition.y, trackDimensions.x, trackDimensions.y, levelCentre.x, levelCentre.y, levelDimensions.x, levelDimensions.y);
};

function createAI(startPositionPoints, level, carFactory){
    var count = 0;
    while (startPositionPoints.length > 0){

        var ai = new AICar(level);

        setEntitySpawnPosition(startPositionPoints, ai);

        carFactory.createRandomCar(ai);

        count++;
    }

    return count
}

Game.prototype.startScreen = function(loadTileSystem){
    //this.startGame();

    this.running = false;
    this.gameState = 0;

    var resolution = this.getResolution();

    this.unregisterGuiComponents();

    if (loadTileSystem){
        this.setupGame("assets/tracks/2", true, this.mainLevel);

        var tilesystem = this.mainLevel.tileSystem;
        var generator = tilesystem.generator;

        var scaleFactor = tilesystem.tileSize;
        var minPoint = generator.minPosition.clone().scale(scaleFactor);
        var maxPoint = generator.maxPosition.clone().scale(scaleFactor);


        var levelDimensions = maxPoint.clone().sub(minPoint).applyAspectRatio(resolution);

        var levelCentre = minPoint.midPoint(maxPoint).reverse().add(levelDimensions);

        this.mainViewport = this.registerViewport(new Viewport(this.mainLevel, 0, 0, resolution.x, resolution.y, levelCentre.x, levelCentre.y, levelDimensions.x, levelDimensions.y));


        var startPositionPoints = generator.startPositions.keys();

        this.numberPlayers = createAI(startPositionPoints, this.mainLevel, this.carFactory);
    }

    //GUI

    var self = this;

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(400, 400)));

    this.registerGuiComponent(new Widget(this, resolution.clone().divScalar(2), function(renderer, position){
        renderer.setTextAlign(TextAlign.CENTRE);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        renderer.setFont("Arial", 32);

        renderer.drawText("Torque Triumph", position.clone().sub(new Vector2(0, 130)));

        renderer.setFont("Arial", 20);
        renderer.drawText("By Ben Bancroft", position.clone().sub(new Vector2(0, 105)));
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 50)), new Vector2(150, 40), "Single Player", function(){
        self.optionsScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2), new Vector2(150, 40), "Multi Player", function(){

    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 50)), new Vector2(150, 40), "Hiscores", function(){

    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 100)), new Vector2(150, 40), "About", function(){

    }));
};

Game.prototype.optionsScreen = function(){

    this.running = false;
    this.gameState = 1;

    this.unregisterGuiComponents();

    var resolution = this.getResolution();

    //GUI

    var self = this;

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(580, 495)));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(180, -200)), new Vector2(150, 40), "Back", function(){
        self.startScreen(false);
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(180, 200)), new Vector2(150, 40), "Start Game", function(){
        self.startGame();
    }));

    //car

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(224, -127)), new Vector2(40, 40), "\u25C4", function(){
        self.carIndex = wrapIndex(self.carIndex-1, self.carFactory.carStats.size);
    }, new Vector4(0.6,0.6,0.6,1.0)));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(84, -127)), new Vector2(40, 40), "\u25BA", function(){
        self.carIndex = wrapIndex(self.carIndex+1, self.carFactory.carStats.size);
    }, new Vector4(0.6,0.6,0.6,1.0)));

    //level

    var trackPosition = resolution.clone().divScalar(2).sub(new Vector2(13, 207));

    this.loadTrackPreview(trackPosition);

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(120, 127)), new Vector2(40, 40), "\u25C4", function(){
        self.trackIndex = wrapIndex(self.trackIndex-1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }, new Vector4(0.6,0.6,0.6,1.0)));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(200, 127)), new Vector2(40, 40), "\u25BA", function(){
        self.trackIndex = wrapIndex(self.trackIndex+1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }, new Vector4(0.6,0.6,0.6,1.0)));
};

Game.prototype.finishScreen = function () {
    var resolution = this.getResolution();

    this.unregisterGuiComponents();

    var self = this;
    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 100)), new Vector2(200, 40), "Back to Start Screen", function(){
        self.startScreen(true);
    }));
};

function drawPercentageBar(renderer, position, percentage, length, thickness){
    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setUseColour(true);
    renderer.setRotation(0, true);

    renderer.setColour(new Vector4(1,1,1,1));
    renderer.setCentre(new Vector2(0,0));
    renderer.setDimensions(new Vector2(percentage*length, thickness), false);
    renderer.draw(position);

    renderer.setColour(new Vector4(0.6,0.6,0.6,1));
    renderer.setCentre(new Vector2(0,0));
    renderer.setDimensions(new Vector2((1-percentage)*length, thickness), false);
    renderer.draw(position.clone().add(new Vector2(percentage*length, 0)));
};

Game.prototype.drawMainMenu = function(renderer){
    var resolution = this.getResolution();

    /*var dimensions = new Vector2(400, 400);


    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(new Vector4(0.2, 0.2, 0.2, 0.6));

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(dimensions.clone().divScalar(2));
    renderer.setDimensions(dimensions, false);

    renderer.draw(resolution.clone().divScalar(2));*/



};

Game.prototype.drawOptionsMenu = function(renderer){
    var resolution = this.getResolution();

    /*var dimensions = new Vector2(580, 495);

    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(new Vector4(0.2, 0.2, 0.2, 0.6));

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(dimensions.clone().divScalar(2));
    renderer.setDimensions(dimensions, false);

    renderer.draw(resolution.clone().divScalar(2));*/

    //draw car

    var carBoxDimensions = new Vector2(200, 375);
    var carPosition = resolution.clone().divScalar(2).sub(new Vector2(155, 152));

    renderer.setColour(new Vector4(0.8, 0.8, 0.8, 1.0));
    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(new Vector2(carBoxDimensions.x/2, 0));
    renderer.setDimensions(carBoxDimensions, false);

    renderer.draw(carPosition.clone().sub(new Vector2(0, 64)));

    renderer.setUseColour(false);
    renderer.setDimensions(new Vector2(128, 128));
    renderer.setRotation(Math.PI/2, true);

    renderer.setUseSprite(this.carFactory.carStats.get(this.carIndex).spriteSheetUrl, 0);

    renderer.draw(carPosition);

    //parameters

    var massParameterPosition = resolution.clone().divScalar(2).sub(new Vector2(244, 37.5));
    drawPercentageBar(renderer, massParameterPosition, this.carFactory.carStats.get(this.carIndex).mass / this.maxCarStats.mass, 180, 3);

    var speedParameterPosition = massParameterPosition.clone().add(new Vector2(0, 40));
    drawPercentageBar(renderer, speedParameterPosition, this.carFactory.carStats.get(this.carIndex).maxSpeed / this.maxCarStats.maxSpeed, 180, 3);

    var handlingParameterPosition = speedParameterPosition.clone().add(new Vector2(0, 40));
    drawPercentageBar(renderer, handlingParameterPosition, this.carFactory.carStats.get(this.carIndex).turnSpeed / this.maxCarStats.turnSpeed, 180, 3);

    var accelerationParameterPosition = handlingParameterPosition.clone().add(new Vector2(0, 40));
    drawPercentageBar(renderer, accelerationParameterPosition, this.carFactory.carStats.get(this.carIndex).acceleration / this.maxCarStats.acceleration, 180, 3);

    //draw track

    var trackBoxDimensions = new Vector2(280, 375);
    var trackPosition = resolution.clone().divScalar(2).add(new Vector2(115, -29));

    renderer.setColour(new Vector4(0.8, 0.8, 0.8, 1.0));
    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(trackBoxDimensions.clone().divScalar(2));
    renderer.setDimensions(trackBoxDimensions, false);

    renderer.draw(trackPosition);

    this.racetrackPreviewViewport.render(renderer);

    //text

    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setFont("Arial", 18);

    renderer.drawText(this.carFactory.carStats.get(this.carIndex).name, carPosition.add(new Vector2(0,70)));

    renderer.drawText(this.currentTrack.contents.name, trackPosition.add(new Vector2(0,95)));

    renderer.setFont("Arial", 16);

    renderer.drawText(this.currentTrack.contents.laps + " Laps", trackPosition.add(new Vector2(0,20)));

    renderer.setTextAlign(TextAlign.LEFT);

    renderer.drawText("Mass", massParameterPosition.sub(new Vector2(0, 15)));
    renderer.drawText("Max Speed", speedParameterPosition.sub(new Vector2(0, 15)));
    renderer.drawText("Handling", handlingParameterPosition.sub(new Vector2(0, 15)));
    renderer.drawText("Acceleration", accelerationParameterPosition.sub(new Vector2(0, 15)));

    //renderer.drawText("Options", resolution.clone().divScalar(2).sub(new Vector2(0, 130)));

};

Game.prototype.drawFinishMenu = function(renderer){
    var resolution = this.getResolution();
    var resolution = this.getResolution();

    var dimensions = new Vector2(500, 500);


    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(new Vector4(0.2, 0.2, 0.2, 0.6));

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(dimensions.clone().divScalar(2));
    renderer.setDimensions(dimensions, false);

    renderer.draw(resolution.clone().divScalar(2));

    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
    renderer.setFont("Arial", 32);

    var finishMessage = "You came " + getOrdinalString(this.finalPlace) + " place."

    if (this.finalPlace == 1) finishMessage = "You Won! Congratulations."

    renderer.drawText(finishMessage, resolution.clone().divScalar(2).sub(new Vector2(0, 130)));

    renderer.setFont("Arial", 16);

    renderer.drawText("You completed the track in:", resolution.clone().divScalar(2).sub(new Vector2(0, 50)));
    renderer.drawText(getTimeString(Math.floor(this.gameTicks/60)), resolution.clone().divScalar(2));


};

Game.prototype.setupGame = function(trackUrl, tickOnce, level){

    level.removeEntities();
    level.removeRenderables();
    level.unregisterViewports();

    var tilesystem = new TileSystem(level, "assets/textures/tilesheet_p", 32.0, 10, tickOnce)
    var generator = new TileGenerator(tilesystem, trackUrl);
    tilesystem.setGenerator(generator);

    level.setTileSystem(tilesystem);
};

Game.prototype.startGame = function(){

    this.unregisterGuiComponents();

    this.gameState = 2;

    this.running = false;
    this.numberPlayers = 0;
    this.playersComplete = 0;
    this.secondsTillStart = 0;

    this.gameTicks = 0;

    this.setupGame(this.currentTrack.url, false, this.mainLevel);

    var resolution = this.getResolution();

    this.mainViewport = this.registerViewport(new PlayerViewport(this, this.mainLevel, 0, 0, resolution.x, resolution.y, resolution.x/2, resolution.y/2, resolution.x, resolution.y));

    this.numberPlayers = 0;

    this.player = new PlayerCar(this.mainLevel);
    this.carFactory.createCar(this.carIndex, this.player);
    this.player.direction = Math.PI/2;

    var startPositionPoints = this.mainLevel.tileSystem.generator.startPositions.keys();

    if (startPositionPoints.length > 0){
        setEntitySpawnPosition(startPositionPoints, this.player);
        this.numberPlayers++;
    }

    this.numberPlayers += createAI(startPositionPoints, this.mainLevel, this.carFactory);

    this.player.addViewportTrack(this.mainViewport);
};

Game.prototype.tick = function(){

    if (this.gameState == 2){
        this.gameTicks++;

        this.secondsTillStart = 5 - Math.floor(this.gameTicks / 60.0);

        if (this.secondsTillStart <= 0){
            this.running = true;
        }
    }

    Engine.prototype.tick.call(this);
};

Game.prototype.animate = function(time){
    //Engine.log(this.lastTime);
    Engine.prototype.animate.call(this, time);
};

Game.prototype.renderGui = function(){

    Engine.prototype.renderGui.call(this);

    if (this.gameState == 1) this.drawOptionsMenu(this);
    else if (this.gameState == 2 && this.secondsTillStart >= -1){
        var resolution = this.getResolution();

        this.setTextAlign(TextAlign.CENTRE);
        this.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        this.setFont("Arial", 32);

        var startMessage = "Game starting in " + this.secondsTillStart + "."

        if (this.secondsTillStart < 1) startMessage = "Go!";

        this.drawText(startMessage, resolution.clone().divScalar(2).sub(new Vector2(0, 150)));
    }
    else if (this.gameState == 3) this.drawFinishMenu(this);

};

Game.prototype.render = function(){
    Engine.prototype.render.call(this);
};