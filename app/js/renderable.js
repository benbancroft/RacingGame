/**
 * This code was written by Ben Bancroft
 */

Renderable = function(depth){
    this.depth = depth;
}

//Define base method - most likely will be overwritten
Renderable.prototype.render = function(renderer){};