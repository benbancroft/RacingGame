/**
 * Created by ben on 04/02/16.
 */

//Globals

//Engine

var Engine = function(){

    Renderer.call(this);

    this.unprocessedFrames = 0.0;
    this.lastTime = 0.0;
    this.isLoaded = false;

    this.viewports = new Array();
    this.levels = new Array();

    this.guiComponents = new Array();

    this.keys = new Map();
};

Engine.prototype = Object.create(Renderer.prototype);
Engine.prototype.constructor = Engine;

//Static definitions

Engine.Colours = {
    Red: [1,0,0,1]
};

//Static methods

Engine.log = function (message) {
    console.log(message);
};

Engine.random = function(lower, upper){
    return Math.floor((Math.random()*(upper - lower)) + lower);
};

//prototype methods

//API

Engine.prototype.registerGuiComponent = function(component){
    this.guiComponents.push(component);
    return component;
};

Engine.prototype.unregisterGuiComponents = function(){
    this.guiComponents.clear();
};

Engine.prototype.registerViewport = function(viewport){
    this.viewports.push(viewport);
    return viewport;
};

Engine.prototype.unregisterViewport = function(viewport){
    this.viewports.removeElement(viewport);
};

Engine.prototype.unregisterViewports = function(){
    this.viewports.clear();
};

Engine.prototype.registerLevel = function(level){
    this.levels.push(level);

    return level;
}

Engine.prototype.unregisterLevels = function(){
    this.levels.clear();
};

Engine.prototype.isKeyPressed = function(keycode){

    var keyState = this.keys.get(keycode);

    if (!keyState) return false;

    return keyState;
};

//Engine

Engine.prototype.tick = function () {
    for (var i = 0; i < this.levels.length; i++) {
        this.levels[i].tick(this);
    }
};

Engine.prototype.keyDown = function (keycode) {
    this.keys.set(keycode, true);
    for (var i = 0; i < this.levels.length; i++) {
        this.levels[i].keyDown(keycode);
    }
};

Engine.prototype.keyUp = function (keycode) {
    this.keys.set(keycode, false);
    for (var i = 0; i < this.levels.length; i++) {
        //this.levels[i].keyDown(keycode);
    }
};

Engine.prototype.mouseMove = function(x, y){
    var position = new Vector2(x, y);

    for (var i = 0; i < this.guiComponents.length; i++) {
        var component = this.guiComponents[i];

        component.isHover = position.greaterThanEqual(component.position.clone().sub(component.dimensions.clone().scale(0.5))) && position.lessThanEqual(component.position.clone().add(component.dimensions.clone().scale(0.5)));

        if (component.isHover) component.onHover();
    }
};

Engine.prototype.mouseDown = function(x, y){
    var position = new Vector2(x, y);

    for (var i = 0; i < this.guiComponents.length; i++) {
        var component = this.guiComponents[i];

        if (component.isHover) component.onPress(position.clone().sub(component.position.clone().sub(component.dimensions.clone().scale(0.5))));
    }
};

Engine.prototype.renderGui = function(){
    for (var i = 0; i < this.guiComponents.length; i++) {
        this.guiComponents[i].render(this);
    }
};

Engine.prototype.render = function () {
    this.resetRenderer(true);

    for (var i = 0; i < this.viewports.length; i++) {
        this.viewports[i].render(this);
    }

    this.renderGui();
};

Engine.prototype.loaded = function () {
};

Engine.prototype.animate = function (time) {
    //try {
        var now = new Date().getTime();
        this.unprocessedFrames += (now - this.lastTime) * 60.0 / 1000.0; //60 fps
        this.lastTime = now;

        if (Assets.areLoaded() == true){
            if (this.isLoaded == false){
                Engine.log("Engine Loaded");
                this.isLoaded = true;
                this.setShader("assets/shaders/draw", Shaders.Types.DRAW, true);
                this.loaded();
            }
         }

        if (this.isLoaded == true ){
            if (this.unprocessedFrames > 10.0) this.unprocessedFrames = 10.0;
            while (this.unprocessedFrames > 1.0) {
                this.tick();
                this.unprocessedFrames -= 1.0;
            }
            this.render();
        }

        window.requestAnimationFrame(this.animate.bind(this));
    /*}catch (e) {
        Engine.log(e);
    }*/
};