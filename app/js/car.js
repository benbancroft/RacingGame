/*var Test = function(level){
    //set depth of car here
    Entity.call(this, level, 5);

    this.width = 10;
    this.height = 10;
}

Test.prototype = Object.create(Entity.prototype);
Test.prototype.constructor = Test;

Test.prototype.render = function(renderer){

    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    renderer.setColour(new Vector4(1.0, 0.0, 0.0, 1.0));
    renderer.setUseColour(true);
    renderer.setDimensions(new Vector2(this.width, this.height), false);

    renderer.draw(new Vector2(this.x, this.y));
};*/



var Car = function(level){
    //set depth of car here
    Entity.call(this, level, 10);

    this.spriteSheet = "assets/sprites/police";
    this.spriteIndex = 1;

    this.sirenRate = 10;
    this.sirenState = false;

    this.width = 128;
    this.height = 128;

    this.bbWidth = 49;
    this.bbHeight = 107;

    this.isForward = false;
    this.isReverse = false;
    this.isLeft = false;
    this.isRight = false;
    this.isHandbrake = false;

    this.acceleration = 0.05;
    this.deceleration = this.acceleration/5;
    this.turnSpeed = Math.PI/800;
    this.angularDeceleration = this.turnSpeed/1.1;

    this.carMaxSpeed = 15;
    this.maxSpeed = 15;

    this.sirenRate = 10;
    this.sirenState = false;

    this.toggleSirens();

}

Car.prototype = Object.create(Entity.prototype);
Car.prototype.constructor = Car;

Car.prototype.render = function(renderer){

    /*if (this.isColliding())
        renderer.setColour(new Vector4(1.0, 0.0, 0.0, 1.0));
    else
        renderer.setColour(new Vector4(0.0, 1.0, 0.0, 1.0));*/

    //renderer.setUseColourBlending(true);
    Entity.prototype.render.call(this, renderer);

    /*renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);
    //renderer.setColour(new Vector4(1.0, 0.0, 0.0, 1.0));
    renderer.setUseColour(true);
    renderer.setCentre(new Vector2(this.bbWidth/2, this.bbHeight/2));
    renderer.setRotation(this.direction);
    renderer.setDimensions(new Vector2(this.bbWidth, this.bbHeight), false);

    renderer.draw(new Vector2(this.x, this.y));*/
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

    /*var currentSpeed = Math.abs(this.velocity.len() * Math.sin(this.direction));

     if ((this.direction > -Math.PI / 2 && this.direction < 0) || (this.direction > Math.PI / 2 && this.direction < Math.PI)) {
     currentSpeed = Math.abs(this.velocity.len() * Math.cos(this.direction));
     }*/

    //Engine.log(currentSpeed);

    if (currentSpeed < this.maxSpeed){

        var forward = new Vector2(Math.sin(this.direction), -Math.cos(this.direction)).normalise();

        var cap = this.maxSpeed - currentSpeed;

        if (cap < acceleration) {
            this.accelerate(forward.scale(cap));
            //Engine.log(this.getForwardSpeed());
        }
        else if (cap > 0) {
            this.accelerate(forward.scale(acceleration));
            //Engine.log(this.getForwardSpeed());
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

Car.prototype.tick = function(engine){

    //0.95 grass

    var driftFactor = 0.95;
    this.maxSpeed = this.carMaxSpeed / 2;

    var ct = this.turnSpeed/2;

    var tileSystem = this.level.tileSystem;
    if (tileSystem && tileSystem.generator.isOnStructure(new Vector2(this.x, this.y))){
        driftFactor = 0.2;
        this.maxSpeed = this.carMaxSpeed;
        ct *= 2;
    }

    this.killOrthogonalVelocity(driftFactor);
    this.dampenSpeed();


    var speed = this.getForwardSpeed();
    if(speed >= 0){
        ct *= (speed / (this.maxSpeed/2));
    }

    //up
    if (this.isHandbrake){
        //this.killForwardVelocity();
    }
    else if (this.isForward){
        //this.speed += 1.0;
        //change to force F=ma
        this.accelerateForwardMax(this.acceleration);

        //Engine.log("forward");
    }
    //down
    else if (this.isReverse){
        this.accelerateForwardMax(-this.acceleration);

        ct *= -2.25;
        //this.speed -= 1.0;

        //Engine.log("back");
    }

    //fraction of a degree
    if(this.isLeft){
        this.applyTorque(-ct);
        this.driftDir = false;
    }
    else if(this.isRight){
        //this.direction = this.turnSpeed;
        this.applyTorque(ct);
        this.driftDir = true;
    }

    Entity.prototype.tick.call(this, engine);

};

Car.prototype.alarm = function(index){
    switch (index){
        case 0:
        {
            this.spriteIndex++;
            if (this.spriteIndex > 3) this.spriteIndex = 1;

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