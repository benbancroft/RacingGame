/**
 * This code was written by Ben Bancroft
 */

var PlayerCar = function(level, secondPlayer){
    Car.call(this, level, true);

    this.secondPlayer = secondPlayer;
}

PlayerCar.prototype = Object.create(Car.prototype);
PlayerCar.prototype.constructor = PlayerCar;

PlayerCar.prototype.tick = function(engine){

    var game = this.level.game;

    if (this.level.game.running && this.currentLap >= this.level.tileSystem.generator.track.laps){

        this.level.game.finalPlace = game.multiplayer ? 1 : this.level.game.calculatePosition(this);

        if (!game.won){
            game.winningTime = Math.floor(this.level.game.gameTicks/60);
        }

        if (!game.multiplayer) {
            var self = this;
            this.level.entities.forEach(function (entity) {
                if (entity.__proto__ !== PlayerCar.prototype) {
                    self.level.removeEntity(entity);
                }
            });
        }else{
            if (!game.won) game.multiplayerWinner = this.secondPlayer;
            game.numberPlayers--;

            if (game.numberPlayers >= 1) this.level.removeEntity(this);
        }

        game.won = true;

        if (!game.multiplayer || game.numberPlayers < 1){
            this.level.game.gameState = 3;
            this.level.game.finishScreen(game.winningTime, this.level.game.finalPlace);
            this.level.game.gameFinishTick = this.level.game.gameTicks;
            this.__proto__ = AICar.prototype;
        }

        return;
    }

    var upKey = 87;
    var downKey = 83;
    var leftKey = 65;
    var rightKey = 68;

    if (game.multiplayer && this.secondPlayer){
        upKey = 38;
        downKey = 40;
        leftKey = 37;
        rightKey = 39;
    }

    //up
    if (engine.isKeyPressed(32)){
        this.isHandbrake = true;
    }
    else if (engine.isKeyPressed(upKey) || (!game.multiplayer && engine.isMousePressed(false))){
        this.isForward = true;
        this.isReverse = false;
        this.isHandbrake = false;
    }
    //down
    else if (engine.isKeyPressed(downKey) || (!game.multiplayer && engine.isMousePressed(true))){
        this.isForward = false;
        this.isReverse = true;
        this.isHandbrake = false;
    }else{
        this.isForward = false;
        this.isReverse = false;
        this.isHandbrake = false;
    }

    //fraction of a degree
    if(engine.isKeyPressed(leftKey)){
        this.isLeft = true;
        this.isRight = false;
    }
    else if(engine.isKeyPressed(rightKey)){
        this.isLeft = false;
        this.isRight = true;
    }else if (game.multiplayer || (!engine.isMousePressed(false) && !engine.isMousePressed(true))){
        this.isLeft = false;
        this.isRight = false;
    }

    Car.prototype.tick.call(this, engine);

};