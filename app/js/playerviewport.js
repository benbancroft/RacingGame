var PlayerViewport = function(game, level, x, y, width, height, levelX, levelY, levelWidth, levelHeight){
    Viewport.call(this, level, x, y, width, height, levelX, levelY, levelWidth, levelHeight);

    this.game = game;

};

PlayerViewport.prototype = Object.create(Viewport.prototype);
PlayerViewport.prototype.constructor = PlayerViewport;

PlayerViewport.prototype.render = function(renderer){

    Viewport.prototype.render.call(this, renderer);


    if (this.followingEntity != null) {

        var resolution = renderer.getResolution();

        renderer.setTextAlign(TextAlign.RIGHT);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);

        renderer.drawText("Position: " + this.game.calculatePosition(this.followingEntity) + "/" + this.game.numberPlayers, resolution.clone().sub(new Vector2(20, 150)));
        renderer.drawText("Lap: " + this.followingEntity.currentLap + "/" + this.game.generator.track.laps, resolution.clone().sub(new Vector2(20, 200)));
        renderer.drawText("Speed: " + Math.floor(this.followingEntity.getForwardSpeed()*7), resolution.clone().sub(new Vector2(20, 250)));

        renderer.setUseColour(false, false, true);
        renderer.setUseColourBlending(true, false);
        renderer.setColour(new Vector4(1.0, 1.0, 0.0, 1.0), true);
        renderer.setTexture("assets/textures/arrow", false, true);
        renderer.setUVs(new Vector2(0, 0), new Vector2(256, 256), false, true);
        renderer.setRotation(this.followingEntity.getCheckpoint(this.game).clone().sub(this.followingEntity.getPosition()).swap().getAngle(), true);
        renderer.setCentre(new Vector2(64, 64));
        renderer.setDimensions(new Vector2(128, 128), false);

        renderer.draw(resolution.clone().subScalar(70));

    }

};