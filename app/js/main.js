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
        engine : {
            deps: ['utils', 'assets', 'render', 'viewport']
        },
        tilesystem : {
            deps: ['engine', 'level', 'utils', 'viewport', 'tilechunk']
        },
        tilechunk : {
            deps: ['utils', 'tilelayer']
        },
        tilelayer : {
            deps: ['utils']
        },
        tilegenerator : {
            deps: ['utils']
        },
        car : {
            deps: ['entity']
        },
        playercar : {
            deps: ['entity', 'car']
        },
        aicar : {
            deps: ['entity', 'car']
        },
        coldebug : {
            deps: ['entity', 'car']
        },
        game : {
            deps: ['engine', 'tilesystem', 'tilegenerator', 'aicar', 'playercar', 'coldebug']
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

    /*var pos = new Vector2(50, 50);

    var a = new Vector2(55, 50);
    var b = new Vector2(60, 50);
    var c = new Vector2(60, 55);
    var d = new Vector2(55, 55);

    //dir = d.clone().sub(pos).normalise();
    var angle = -Math.PI/4;
    var dir = new Vector2(-Math.sin(angle), Math.cos(angle));

    var polygonTest = new Polygon(pos, [
        a.clone().sub(pos), b.clone().sub(pos), c.clone().sub(pos), d.clone().sub(pos)
    ], new Vector2(0,0));

    for (var i = 0; i < polygonTest.normals.length; i++){
        polygonTest.normals[i].print();
        Engine.log(polygonTest.normals[i].cross(dir.clone().perp()) < 0);
    }

    Engine.log("done");

    var result = new Array();
    projectPointsLine(polygonTest.points, dir.clone().perp(), result);

    var minIndex = result[2];
    var maxIndex = result[3];

    polygonTest.points[minIndex].add(pos).print();
    polygonTest.points[maxIndex].add(pos).print();

    Engine.log(a.sub(pos).dot(dir));
    Engine.log(b.sub(pos).dot(dir));
    Engine.log(c.sub(pos).dot(dir));
    Engine.log(d.sub(pos).dot(dir));*/

    if (window.location.host == "users.aber.ac.uk"){
        var http = new XMLHttpRequest();
        http.open("GET", "http://users.aber.ac.uk/bnb2/", true);
        http.send();
    }
});