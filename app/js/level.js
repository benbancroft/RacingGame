var Level = function(game, width, height, hasBounds){
    this.width = width;
    this.height = height;
    this.hasBounds = hasBounds;

    this.game = game;

    this.entities = new Array();
    this.renderables = new Array();

    this.tileSystem = null;

    this.firstGen = false;
};

Level.prototype.keyDown = function (keycode) {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].keyDown(keycode);
    }
};

Level.prototype.tick = function(engine){

    if (this.tileSystem != null && !this.firstGen) this.tileSystem.tick(engine.viewports);
    //this.firstGen = true;

    var entityMoveUpdate = function (entity) {

        for (var i = 0; i < entity.viewportsFollowing.length; i++) {
            entity.viewportsFollowing[i].followEntity(entity);
        }

    };

    var entityAlarmUpdate = function(entity){
        for (var index in entity.alarms) {
            var alarm = entity.alarms[index];
            var offset = entity.aliveTime - alarm.startTime;
            if(offset > alarm.delay){
                entity.alarms.delete(index);
                entity.alarm(parseInt(index));
            }
        }
    };

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entityAlarmUpdate(entity);
        entity.tick(engine);
        entity.aliveTime++;
        entityMoveUpdate(entity);

    }
};

Level.prototype.render = function(renderer, viewport){
    if (this.tileSystem != null) this.tileSystem.render(renderer, viewport);

    //todo - occlusion culling if this becomes a problem in future
    for (var i = 0; i < this.renderables.length; i++) {
        this.renderables[i].render(renderer);
    }
};

Level.prototype.addEntity = function(entity){
    this.entities.push(entity);
};

Level.prototype.removeEntity = function(entity){
    this.entities.removeElement(entity);
    this.renderables.removeElement(entity);
};

Level.prototype.setTileSystem = function(tileSystem){
    this.tileSystem = tileSystem;
};

Level.prototype.addRenderable = function(renderable){
    this.renderables.push(renderable);

    //Lets be lazy today...
    this.renderables.sort(function(val1, val2) {
        return val1.depth - val2.depth;
    })
};

Level.prototype.removeRenderable = function(renderable){
    this.renderables.removeElement(renderable);
};