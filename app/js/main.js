require.config({
    baseUrl: 'js',

    shim: {
        utils : {
            deps: []
        },
        assets : {
            deps: []
        },
        render : {
            deps: []
        },
        renderable : {
            deps: []
        },
        entity : {
            deps: ['renderable']
        },
        level : {
            deps: ['renderable', 'entity']
        },
        viewport : {
            deps: ['render', 'level', 'utils']
        },
        playerviewport: {
            deps: ['viewport']
        },
        button : {
            deps: ['guicomponent']
        },
        guicomponent : {
            deps: ['render', 'utils']
        },
        engine : {
            deps: ['utils', 'assets', 'render', 'viewport', 'guicomponent']
        },
        tilesystem : {
            deps: ['engine', 'level', 'utils', 'viewport', 'tilechunk']
        },
        tilechunk : {
            deps: ['utils', 'tilelayer']
        },
        tilelayer : {
            deps: ['utils', 'renderable']
        },
        tilegenerator : {
            deps: ['utils']
        },
        car : {
            deps: ['entity']
        },
        carfactory : {
            deps: ['car']
        },
        playercar : {
            deps: ['entity', 'car']
        },
        aicar : {
            deps: ['entity', 'car']
        },
        game : {
            deps: ['engine', 'tilesystem', 'tilegenerator', 'aicar', 'playercar', 'carfactory', 'playerviewport', 'button']
        }
    }
});

// Start the main app logic.
require(['engine', 'game'], function () {
    var game = new Game();

    document.onkeydown = function(event) {
        var key = event.keyCode || event.which;

        game.keyDown(key);
    }

    document.onkeyup = function(event) {
        var key = event.keyCode || event.which;

        game.keyUp(key);
    }

    document.oncontextmenu = function (event) {
        event.preventDefault();
    };

    document.onmousemove = function(event) {
        game.mouseMove(event.clientX, event.clientY);
    }

    document.onmousedown = function(event) {
        game.mouseDown(event.clientX, event.clientY, event.button);
    }

    document.onmouseup = function(event) {
        game.mouseUp(event.clientX, event.clientY, event.button);
    }

    document.ontouchstart = function(event) {
        for (var i = 0; i < event.touches.length; i++){
            var item = event.touches.item(i);
            game.mouseDown(item.clientX, item.clientY, 0);
        }
    }

    document.ontouchend = function(event) {
        for (var i = 0; i < event.touches.length; i++){
            var item = event.touches.item(i);
            game.mouseUp(item.clientX, item.clientY, 0);
        }
    }

    if (window.location.host == "users.aber.ac.uk"){
        var http = new XMLHttpRequest();
        http.open("GET", "http://users.aber.ac.uk/bnb2/", true);
        http.send();
    }
});