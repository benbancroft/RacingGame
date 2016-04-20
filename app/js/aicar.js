/**
 * This code was written by Ben Bancroft
 */

var AICar = function(level, playSound){
    //set depth of AICar here
    Car.call(this, level, playSound);

    this.destX = 0;
    this.destY = 0;

    this.isForward = true;
}

AICar.prototype = Object.create(Car.prototype);
AICar.prototype.constructor = AICar;

AICar.prototype.findNewTarget = function () {
    this.destX = Engine.random(0, this.level.width);
    this.destY = Engine.random(0, this.level.height);
};

AICar.prototype.tick = function(engine){

    if (this.level.game.gameState == 2 && this.currentLap >= this.level.tileSystem.generator.track.laps){

        this.level.game.playersComplete++;

        this.level.removeEntity(this);

        return;
    }

    var tileSystem = this.level.tileSystem;
    var numberCheckpoints = tileSystem.generator.checkPoints.length;

    if (this.checkPointIndex < numberCheckpoints) {

        var position = new Vector2(this.x, this.y);

        var nextCheckPoint = tileSystem.generator.checkPoints[this.checkPointIndex];

        var distanceToCheckPoint = position.clone().sub(nextCheckPoint).len();

        if (distanceToCheckPoint < 1000 && distanceToCheckPoint > 300){

            var forwardSpeed = this.getForwardSpeed();

            if (forwardSpeed > this.maxSpeed / 2) this.isForward = false;
            else this.isForward = true;

            //doTurn = false;

        }else if (distanceToCheckPoint < 300){

            if (forwardSpeed > 0.5) this.isForward = true;
        }else{
            this.isForward = true;
        }

        var result = new Vector2(Math.sin(this.direction), -Math.cos(this.direction)).cross(nextCheckPoint.clone().sub(position));

        if (result > 0) {
            this.isLeft = false;
            this.isRight = true;
        }
        else {
            this.isLeft = true;
            this.isRight = false;
        }
    }

    Car.prototype.tick.call(this, engine);

};