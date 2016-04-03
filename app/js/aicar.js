var AICar = function(level){
    //set depth of AICar here
    Car.call(this, level, 5);

    this.destX = 0;
    this.destY = 0;

    this.isForward = true;

    this.findNewTarget();
    this.setAlarm(1, 20+Engine.random(0, 80));
}

AICar.prototype = Object.create(Car.prototype);
AICar.prototype.constructor = AICar;

AICar.prototype.findNewTarget = function () {
    this.destX = Engine.random(0, this.level.width);
    this.destY = Engine.random(0, this.level.height);
};

AICar.prototype.tick = function(engine){

    var result = new Vector2(-Math.sin(this.direction), Math.cos(this.direction)).cross(new Vector2(this.destX-this.x, this.destY-this.y));

    if (result > 0){
        this.isLeft = false;
        this.isRight = true;
    }
    else{
        this.isLeft = true;
        this.isRight = false;
    }

    Car.prototype.tick.call(this, engine);

};