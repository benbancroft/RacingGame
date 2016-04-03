Renderable = function(depth){
    this.depth = depth;
}

//Define base method - most likely will be overwritten
Renderable.prototype.render = function(renderer){};