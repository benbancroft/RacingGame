var GuiComponent = function(game, position, dimensions){
    this.game = game;

    this.position = position;
    this.dimensions = dimensions;

    this.isHover = false;
};

GuiComponent.prototype.onHover = function(){
};

GuiComponent.prototype.onPress = function(position){
};

GuiComponent.prototype.render = function(renderer){
};

//Panel

var Panel = function(engine, position, dimensions, colour){
    GuiComponent.call(this, engine, position, dimensions);

    this.colour = colour || new Vector4(0.2, 0.2, 0.2, 0.6)
};

Panel.prototype = Object.create(GuiComponent.prototype);
Panel.prototype.constructor = Panel;

Panel.prototype.render = function(renderer){
    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(this.colour);

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(this.dimensions.clone().divScalar(2));
    renderer.setDimensions(this.dimensions, false);

    renderer.draw(this.position);
};

//Widget

var Widget = function(game, position, renderCallback){
    GuiComponent.call(this, game, position, new Vector2());

    this.renderCallback = renderCallback;
};

Widget.prototype = Object.create(GuiComponent.prototype);
Widget.prototype.constructor = Widget;

Widget.prototype.render = function(renderer){
    this.renderCallback(renderer, this.position)
};

//Car Widget

var CarWidget = function(engine, position, previousCallback, nextCallback, carStatCallback, maxCarStats){
    Widget.call(this, engine, position, null);

    this.position = position;
    this.carStatCallback = carStatCallback;

    //Register buttons

    var resolution = engine.getResolution();

    var carBoxDimensions = new Vector2(200, 375)

    engine.registerGuiComponent(new Panel(engine, position.clone().add(new Vector2(0, carBoxDimensions.y/2-64)), carBoxDimensions, new Vector4(0.8, 0.8, 0.8, 1.0)));

    engine.registerGuiComponent(new Button(engine, position.clone().sub(new Vector2(69, -279)), new Vector2(40, 40), "\u25C4", previousCallback, new Vector4(0.6,0.6,0.6,1.0)));

    engine.registerGuiComponent(new Button(engine, position.clone().sub(new Vector2(-71, -279)), new Vector2(40, 40), "\u25BA", nextCallback, new Vector4(0.6,0.6,0.6,1.0)));

    //parameters

    //mass
    this.parameterPosition = position.clone().sub(new Vector2(89, -114.5));

    engine.registerGuiComponent(new PercentageWidget(engine, this.parameterPosition, function (){
        return carStatCallback().mass / maxCarStats.mass;
    }));

    //speed
    engine.registerGuiComponent(new PercentageWidget(engine, this.parameterPosition.clone().add(new Vector2(0, 40)), function (){
        return carStatCallback().maxSpeed / maxCarStats.maxSpeed;
    }));

    //handling
    engine.registerGuiComponent(new PercentageWidget(engine, this.parameterPosition.clone().add(new Vector2(0, 80)), function (){
        return carStatCallback().turnSpeed / maxCarStats.turnSpeed;
    }));

    //acceleration
    engine.registerGuiComponent(new PercentageWidget(engine, this.parameterPosition.clone().add(new Vector2(0, 120)), function (){
        return carStatCallback().acceleration / maxCarStats.acceleration;
    }));

};

CarWidget.prototype = Object.create(Widget.prototype);
CarWidget.prototype.constructor = CarWidget;

CarWidget.prototype.render = function(renderer){

    var carStats = this.carStatCallback();

    renderer.setUseColour(false);
    renderer.setDimensions(new Vector2(128, 128));
    renderer.setRotation(Math.PI/2, true);

    renderer.setUseSprite(carStats.spriteSheetUrl, 0);

    renderer.draw(this.position);

    var massParameterPosition = this.parameterPosition.clone();

    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);

    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setFont("Arial", 18);

    renderer.drawText(carStats.name, this.position.clone().add(new Vector2(0,70)));

    renderer.setFont("Arial", 16);

    renderer.setTextAlign(TextAlign.LEFT);

    renderer.drawText("Mass", massParameterPosition.add(new Vector2(0, -15)));
    renderer.drawText("Max Speed", massParameterPosition.add(new Vector2(0, 40)));
    renderer.drawText("Handling", massParameterPosition.add(new Vector2(0, 40)));
    renderer.drawText("Acceleration", massParameterPosition.add(new Vector2(0, 40)));
};

//Percentage Bar

var PercentageWidget = function(engine, position, percentageCallback, length, thickness) {
    Widget.call(this, engine, position, null);

    this.percentageCallback = percentageCallback;
    this.thickness = thickness || 3;
    this.length = length || 180;
};

PercentageWidget.prototype = Object.create(Widget.prototype);
PercentageWidget.prototype.constructor = PercentageWidget;

PercentageWidget.prototype.render = function(renderer){

    var percentage = this.percentageCallback();

    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setUseColour(true);
    renderer.setRotation(0, true);

    renderer.setColour(new Vector4(1,1,1,1));
    renderer.setCentre(new Vector2(0,0));
    renderer.setDimensions(new Vector2(percentage*this.length, this.thickness), false);
    renderer.draw(this.position);

    renderer.setColour(new Vector4(0.6,0.6,0.6,1));
    renderer.setCentre(new Vector2(0,0));
    renderer.setDimensions(new Vector2((1-percentage)*this.length, this.thickness), false);
    renderer.draw(this.position.clone().add(new Vector2(percentage*this.length, 0)));
};

//Track Widget

var TrackWidget = function(game, position, previousCallback, nextCallback){
    Widget.call(this, game, position, null);

    this.position = position;

    game.loadTrackPreview(position);

    //game.registerGuiComponent(new Panel(this, position.clone().add(new Vector2(213, 334)), new Vector2(40, 40), "\u25BA", curry(nextCallback, position), new Vector4(0.6,0.6,0.6,1.0)));

    game.registerGuiComponent(new Button(this, position.clone().add(new Vector2(133, 334)), new Vector2(40, 40), "\u25C4", curry(previousCallback, position), new Vector4(0.6,0.6,0.6,1.0)));

    game.registerGuiComponent(new Button(this, position.clone().add(new Vector2(213, 334)), new Vector2(40, 40), "\u25BA", curry(nextCallback, position), new Vector4(0.6,0.6,0.6,1.0)));

};

TrackWidget.prototype = Object.create(Widget.prototype);
TrackWidget.prototype.constructor = TrackWidget;

TrackWidget.prototype.render = function(renderer){
    var resolution = renderer.getResolution();
    var position = this.position.clone();

    //draw track

    var trackBoxDimensions = new Vector2(280, 375);
    var trackPosition = resolution.clone().divScalar(2).add(new Vector2(115, -29));

    renderer.setColour(new Vector4(0.8, 0.8, 0.8, 1.0));
    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(trackBoxDimensions.clone().divScalar(2));
    renderer.setDimensions(trackBoxDimensions, false);

    renderer.draw(trackPosition);

    this.game.racetrackPreviewViewport.render(renderer);

    //text

    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);
    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setFont("Arial", 18);

    renderer.drawText(this.game.currentTrack.contents.name, trackPosition.add(new Vector2(0,95)));

    renderer.setFont("Arial", 16);

    renderer.drawText(this.game.currentTrack.contents.laps + " Laps", trackPosition.add(new Vector2(0,20)));
};