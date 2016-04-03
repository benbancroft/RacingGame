var AlarmData = function (startTime, delay){
    this.startTime = startTime;
    this.delay = delay;
};

var Entity = function(level, depth){

    Renderable.call(this, depth);

    this.level = level;

    this.addRenderable(level)
    level.addEntity(this);

    this.aliveTime = 0;

    this.x = 0.0;
    this.y = 0.0;
    this.lastX = 0.0;
    this.lastY = 0.0;
    this.direction = 0.0;
    this.velocity = new Vector2();

    this.angularVelocity = 0;
    this.torque = 0;

    this.width = 128.0;
    this.height = 128.0;

    this.bbWidth = 128.0;
    this.bbHeight = 128.0;

    this.slides = true;

    this.spriteSheet = "";
    this.spriteIndex = 0;

    this.viewportsFollowing = new Array();
    this.alarms = new Map();
};

Entity.prototype = Object.create(Renderable.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.addRenderable = function(level){
    level.addRenderable(this);
}

Entity.prototype.setPosition = function(position){
    this.x = position.x;
    this.y = position.y;
};

Entity.prototype.addViewportTrack = function(viewport){
    if (viewport.level == this.level && !this.viewportsFollowing.find(function(element) { return element == viewport})){
        this.viewportsFollowing.push(viewport);
    }
};

Entity.prototype.directTowards = function(position){
    this.velocity = position.clone().sub(new Vector2(this.x, this.y)).normalise().scale(2);
};

Entity.prototype.applyTorque = function(torque){
    this.torque = torque;
    this.angularVelocity += torque;
};

Entity.prototype.getForwardVector = function(vector){
    var forward = new Vector2(-Math.sin(this.direction), Math.cos(this.direction)).normalise();
    return vector.clone().multiply(forward)
};

Entity.prototype.getForwardSpeed = function(){
    var forward = this.getForwardVector(this.velocity);
    var speed = forward.len();

    return isNaN(speed) ? 0 : speed;
};


Entity.prototype.accelerate = function(acceleration) {

    this.velocity.add(acceleration);
}

Entity.prototype.keyDown = function (keycode) {
};

Entity.prototype.isCollidingWithEntity = function(other, manifolds){

    if (!manifolds) manifolds = new CollisionManifolds();

    if (other == this) return false;

    var polygon1 = new Polygon(new Vector2(this.x, this.y), [
        new Vector2(-this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, this.bbHeight / 2), new Vector2(-this.bbWidth / 2, this.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon1.setAngle(this.direction);

    var polygon2 = new Polygon(new Vector2(other.x, other.y), [
        new Vector2(-other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, other.bbHeight / 2), new Vector2(-other.bbWidth / 2, other.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon2.setAngle(other.direction);

    if (testPolygonsSAT(new Vector2(this.lastX, this.lastY), polygon1, polygon2, manifolds)) return true;
};

Entity.prototype.isColliding = function(manifolds){

    if (!manifolds) manifolds = new CollisionManifolds();

    for (var i = 0; i < this.level.entities.length; i++) {
        var other = this.level.entities[i];

        if (this.isCollidingWithEntity(other)) return true;
    }
    return false;
};

Entity.prototype.setDirection = function(newDirection){

    var oldDirection = this.direction;
    this.direction = newDirection;


    if (this.isColliding()){
        this.direction = oldDirection;
    }

};

Entity.prototype.moveTowards = function(x, y, speed){
    this.destX = x;
    this.destY = y;
    this.acceleration = speed;
};

Entity.prototype.render = function(renderer){

    renderer.setUseColour(false);
    renderer.setDimensions(new Vector2(this.width, this.height));

    renderer.setUseSprite(this.spriteSheet, this.spriteIndex);

    renderer.setRotation(this.direction, true);

    /*renderer.setUseColour(true);
    renderer.setRotation(this.direction, true);
    renderer.setCentre(new Vector2(this.bbWidth/2, this.bbHeight/2));
    renderer.setDimensions(new Vector2(this.bbWidth, this.bbHeight), false);*/

    renderer.draw(new Vector2(this.x, this.y));
};

Entity.prototype.resolveCollision = function(other){

    var collided = false;
    //do {

    var polygon1 = new Polygon(new Vector2(this.x, this.y), [
        new Vector2(-this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, -this.bbHeight / 2), new Vector2(this.bbWidth / 2, this.bbHeight / 2), new Vector2(-this.bbWidth / 2, this.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon1.setAngle(this.direction);

    var polygon2 = new Polygon(new Vector2(other.x, other.y), [
        new Vector2(-other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, -other.bbHeight / 2), new Vector2(other.bbWidth / 2, other.bbHeight / 2), new Vector2(-other.bbWidth / 2, other.bbHeight / 2)
    ], new Vector2(0, 0));
    polygon2.setAngle(other.direction);

    var response = new CollisionManifolds();
    collided = testPolygonsSAT(polygon1, polygon2, response);

    if (collided) {

        /*if (Math.abs(response.overlapN.x) == 1.0){
         this.x -= response.overlapV.x;


         entity.x -= Math.sin(entity.direction) * entity.speed;
         entity.y += Math.cos(entity.direction) * entity.speed;

         }

         this.y -= response.overlapV.y;*/

        this.x -= response.overlapV.x;
        this.y -= response.overlapV.y;

        //this.x = this.lastX;
        //this.y = this.lastY;

        //if (response.overlapV.len() < 0.00000001) break;

        //this.x += Math.sin(this.direction) * response.overlap;
        //this.y -= Math.cos(this.direction) * response.overlap;


        /*Engine.log("collided => " + collided);
         Engine.log("response.overlap => " + response.overlap);
         Engine.log("response.overlapN => (" + response.overlapN.x + ", " + response.overlapN.y + ")");
         Engine.log("response.overlapV => (" + response.overlapV.x + ", " + response.overlapV.y + ")");*/
    }

    //}while (collided == true);
};

Entity.prototype.tick = function(engine){

    /*for (var i = 0; i < this.level.entities.length; i++) {
     var entity = this.level.entities[i];

     if (entity == this) continue;

     this.resolveCollision(entity);

     }
     var result = new Vector2(-Math.sin(this.direction), Math.cos(this.direction)).cross(new Vector2(this.destX-this.x, this.destY-this.y));

     if (result > 0) this.setDirection(this.direction + (result < this.turnSpeed ? result : this.turnSpeed));
     else this.setDirection(this.direction - (-result < this.turnSpeed ? result : this.turnSpeed));*/

    this.lastX = this.x;
    this.lastY = this.y;

    //entity.x -= Math.sin(entity.direction) * entity.speed;
    //entity.y += Math.cos(entity.direction) * entity.speed;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    for (var i = 0; i < this.level.entities.length; i++) {
        var other = this.level.entities[i];

        var manifolds = new CollisionManifolds();

        var isColliding = false;

        //do {
            isColliding = this.isCollidingWithEntity(other, manifolds) && manifolds.maximumDisplacement != Number.MAX_VALUE;
            if (isColliding){
                var newPos = new Vector2(this.lastX, this.lastY).add(this.velocity.clone().normalise().scale(manifolds.maximumDisplacement-10))

                //console.log(manifolds.contactPointsB);
                //console.log(manifolds.maximumDisplacement);

                //new Vector2(this.x, this.y).print();

                this.x = newPos.x;
                this.y = newPos.y;

                this.x = this.lastX;
                this.y = this.lastY;

                //console.log("After: " + manifolds.maximumDisplacement);

            }
        //}while (isColliding);

    }

    //apply angular velocity

    this.setDirection(this.direction + this.angularVelocity);
    this.direction %= Math.PI*2;
};

Entity.prototype.setAlarm = function(index, ticks){
    this.alarms[index] = new AlarmData(this.aliveTime, ticks);
};

Entity.prototype.cancelAlarm = function(index){
    this.alarms.delete(index);
};

Entity.prototype.alarm = function(){
}