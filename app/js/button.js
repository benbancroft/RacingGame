/**
 * This code was written by Ben Bancroft
 */

var Button = function(game, position, dimensions, text, callback, colour){
    GuiComponent.call(this, game, position, dimensions);

    this.text = text;
    this.callback = callback;

    this.colour = colour || new Vector4(0.8, 0.8, 0.8, 1)
};

Button.prototype = Object.create(GuiComponent.prototype);
Button.prototype.constructor = Button;

Button.prototype.onPress = function(position){
    this.game.playSound("assets/sounds/mouseclick");

    this.callback();
};

Button.prototype.render = function(renderer){
    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);

    if (this.isHover) renderer.setColour(this.colour);
    else renderer.setColour(new Vector4(0, 0, 0, 1))

    renderer.setUseColour(true);
    renderer.setRotation(0, true);
    renderer.setCentre(this.dimensions.clone().divScalar(2));
    renderer.setDimensions(this.dimensions, false);

    renderer.draw(this.position);

    renderer.setTextAlign(TextAlign.CENTRE);
    renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0));
    renderer.setFont("Chewy", 20);
    renderer.drawText(this.text, this.position);
};