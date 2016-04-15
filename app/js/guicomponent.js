var GuiComponent = function(engine, position, dimensions){
    this.engine = engine;

    this.position = position;
    this.dimensions = dimensions;

    this.isHover = false;
};

GuiComponent.prototype.onRegister = function(engine){

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
    renderer.setColour(new Vector4(0.2, 0.2, 0.2, 0.6));

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(this.dimensions.clone().divScalar(2));
    renderer.setDimensions(this.dimensions, false);

    renderer.draw(renderer.getResolution().clone().divScalar(2));
};

//Widget

var Widget = function(engine, position, renderCallback){
    GuiComponent.call(this, engine, position, new Vector2());

    this.renderCallback = renderCallback;
};

Widget.prototype = Object.create(GuiComponent.prototype);
Widget.prototype.constructor = Widget;

Widget.prototype.render = function(renderer){
    this.renderCallback(renderer, this.position)
};