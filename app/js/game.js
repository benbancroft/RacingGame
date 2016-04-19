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
    Textures.load("assets/textures/mouse");
    Textures.load("assets/textures/wasd_keys");
    Textures.load("assets/textures/arrow_keys");
    Textures.load("assets/textures/escape_key");

    Tracks.load("assets/tracks/1");
    Tracks.load("assets/tracks/2");

    this.numberPlayers = 0;
    this.running = false;

    this.multiplayer = false;

    this.gameState = 0;

    this.carFactory = new CarFactory();
    //this.maxCarStats = this.carFactory.getMaxStats();
    this.carIndex = 0;
    this.secondCarIndex = 0;

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
        self.multiplayer = false;
        self.optionsScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 25)), new Vector2(150, 40), "Multi Player", function(){
        self.multiplayer = true;
        self.optionsScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 25)), new Vector2(150, 40), "Hiscores", function(){
        self.hiscoreScreen();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 75)), new Vector2(150, 40), "About", function(){
        Engine.openLink("about.html");
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 125)), new Vector2(150, 40), "Unit Tests", function(){
        Engine.openLink("test.html");
    }));
};

Game.prototype.optionsScreen = function() {

    this.gameState = 1;

    this.unregisterGuiComponents();

    var resolution = this.getResolution();

    //GUI

    var self = this;

    var dimensions = new Vector2(580, 495);
    if (this.multiplayer) dimensions.add(new Vector2(232, 0));

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), dimensions));

    var backButtonPos = resolution.clone().divScalar(2).sub(new Vector2(180, -200))
    if (this.multiplayer) backButtonPos.sub(new Vector2(116, 0));

    this.registerGuiComponent(new Button(this, backButtonPos, new Vector2(150, 40), "Back", function () {
        self.startScreen(false);
    }));

    var startButtonPos = resolution.clone().divScalar(2).add(new Vector2(180, 200))
    if (this.multiplayer) startButtonPos.add(new Vector2(116, 0));

    this.registerGuiComponent(new Button(this, startButtonPos, new Vector2(150, 40), "Start Game", function () {
        self.howToPlayScreen();
    }));

    //Car
    var secondCarPosition = resolution.clone().divScalar(2).sub(new Vector2(155, 152));

    var carPosition = resolution.clone().divScalar(2).sub(new Vector2(271, 152));
    if (!this.multiplayer) carPosition = secondCarPosition;

    this.registerGuiComponent(new CarWidget(this, carPosition, function () {
        self.carIndex = wrapIndex(self.carIndex - 1, self.carFactory.carStats.size);
    }, function () {
        self.carIndex = wrapIndex(self.carIndex + 1, self.carFactory.carStats.size);
    }, function () {
        return self.carFactory.carStats.get(self.carIndex);
    }, self.carFactory.getMaxStats()));

    if (this.multiplayer){
        secondCarPosition.add(new Vector2(116, 0));

        this.registerGuiComponent(new CarWidget(this, secondCarPosition, function () {
            self.secondCarIndex = wrapIndex(self.secondCarIndex - 1, self.carFactory.carStats.size);
        }, function () {
            self.secondCarIndex = wrapIndex(self.secondCarIndex + 1, self.carFactory.carStats.size);
        }, function () {
            return self.carFactory.carStats.get(self.secondCarIndex);
        }, self.carFactory.getMaxStats()));
    }

    //Track

    var trackPosition = resolution.clone().divScalar(2).sub(new Vector2(13, 207));
    if (this.multiplayer) trackPosition.add(new Vector2(116, 0));

    this.registerGuiComponent(new TrackWidget (this, trackPosition, function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex-1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }, function(trackPosition){
        self.trackIndex = wrapIndex(self.trackIndex+1, self.availableTracks.length);
        self.loadTrackPreview(trackPosition);
        self.previewLevel.registerViewport(self.racetrackPreviewViewport);
    }));
};

