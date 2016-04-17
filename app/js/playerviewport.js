var PlayerViewport = function(game, level, x, y, width, height, levelX, levelY, levelWidth, levelHeight){
    Viewport.call(this, level, x, y, width, height, levelX, levelY, levelWidth, levelHeight);

    this.game = game;

};

PlayerViewport.prototype = Object.create(Viewport.prototype);
PlayerViewport.prototype.constructor = PlayerViewport;

PlayerViewport.prototype.render = function(renderer){

    Viewport.prototype.render.call(this, renderer);


    if (this.game.gameState == 2 && this.followingEntity != null) {

        var resolution = renderer.getResolution();

        renderer.setTextAlign(TextAlign.RIGHT);
        renderer.setColour(new Vector4(1.0, 1.0, 1.0, 1.0), true);

        renderer.drawText("Position: " + this.game.calculatePosition(this.followingEntity) + "/" + this.game.numberPlayers, resolution.clone().sub(new Vector2(20, 150)));
        renderer.drawText("Lap: " + this.followingEntity.currentLap + "/" + this.level.tileSystem.generator.track.laps, resolution.clone().sub(new Vector2(20, 200)));
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

Viewport.prototype.mouseDown = function(position){

};

PlayerViewport.prototype.followEntity = function(entity){

    Viewport.prototype.followEntity.call(this, entity);

    var position = this.game.getMousePosition();

    if (this.game.isMousePressed(false) && this.x <= position.x && this.x + this.width >= position.x && this.y <= position.y && this.y + this.height >= position.y){

        var pos = position.clone().sub(new Vector2(this.x, this.y)).add(new Vector2(this.width, this.height).divScalar(2));


        pos.div(new Vector2(this.width, this.height).div(new Vector2(this.levelWidth, this.levelHeight))).sub(new Vector2(this.levelX, this.levelY));

        var result = new Vector2(Math.sin(entity.direction), -Math.cos(entity.direction)).cross(pos.clone().sub(entity.getPosition()));

        if (result > 0) {
            entity.isLeft = false;
            entity.isRight = true;
        }
        else {
            entity.isLeft = true;
            entity.isRight = false;
        }

    }

    this.game.setSoundListenerPosition(new Vector2(entity.x, entity.y));
    this.game.setSoundListenerVelocity(entity.velocity);

};