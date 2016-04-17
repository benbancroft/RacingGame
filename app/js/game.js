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

    Sounds.load("assets/sounds/mouseclick");
    Sounds.load("assets/sounds/race_countdown_0");
    Sounds.load("assets/sounds/race_countdown_1");
    Sounds.load("assets/sounds/car_loop_0");
    Sounds.load("assets/sounds/car_loop_1");
    Sounds.load("assets/sounds/car_loop_2");
    Sounds.load("assets/sounds/car_loop_3");
    Sounds.load("assets/sounds/car_loop_4");
    Sounds.load("assets/sounds/car_loop_5");
    Sounds.load("assets/sounds/car_crash");

    Textures.load("assets/textures/tilesheet_p");
    Textures.load("assets/textures/arrow");

    Tracks.load("assets/tracks/1");
    Tracks.load("assets/tracks/2");

    this.numberPlayers = 0;
    this.running = false;

    this.gameState = 0;

    this.carFactory = new CarFactory();
    //this.maxCarStats = this.carFactory.getMaxStats();
    this.carIndex = 0;

    this.trackIndex = 0;
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

function createAI(startPositionPoints, level, carFactory, playSound){
    var count = 0;
    while (startPositionPoints.length > 0){

        var ai = new AICar(level, playSound);

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

        var trackIndex = Math.floor(Math.random() * this.availableTracks.length);

        this.setupGame(this.availableTracks[trackIndex].url, true, this.mainLevel);

        var tilesystem = this.mainLevel.tileSystem;
        var generator = tilesystem.generator;

        var scaleFactor = tilesystem.tileSize;
        var minPoint = generator.minPosition.clone().scale(scaleFactor);
        var maxPoint = generator.maxPosition.clone().scale(scaleFactor);


        var levelDimensions = maxPoint.clone().sub(minPoint).applyAspectRatio(resolution);

        var levelCentre = minPoint.midPoint(maxPoint).reverse().add(levelDimensions);

        this.mainViewport = this.registerViewport(new Viewport(this.mainLevel, 0, 0, resolution.x, resolution.y, levelCentre.x, levelCentre.y, levelDimensions.x, levelDimensions.y));


        var startPositionPoints = generator.startPositions.keys();

        this.numberPlayers = createAI(startPositionPoints, this.mainLevel, this.carFactory, false);
    }

    //GUI

    var self = this;

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(400, 400)));

    this.registerGuiComponent(new Widget(this, resolution.clone().divScalar(2), function(renderer, position){
        renderer.setTextAlign(TextAlign.CENTRE);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        renderer.setFont("Arial", 32);

        renderer.drawText("Torque Triumph", position.clone().sub(new Vector2(0, 155)));

        renderer.setFont("Arial", 20);
        renderer.drawText("By Ben Bancroft", position.clone().sub(new Vector2(0, 130)));
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 75)), new Vector2(150, 40), "Single Player", function(){
        self.optionsScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 25)), new Vector2(150, 40), "Multi Player", function(){

    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 25)), new Vector2(150, 40), "Hiscores", function(){
        self.hiscoreScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 75)), new Vector2(150, 40), "About", function(){
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 125)), new Vector2(150, 40), "Unit Tests", function(){
        Engine.openLink("test.html");
    }));
};

Game.prototype.optionsScreen = function(){

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

    //Car

    this.registerGuiComponent(new CarWidget (this, resolution.clone().divScalar(2).sub(new Vector2(155, 152)), function(){
        self.carIndex = wrapIndex(self.carIndex-1, self.carFactory.carStats.size);
    }, function(){
        self.carIndex = wrapIndex(self.carIndex+1, self.carFactory.carStats.size);
    }, function (){
        return self.carFactory.carStats.get(self.carIndex);
    }, self.carFactory.getMaxStats()));

    //Track

    this.registerGuiComponent(new TrackWidget (this, resolution.clone().divScalar(2).sub(new Vector2(13, 207)), function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex-1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }, function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex+1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }));
};

