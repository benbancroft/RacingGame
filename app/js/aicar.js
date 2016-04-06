var AICar = function(level){
    //set depth of AICar here
    Car.call(this, level, 5);

    this.destX = 0;
    this.destY = 0;

    this.isForward = true;

    this.checkPointIndex = 0;

    //this.findNewTarget();
    //this.setAlarm(1, 20+Engine.random(0, 80));
}

AICar.prototype = Object.create(Car.prototype);
AICar.prototype.constructor = AICar;

AICar.prototype.findNewTarget = function () {
    this.destX = Engine.random(0, this.level.width);
    this.destY = Engine.random(0, this.level.height);
};

AICar.prototype.tick = function(engine){

    var numberCheckpoints = engine.generator.checkPoints.length;

    if (this.checkPointIndex < numberCheckpoints) {

        var position = new Vector2(this.x, this.y);

        var nextCheckPoint = engine.generator.checkPoints[this.checkPointIndex];

        var distanceToCheckPoint = position.clone().sub(nextCheckPoint).len();

        var doTurn = true;

        if (distanceToCheckPoint < 1000 && distanceToCheckPoint > 300){

            //nextCheckPoint = engine.generator.checkPoints[(this.checkPointIndex+1)%numberCheckpoints];

            if (this.getForwardSpeed() > this.maxSpeed / 2) this.isForward = false;

            //doTurn = false;

        }else if (distanceToCheckPoint < 300){

            this.isForward = true;

            this.checkPointIndex++;
            this.checkPointIndex %= numberCheckpoints;
        }

        var result = new Vector2(Math.sin(this.direction), -Math.cos(this.direction)).cross(nextCheckPoint.clone().sub(position));

        if (doTurn) {
            if (result > 0) {
                this.isLeft = false;
                this.isRight = true;
            }
            else {
                this.isLeft = true;
                this.isRight = false;
            }
        }
    }

    Car.prototype.tick.call(this, engine);

};