/**
 * Alarm structure
 * @param startTime
 * @param delay
 * @constructor
 */
var AlarmData = function (startTime, delay){
    this.startTime = startTime;
    this.delay = delay;
};

/**
 * Entity base prototype
 * @param level level that contains entity
 * @param depth draw depth
 * @constructor
 */
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

    this.mass = 1;
    this.density = 0.001;

    //Elasticity constant - set to 1 for fully elastic collision
    this.elasticity = 0.2;

    this.spriteSheet = "";
    this.spriteIndex = 0;

    this.viewportsFollowing = new Array();
    this.alarms = new Map();
};

Entity.prototype = Object.create(Renderable.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.decontructor = function(){

};

Entity.prototype.addRenderable = function(level){
    level.addRenderable(this);
}

Entity.prototype.setPosition = function(position){
    this.x = position.x;
    this.y = position.y;
};

Entity.prototype.addViewportTrack = function(viewport){
    if (viewport.level == this.level && !this.viewportsFollowing.find(function(element) { return element == viewport})){
        viewport.followingEntity = this;
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

Entity.prototype.getPosition = function(){
   return new Vector2(this.x, this.y);
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

    renderer.setShader("assets/shaders/draw", Shaders.Types.DRAW);

    renderer.setUseColour(false);
    renderer.setDimensions(new Vector2(this.width, this.height));

    renderer.setUseSprite(this.spriteSheet, this.spriteIndex);

    renderer.setRotation(this.direction, true);

    renderer.draw(new Vector2(this.x, this.y));
};

Entity.prototype.tick = function(engine){

    this.lastX = this.x;
    this.lastY = this.y;
    this.hasCollided = false;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    for (var i = 0; i < this.level.entities.length; i++) {
        var other = this.level.entities[i];

        var manifolds = new CollisionManifolds();

        var isColliding = false;

        isColliding = this.isCollidingWithEntity(other, manifolds) && manifolds.maximumDisplacement != Number.MAX_VALUE;
        if (isColliding){
            this.hasCollided = true;
            var newPos = new Vector2(this.lastX, this.lastY).add(this.velocity.clone().normalise().scale(manifolds.maximumDisplacement-0.1))

            this.x = newPos.x;
            this.y = newPos.y;

            var maxRadiusA = 0;
            var maxRadiusB = 0;

            var minCollPointA = new Vector2();
            var minCollPointB = new Vector2();

            var maxCollPointA = new Vector2();
            var maxCollPointB = new Vector2();

            manifolds.contactPointsA.forEach(function(p){
                maxRadiusA = Math.max(maxRadiusA, p.len());

                minCollPointA = p.minPoint(minCollPointA)
                maxCollPointA = p.maxPoint(maxCollPointA)

            });
            manifolds.contactPointsB.forEach(function(p){
                maxRadiusB = Math.max(maxRadiusB, p.len());

                minCollPointB = p.minPoint(minCollPointB)
                maxCollPointB = p.maxPoint(maxCollPointB)
            });

            var midPointA = minCollPointA.midPoint(maxCollPointA);
            var midPointB = minCollPointA.midPoint(maxCollPointB);

            //Linear momentum

            //Based on physics derived at:
            //http://www.myphysicslab.com/collision.html#resting_contact

            var aI = 4/3 * this.bbWidth * this.bbHeight * (Math.pow(this.bbWidth, 2) + Math.pow(this.bbHeight, 2)) * this.density;
            var bI = 4/3 * other.bbWidth * other.bbHeight * (Math.pow(other.bbWidth, 2) + Math.pow(other.bbHeight, 2)) * other.density;

            var n = maxCollPointB.clone().sub(minCollPointB).perp().normalise().reverse();
            var firstElement = manifolds.contactEdgeNormalsB[0];
            if (manifolds.contactPointsB.length == 1 && firstElement){
                n = firstElement;
            }else{
                n = this.velocity.clone().normalise().reverse();
            }
            //var n = this.velocity.clone().normalise().reverse();

            var velocityOnPoint = this.velocity.clone().add(other.velocity.clone().sub(cross(this.angularVelocity, midPointA).add(cross(other.angularVelocity, midPointB))));
            var velocityOnPointProjection = velocityOnPoint.dot(n); //negative projection means they are moving towards each other
            if (velocityOnPointProjection < 0) { //Bases on projection, check if they moving apart
                //Normal impulse
                var j = -this.elasticity*velocityOnPointProjection / (Math.pow(midPointA.cross(n), 2) / aI + Math.pow(midPointB.cross(n), 2) / bI + 1/this.mass + 1/other.mass);
                var jn = n.clone().scale(j);

                this.velocity.add(jn.clone().divScalar(this.mass));
                this.angularVelocity += midPointA.cross(jn) / aI;
                other.velocity.sub(jn.clone().divScalar(other.mass));
                other.angularVelocity -= midPointB.cross(jn) / bI;
            }

        }
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