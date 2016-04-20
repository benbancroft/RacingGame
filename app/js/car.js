/**
 * This code was written by Ben Bancroft
 */

var Car = function(level, playSound){
    //set depth of car here
    Entity.call(this, level, 10);

    this.spriteSheet = "assets/sprites/police";
    this.spriteIndex = 0;

    this.sirenRate = 10;
    this.sirenState = false;

    this.width = 128;
    this.height = 128;

    this.mass = 200;
    this.density = 0.0005

    this.bbWidth = 49;
    this.bbHeight = 107;

    this.isForward = false;
    this.isReverse = false;
    this.isLeft = false;
    this.isRight = false;
    this.isHandbrake = false;

    this.acceleration = 0.05;
    this.deceleration = this.acceleration/5;
    this.turnSpeed = Math.PI/200;
    this.angularDeceleration = this.turnSpeed/1.1;

    this.maxSpeed = 15;
    this.carMaxSpeed = 15;

    this.sirenRate = 10;
    this.sirenState = false;

    this.checkPointIndex = 0;
    this.currentLap = 0;

    this.type = CarType.POLICE;

    this.playSound = playSound

    if (playSound){

        var soundIndex = Math.floor(Math.random() * 6);

        this.sound = this.level.game.playSound("assets/sounds/car_loop_" + soundIndex, true, true);
    }
};

Car.prototype = Object.create(Entity.prototype);
Car.prototype.constructor = Car;

Car.prototype.decontructor = function(){
    this.level.game.stopSound(this.sound);
};

Car.prototype.setStats = function(type, stats) {

    if (!stats) return;

    this.mass = stats.mass;
    this.carMaxSpeed = stats.maxSpeed;
    this.turnSpeed = stats.turnSpeed;
    this.spriteSheet = stats.spriteSheetUrl;
    this.acceleration = stats.acceleration;
    this.bbWidth = stats.boundingBox.x;
    this.bbHeight = stats.boundingBox.y;
    this.spriteIndex = 0;

    this.type = type;

    if (type == CarType.POLICE || type == CarType.AMBULANCE) this.toggleSirens();
};

Car.prototype.toggleSirens = function(){
    if (!this.sirenState){
        this.spriteIndex = 1;
        this.setAlarm(0, this.sirenRate);
        this.sirenState = true;
    }else{
        this.spriteIndex = 0;
        this.cancelAlarm(0)
        this.sirenState = true;
    }
};

Car.prototype.dampenSpeed = function(){

    //linear velocity

    var directionVector = this.velocity.clone().normalise();
    var currentSpeed = this.velocity.len();

    currentSpeed -= this.deceleration;
    if (currentSpeed < 0) currentSpeed = 0;

    this.velocity = directionVector.scale(currentSpeed);

    //angular velocity

    var angularMagnitude = Math.abs(this.angularVelocity) - this.angularDeceleration;
    if (angularMagnitude < 0) angularMagnitude = 0;
    this.angularVelocity = angularMagnitude * Math.sign(this.angularVelocity);
};

Car.prototype.accelerateForwardMax = function(acceleration) {

    var currentSpeed = this.getForwardSpeed();

    if (currentSpeed < this.maxSpeed){

        var forward = new Vector2(Math.sin(this.direction), -Math.cos(this.direction)).normalise();

        var cap = this.maxSpeed - currentSpeed;

        if (cap < acceleration) {
            this.accelerate(forward.scale(cap));
        }
        else if (cap > 0) {
            this.accelerate(forward.scale(acceleration));
        }

    }
}

Car.prototype.killForwardVelocity = function() {

    var currentSpeed = this.getForwardSpeed();
    var forwardVector = this.getForwardVector(this.velocity);

    this.velocity.add(forwardVector);
}