Game.prototype.howToPlayScreen = function(){
    this.unregisterGuiComponents();

    var resolution = this.getResolution();

    var self = this;

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(516, 495)));

    this.registerGuiComponent(new Widget(this, resolution.clone().divScalar(2).sub(new Vector2(0, 220)), function(renderer, position){
        renderer.setTextAlign(TextAlign.CENTRE);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        renderer.setFont("Arial", 25);

        var textPosition = position.clone();

        renderer.drawText("How to Play", textPosition);

        renderer.drawText("Steering", position.clone().add(new Vector2(0, 180)));

        renderer.drawText("Pause Menu", position.clone().add(new Vector2(0, 300)));

        renderer.setFont("Arial", 20);

        renderer.setUseColour(false, false, true);
        renderer.setUseColourBlending(false, false);
        renderer.setTexture("assets/textures/wasd_keys", false, true);
        renderer.setUVs(new Vector2(0, 0), new Vector2(128, 64), false, true);
        renderer.setRotation(0, true);
        renderer.setCentre(new Vector2(64, 32));
        renderer.setDimensions(new Vector2(128, 64), false);

        renderer.draw(position.clone().add(new Vector2(-96, 100)));

        if (self.multiplayer) {
            renderer.setTexture("assets/textures/arrow_keys", false, true);
            renderer.draw(position.clone().add(new Vector2(96, 100)));

            renderer.drawText("Player 1", position.clone().add(new Vector2(-96, 50)));
            renderer.drawText("Player 2", position.clone().add(new Vector2(96, 50)));
        }else{
            renderer.setTexture("assets/textures/mouse", false, true);
            renderer.setUVs(new Vector2(0, 0), new Vector2(48, 64), false, true);
            renderer.setDimensions(new Vector2(48, 64), false);
            renderer.draw(position.clone().add(new Vector2(136, 100)));

            renderer.drawText("Or", position.clone().add(new Vector2(0, 100)));
        }

        renderer.setTexture("assets/textures/escape_key", false, true);
        renderer.setUVs(new Vector2(0, 0), new Vector2(32, 32), false, true);
        renderer.setCentre(new Vector2(16, 16));
        renderer.setDimensions(new Vector2(32, 32), false);
        renderer.draw(position.clone().add(new Vector2(0, 250)));
    }));


    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 200)), new Vector2(150, 40), "Continue", function () {
        self.startGame();
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

        var winningCar = self.multiplayerWinner && self.multiplayer ? self.secondCarIndex : self.carIndex;

        self.addHiscore(self.currentTrack.url, name, time, position, winningCar);

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

    if (this.multiplayer) finishMessage = "Player " + (this.multiplayerWinner ? "2" : "1") + " Won! Congratulations.";
    else if (this.finalPlace == 1) finishMessage = "You Won! Congratulations.";

    renderer.drawText(finishMessage, resolution.clone().divScalar(2).sub(new Vector2(0, 150)));

    renderer.setFont("Arial", 16);

    renderer.drawText("The track was completed in:", resolution.clone().divScalar(2).sub(new Vector2(0, 70)));
    renderer.drawText(getTimeString(this.winningTime), resolution.clone().divScalar(2).sub(new Vector2(0, 20)));
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

Game.prototype.pauseGame = function () {

    this.paused = true;

    var resolution = this.getResolution();

    this.unregisterGuiComponents();

    var self = this;

    this.registerGuiComponent(new Panel(this, resolution.clone().divScalar(2), new Vector2(300, 300)));

    this.registerGuiComponent(new Widget(this, resolution.clone().divScalar(2), function(renderer, position){
        renderer.setTextAlign(TextAlign.CENTRE);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
        renderer.setFont("Arial", 20);

        renderer.drawText("Game Paused", position.clone().sub(new Vector2(0, 105)));
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).sub(new Vector2(0, 25)), new Vector2(150, 40), "Resume", function(){
        self.unPauseGame();
    }));

    this.registerGuiComponent(new Button(this, resolution.clone().divScalar(2).add(new Vector2(0, 25)), new Vector2(150, 40), "Quit Game", function(){
        self.unPauseGame();
        self.startScreen(true);
    }));
};

Game.prototype.unPauseGame = function () {

    this.paused = false;

    this.unregisterGuiComponents();
};

Game.prototype.startGame = function(){

    this.unregisterGuiComponents();

    this.gameState = 2;

    this.running = false;
    this.won = false;
    this.winningTime = 0;
    this.numberPlayers = 0;
    this.playersComplete = 0;
    this.secondsTillStart = 0;

    this.gameTicks = 0;

    this.setupGame(this.currentTrack.url, false, this.mainLevel);

    var resolution = this.getResolution();

    if (this.multiplayer){
        this.mainViewport = this.registerViewport(new PlayerViewport(this, this.mainLevel, 0, 0, resolution.x, resolution.y/2, resolution.x/2, resolution.y/2, resolution.x, resolution.y/2));
        this.secondViewport = this.registerViewport(new PlayerViewport(this, this.mainLevel, 0, resolution.y/2, resolution.x, resolution.y/2, resolution.x/2, resolution.y/2, resolution.x, resolution.y/2));
    }else{
        this.mainViewport = this.registerViewport(new PlayerViewport(this, this.mainLevel, 0, 0, resolution.x, resolution.y, resolution.x/2, resolution.y/2, resolution.x, resolution.y));
    }

    this.numberPlayers = 0;

    this.player = new PlayerCar(this.mainLevel, false);
    this.carFactory.createCar(this.carIndex, this.player);
    this.player.direction = Math.PI/2;

    this.player.addViewportTrack(this.mainViewport);

    var startPositionPoints = this.mainLevel.tileSystem.generator.startPositions.keys();

    if (this.multiplayer){
        this.secondPlayer = new PlayerCar(this.mainLevel, true);
        this.carFactory.createCar(this.secondCarIndex, this.secondPlayer);
        this.secondPlayer.direction = Math.PI/2;

        this.secondPlayer.addViewportTrack(this.secondViewport);

        if (startPositionPoints.length > 0){
            setEntitySpawnPosition(startPositionPoints, this.secondPlayer);
            this.numberPlayers++;
        }
    }

    if (startPositionPoints.length > 0){
        setEntitySpawnPosition(startPositionPoints, this.player);
        this.numberPlayers++;
    }

    if (!this.multiplayer) this.numberPlayers += createAI(startPositionPoints, this.mainLevel, this.carFactory, true);

    this.startNumberPlayers = this.numberPlayers;
};

Game.prototype.keyDown = function (keycode) {

    //escape
    if (keycode === 27 && this.gameState === 2){
        if (!this.paused) this.pauseGame();
        else this.unPauseGame();
    }

    Engine.prototype.keyDown.call(this, keycode);
};

Game.prototype.tick = function(){

    if (this.gameState == 2 && !this.paused){
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

    if (this.gameState == 2 && this.secondsTillStart >= -1 && !this.paused){
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