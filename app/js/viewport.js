var Viewport = function(level, x, y, width, height, levelX, levelY, levelWidth, levelHeight){
    this.level = level;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.levelX = levelX;
    this.levelY = levelY;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;

    this.followingEntity = null;
};

Viewport.prototype.render = function(renderer){
    renderer.setViewport(new Vector2(this.x, this.y), new Vector2(this.width, this.height));
    renderer.setViewportScene(new Vector2(this.levelX, this.levelY), new Vector2(this.levelWidth, this.levelHeight));
    renderer.setUseViewport(true);

    this.level.render(renderer, this);

    renderer.setUseViewport(false);

    //Engine.log("render");
};

Viewport.prototype.followEntity = function(entity){

    this.levelX = this.levelWidth - entity.x;
    this.levelY = this.levelHeight - entity.y;
};