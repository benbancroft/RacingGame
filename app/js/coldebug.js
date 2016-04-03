var coldebug = function(level){
    //set depth of coldebug here
    Entity.call(this, level, 5);

    this.destX = 0;
    this.destY = 0;

    this.width = 128;
    this.height = 64;

    this.bbWidth = this.width;
    this.bbHeight = this.height;

    this.torque = 0;
    this.angularVelocity = 0;
}

coldebug.prototype = Object.create(Entity.prototype);
coldebug.prototype.constructor = coldebug;

coldebug.prototype.render = function(renderer){

    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);

    if (this.isColliding())
        renderer.setColour(new Vector4(1.0, 0.0, 0.0, 1.0));
    else
        renderer.setColour(new Vector4(0.0, 1.0, 0.0, 1.0));


    renderer.setUseColour(true);
    renderer.setRotation(this.direction, true);
    renderer.setCentre(new Vector2(this.width/2, this.height/2));
    renderer.setDimensions(new Vector2(this.width, this.height), false);

    renderer.draw(new Vector2(this.x, this.y));
};

coldebug.prototype.tick = function(engine){

    Entity.prototype.tick.call(this, engine);

};