Game.prototype.hiscoreScreen = function(){
    this.gameState = 4;
    this.unregisterGuiComponents();

    var self = this;
    var resolution = this.getResolution();

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(1100, 630)));


    this.registerGuiComponent(new TrackWidget (this, resolution.clone().divScalar(2).sub(new Vector2(-250, 187)), function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex-1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }, function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex+1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(434, -255)), new Vector2(150, 40), "Back", function(){
        self.startScreen(false);
    }));


    this.registerGuiComponent(new Widget(this, resolution.clone().divScalar(2).sub(new Vector2(165, 265)), function(renderer, position){
        var hiscores = self.getHiscores(self.currentTrack.url);

        renderer.setTextAlign(TextAlign.CENTRE);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        renderer.setFont("Arial", 25);

        var textPosition = position.clone();

        renderer.drawText("Hiscores", textPosition);

        var entries = hiscores.length;
        if (entries > 10) entries = 10;

        textPosition.add(new Vector2(0, 50));

        renderer.drawText("Name", textPosition.clone().sub(new Vector2(300, 0)));
        renderer.drawText("Time", textPosition.clone().sub(new Vector2(100, 0)));
        renderer.drawText("Position", textPosition.clone().add(new Vector2(100, 0)));
        renderer.drawText("Car", textPosition.clone().add(new Vector2(300, 0)));

        renderer.setFont("Arial", 20);

        textPosition.add(new Vector2(0, 40));

        for (var i = 0; i < entries; i++){
            var entry = hiscores[i];

            renderer.drawText(entry.name, textPosition.clone().sub(new Vector2(300, 0)));
            renderer.drawText(getTimeString(entry.time), textPosition.clone().sub(new Vector2(100, 0)));
            renderer.drawText(entry.position, textPosition.clone().add(new Vector2(100, 0)));
            renderer.drawText(self.carFactory.carStats.get(entry.carUrl).name, textPosition.clone().add(new Vector2(300, 0)));

            textPosition.add(new Vector2(0, 40));
        }
    }));

};

Game.prototype.finishScreen = function (time, position) {
    var resolution = this.getResolution();

    this.unregisterGuiComponents();

    var self = this;

    this.nameInput = new InputWidget(this, resolution.clone().divScalar(2).add(new Vector2(-100, 75)), new Vector2(200, 20), 15);
    this.registerGuiComponent(this.nameInput);

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 150)), new Vector2(200, 40), "Back to Start Screen", function(){
        var name = self.nameInput.getValue();

        self.addHiscore(self.currentTrack.url, name, time, position, self.carIndex);

        self.startScreen(true);
    }));
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

    renderer.drawText(finishMessage, resolution.clone().divScalar(2).sub(new Vector2(0, 150)));

    renderer.setFont("Arial", 16);

    renderer.drawText("You completed the track in:", resolution.clone().divScalar(2).sub(new Vector2(0, 70)));
    renderer.drawText(getTimeString(Math.floor(this.gameTicks/60)), resolution.clone().divScalar(2).sub(new Vector2(0, 20)));
    renderer.drawText("Please enter your name below to add a new hiscore entry.", resolution.clone().divScalar(2).add(new Vector2(0, 30)));



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

    this.numberPlayers += createAI(startPositionPoints, this.mainLevel, this.carFactory, true);

    this.player.addViewportTrack(this.mainViewport);
};

Game.prototype.tick = function(){

    if (this.gameState == 2){
        this.gameTicks++;

        var lastSecond = this.secondsTillStart;

        this.secondsTillStart = 5 - Math.floor(this.gameTicks / 60.0);

        if (!this.running && lastSecond > this.secondsTillStart){
            if (this.secondsTillStart <= 0) this.playSound("assets/sounds/race_countdown_1");
            else this.playSound("assets/sounds/race_countdown_0");
        }

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

    if (this.gameState == 2 && this.secondsTillStart >= -1){
        var resolution = this.getResolution();

        this.setTextAlign(TextAlign.CENTRE);
        this.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        this.setFont("Arial", 32);

        var startMessage = "Game starting in " + this.secondsTillStart + "."

        if (this.secondsTillStart < 1) startMessage = "Go!";

        this.drawText(startMessage, resolution.clone().divScalar(2).sub(new Vector2(0, 150)));
    }
    else if (this.gameState == 3) this.drawFinishMenu(this);

    Engine.prototype.renderGui.call(this);

};

Game.prototype.render = function(){
    Engine.prototype.render.call(this);
};