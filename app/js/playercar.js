var PlayerCar = function(level){
    //set depth of PlayerCar here
    Car.call(this, level, 5);
}

PlayerCar.prototype = Object.create(Car.prototype);
PlayerCar.prototype.constructor = PlayerCar;

PlayerCar.prototype.tick = function(engine){

    if (this.level.game.running && this.currentLap >= this.level.tileSystem.generator.track.laps){

        this.level.game.finalPlace = this.level.game.calculatePosition(this);

        var self = this;
        this.level.entities.forEach(function(entity) {
            if (entity.__proto__ !== PlayerCar.prototype){
                self.level.removeEntity(entity);
            }
        });

        this.level.game.gameState = 3;
        this.level.game.finishScreen(Math.floor(this.level.game.gameTicks/60), this.level.game.finalPlace);
        this.level.game.gameFinishTick = this.level.game.gameTicks;
        this.__proto__ = AICar.prototype;

        return;
    }

    //up
    if (engine.isKeyPressed(32)){
        this.isHandbrake = true;
    }
    else if (engine.isKeyPressed(87)){
        this.isForward = true;
        this.isReverse = false;
        this.isHandbrake = false;
    }
    //down
    else if (engine.isKeyPressed(83)){
        this.isForward = false;
        this.isReverse = true;
        this.isHandbrake = false;
    }else{
        this.isForward = false;
        this.isReverse = false;
        this.isHandbrake = false;
    }

    //fraction of a degree
    if(engine.isKeyPressed(65)){
        this.isLeft = true;
        this.isRight = false;
    }
    else if(engine.isKeyPressed(68)){
        this.isLeft = false;
        this.isRight = true;
    }else{
        this.isLeft = false;
        this.isRight = false;
    }

    Car.prototype.tick.call(this, engine);

};