Car.prototype.killOrthogonalVelocity = function(drift){

    var forward = new Vector2(-Math.sin(this.direction), Math.cos(this.direction)).normalise();

    var right = forward.clone().perp().normalise();

    var forwardVelocity = forward.scale(this.velocity.dot(forward));
    var rightVelocity = right.scale(this.velocity.dot(right));

    //cap hit check
    this.velocity = forwardVelocity.add(rightVelocity.scale(drift));
};

Car.prototype.getCheckpoint = function(engine){
    return this.level.tileSystem.generator.checkPoints[this.checkPointIndex];
}

Car.prototype.getDistanceToCheckpoint = function(engine){
    var nextCheckPoint = this.getCheckpoint(engine);

    return this.getPosition().sub(nextCheckPoint).len();
};

Car.prototype.tick = function(engine){

    if (this.level.game.paused){
        engine.muteSound(this.sound)
        return;
    }else{
        engine.unMuteSound(this.sound)
    }

    if ((this.level.game.gameState == 2 && this.level.game.running) || this.level.game.gameState != 2) {

        //0.95 grass

        var driftFactor = 0.95;
        this.maxSpeed = this.carMaxSpeed / 2;

        var ct = this.turnSpeed * 0.8;

        var tileSystem = this.level.tileSystem;
        if (tileSystem && tileSystem.generator.isOnStructure(new Vector2(this.x, this.y))) {
            driftFactor = 0.2;
            this.maxSpeed = this.carMaxSpeed;
            ct = this.turnSpeed;
        }

        this.killOrthogonalVelocity(driftFactor);
        this.dampenSpeed();


        var speed = this.getForwardSpeed();
        if (!this.isReverse && speed >= 0) {
            if (speed > this.maxSpeed / 2) speed = this.maxSpeed / 2;
            ct *= Math.sin((speed * (Math.PI / 2)) / (this.maxSpeed / 2));
        }

        //up
        if (this.isHandbrake) {
            //this.killForwardVelocity();
        }
        else if (this.isForward) {
            //this.speed += 1.0;
            //change to force F=ma
            this.accelerateForwardMax(this.acceleration);

            //Engine.log("forward");
        }
        //down
        else if (this.isReverse) {
            this.accelerateForwardMax(-this.acceleration);

            ct *= -0.6;
            //this.speed -= 1.0;

            //Engine.log("back");
        }

        //fraction of a degree
        if (this.isLeft) {
            this.applyTorque(-ct);
            this.driftDir = false;
        }
        else if (this.isRight) {
            //this.direction = this.turnSpeed;
            this.applyTorque(ct);
            this.driftDir = true;
        }

    }

    Entity.prototype.tick.call(this, engine);

    if (this.hasCollided && this.playSound && (!this.crashSound || this.crashSound.ended)){
        var game = this.level.game;
        game.stopSound(this.crashSound);
        this.crashSound = game.playSound("assets/sounds/car_crash", false, true);
        game.setSoundPosition(this.crashSound, this.getPosition());
        game.setSoundVelocity(this.crashSound, this.velocity)
    }

    if (this.sound){
        var game = this.level.game;
        game.setSoundPosition(this.sound, this.getPosition());
        game.setSoundVelocity(this.sound, this.velocity)
    }


    var numberCheckpoints = this.level.tileSystem.generator.checkPoints.length;

    if (this.checkPointIndex < numberCheckpoints) {

        var distanceToCheckPoint = this.getDistanceToCheckpoint(engine);

        if (distanceToCheckPoint < 220) {
            this.checkPointIndex++;
            if (this.checkPointIndex >= numberCheckpoints) this.currentLap++;
            this.checkPointIndex %= numberCheckpoints;
        }
    }

};

Car.prototype.alarm = function(index){
    switch (index){
        case 0:
        {
            this.spriteIndex++;
            if (this.spriteIndex > (this.type == CarType.POLICE ? 3 : 2)) this.spriteIndex = 1;

            this.setAlarm(0, this.sirenRate);
        }
            break;
        case 1:
        {
            this.findNewTarget();
            this.setAlarm(1, 100);
        }
            break;
    }
};