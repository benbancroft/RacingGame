var GuiComponent = function(engine, position, dimensions){
    this.engine = engine;

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