//Assets

var assetRegister = new Array();

function Asset (url, type) {
    this.url = url;
    this.isLoaded = false;
    this.type = type;
    this.contents = null;
}

function ShaderProgram (url) {
    this.vertex = null;
    this.fragment = null;
    this.program = null;
    this.url = url;
    this.setShader = function(shader, type) {
        if (type == gl.VERTEX_SHADER){
            this.vertex = shader;
        }else{
            this.fragment = shader;
        }
    };
}

function Texture (url, width, height, glTexture) {
    this.width = width;
    this.height = height;
    this.glTexture = glTexture;
    this.url = url;
}

function SpriteSheet (url, texture, sprites) {
    this.url = url;
    this.texture = texture;
    this.sprites = sprites;
    this.getSprite = function(index) {
        if (index < sprites.length){
            return sprites[index];
        }else{
            return null;
        }
    };
}

function Sprite (name, x, y, centreX, centreY, width, height){
    this.name = name;
    this.x = x;
    this.y = y;
    this.centreX = centreX;
    this.centreY = centreY;
    this.width = width;
    this.height = height;
}

function Sound(buffer){
    this.buffer = buffer;
}

function RaceTrack(name, difficulty, startOrientation, nodes, laps){
    this.name = name;
    this.difficulty = difficulty;
    this.startOrientation = startOrientation;
    this.nodes = nodes;
    this.laps = laps
}

//Race Track Nodes

var NodeType = {
    FINISH: 1, START: 2, STRAIGHT: 3, CORNER: 4, CROSS: 5
};

function TrackNode (type) {
    this.type = type;
}

//Finish

function FinishTrackNode () {

    TrackNode.call(this, NodeType.FINISH);
}
FinishTrackNode.prototype = Object.create(TrackNode.prototype);
FinishTrackNode.prototype.constructor = FinishTrackNode;

//Start

function StartTrackNode (range) {
    this.range = range;

    TrackNode.call(this, NodeType.START);
}
StartTrackNode.prototype = Object.create(TrackNode.prototype);
StartTrackNode.prototype.constructor = StartTrackNode;

//Straight

function StraightTrackNode (range) {
    this.range = range;

    TrackNode.call(this, NodeType.STRAIGHT);
}
StraightTrackNode.prototype = Object.create(TrackNode.prototype);
StraightTrackNode.prototype.constructor = StraightTrackNode;

//Corner

function CornerTrackNode (orientation) {
    this.orientation = orientation;

    TrackNode.call(this, NodeType.CORNER);
}
CornerTrackNode.prototype = Object.create(TrackNode.prototype);
CornerTrackNode.prototype.constructor = CornerTrackNode;

//Cross

function CrossTrackNode () {
    TrackNode.call(this, NodeType.CROSS);
}
CrossTrackNode.prototype = Object.create(TrackNode.prototype);
CrossTrackNode.prototype.constructor = CrossTrackNode;

var Assets = {

    Type: {
        SHADER: 0, TEXTURE: 1, SPRITE_SHEET: 2, TILE_SHEET: 3, SOUND: 4, RACE_TRACK: 5
    },

    add: function(url, type) {

        var asset = new Asset(url, type);
        assetRegister.push(asset);

        return asset;
    },

    get: function(url) {
        for (var i = 0; i < assetRegister.length; i++) {
            if(assetRegister[i].url == url){
                return assetRegister[i];
            }
        }
        return null;
    },

    getAll: function(type) {
        return assetRegister.filter(function(item){
            return item.type == type;
        });
    },

    set: function(url, contents) {
        var asset = this.get(url);

        if (asset != null) asset.contents = contents;
    },

    setLoaded: function(url) {
        var asset = Assets.get(url);
        if (asset != null){
            asset.isLoaded = true;
        }else{
            Engine.log("Failed getting asset: " + assetRegister[i].url);
        }
    },

    areLoaded: function() {
        var loaded = true;
        for (var i = 0; i < assetRegister.length; i++) {
            if (!assetRegister[i].isLoaded){
                loaded = false;
            }
        }
        return loaded;
    }
};

var Shaders = {

    Types: {
        DRAW: 0,
        TILE: 1
    },

    create: function(url){
        var program = new ShaderProgram(url);
        //shaderPrograms.push(program);
        Assets.add(url, Assets.Type.SHADER);
        Assets.set(url, program);
    },

    register: function(url, type, shader) {
        var program = Shaders.get(url);
        if (program == null){
            program = Shaders.create(url);
        }
        program.setShader(shader, type);
        Engine.log("Registered shader: " + url + " of type: " + Shaders.getTypeName(type));

        Shaders.attemptLink(url);

        return program;
    },

    load: function (url){
        Shaders.create(url);
        Shaders.load_type(url, gl.VERTEX_SHADER);
        Shaders.load_type(url, gl.FRAGMENT_SHADER);
    },

    load_type: function(url, type) {

        var s = this;
        var request = new XMLHttpRequest();

        var extension = "";
        if (type == gl.VERTEX_SHADER){
            extension = ".vert";
        }else{
            extension = ".frag";
        }

        request.open('GET', url + extension, true);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                var shader = gl.createShader(type);
                gl.shaderSource(shader, request.responseText);
                gl.compileShader(shader);

                var program = Shaders.register(url, type, shader);

            }
        };
        request.send(null);
    },

    attemptLink: function(url){
        var program = Shaders.get(url);
        if (program != null && program.vertex != null && program.fragment != null){
            program.program = Shaders.createProgram(gl, [program.vertex, program.fragment]);
            if (program.program == null) return;
            Engine.log("Linked shader program: " + url);
            Assets.setLoaded(url);
        }
    },

    createProgram: function(gl, shaders) {
        var program = gl.createProgram();
        for (var i = 0; i < shaders.length; i++) {
            gl.attachShader(program, shaders[i]);
        }
        gl.linkProgram(program);

        //Check link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            lastError = gl.getProgramInfoLog (program);
            Engine.log("Error in program linking: " + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    },

    get: function(url) {
        var asset = Assets.get(url);

        if (asset == null || asset.type != Assets.Type.SHADER) return null;

        return asset.contents;
    },

    getTypeName: function(type) {
        var typeName
        if (type == gl.VERTEX_SHADER){
            typeName = "Vertex";
        }else{
            typeName = "Fragment";
        }
        return typeName;
    }
};

var Textures = {

    load: function(url) {

        var image = new Image();
        image.onload = function() { Textures.handleTextureLoaded(url, image); }
        image.src = url + ".png";

        Assets.add(url, Assets.Type.TEXTURE);
    },

    handleTextureLoaded: function(url, image){

        var glTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        var texture = new Texture(url, image.width, image.height, glTexture);
        //textures.push(texture);

        Engine.log("Loaded texture: " + url);

        Assets.setLoaded(url);
        Assets.set(url, texture);
    },

    get: function(url) {
        var asset = Assets.get(url);

        if (asset == null || asset.type != Assets.Type.TEXTURE) return null;

        return asset.contents;
    }
};

var Sprites = {

    create: function(url, texture, sprites){
        var sheet = new SpriteSheet(url, texture, sprites);

        Textures.load(texture);

        Engine.log("Loaded SpriteSheet: " + url + " containing " + sprites.length + " sprites from texture: " + texture);

        Assets.setLoaded(url);
        Assets.set(url, sheet);
    },

    load: function(url) {

        Assets.add(url, Assets.Type.SPRITE_SHEET);

        var s = this;
        var request = new XMLHttpRequest();

        request.open('GET', url + ".json", true);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                var json = JSON.parse(request.responseText);

                var sprites = new Array();
                for (var i = 0; i < json.sprites.length; i++){
                    var spriteJson = json.sprites[i];
                    sprites.push(new Sprite(spriteJson.name, parseFloat(spriteJson.x), parseFloat(spriteJson.y), parseFloat(spriteJson.centreX), parseFloat(spriteJson.centreY), parseFloat(spriteJson.width), parseFloat(spriteJson.height)));
                }

                var spriteSheet = Sprites.create(url, json.texture, sprites);

            }
        };
        request.send(null);
    },

    get: function(url) {
        var asset = Assets.get(url);

        if (asset == null || asset.type != Assets.Type.SPRITE_SHEET) return null;

        return asset.contents;
    }
};

var Sounds = {

    create: function(url, buffer){
        var sound = new Sound(buffer);

        Engine.log("Loaded sound: " + url);

        Assets.setLoaded(url);
        Assets.set(url, sound);
    },

    load: function(url) {

        Assets.add(url, Assets.Type.SOUND);

        var request = new XMLHttpRequest();
        request.open('GET', url + ".ogg", true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            soundContext.decodeAudioData(request.response, function(buffer) {
                Sounds.create(url, buffer);
            }, function (e){
                Engine.log("Failed to load sound: " + url + ". Error: " + e.err);
            });
        }
        request.send();
    },

    get: function(url) {
        var asset = Assets.get(url);

        if (asset == null || asset.type != Assets.Type.SOUND) return null;

        return asset.contents;
    }
};


var Tracks = {

    create: function(url, name, difficulty, startOrientation, laps, nodes){
        var track = new RaceTrack(name, difficulty, startOrientation, nodes, laps);

        Engine.log("Loaded Race Track: " + name + " from: " + url + " containing " + nodes.length + " nodes");

        Assets.setLoaded(url);
        Assets.set(url, track);
    },

    load: function(url) {

        Assets.add(url, Assets.Type.RACE_TRACK);

        var s = this;
        var request = new XMLHttpRequest();

        request.open('GET', url + ".json", true);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                var json = JSON.parse(request.responseText);

                var nodes = new Array();
                for (var i = 0; i < json.nodes.length; i++){
                    var nodeJson = json.nodes[i];

                    switch(parseInt(nodeJson.type)){
                        case NodeType.FINISH:
                            nodes.push(new FinishTrackNode());
                            break;
                        case NodeType.START:
                            nodes.push(new StartTrackNode(parseInt(nodeJson.range)));
                            break;
                        case NodeType.STRAIGHT:
                            nodes.push(new StraightTrackNode(parseInt(nodeJson.range)));
                            break;
                        case NodeType.CORNER:
                            nodes.push(new CornerTrackNode(parseInt(nodeJson.orientation)));
                            break;
                        case NodeType.CROSS:
                            nodes.push(new CrossTrackNode());
                            break;
                    }
                }

                Tracks.create(url, json.name, parseInt(json.difficulty), parseInt(json.startOrientation), parseInt(json.laps), nodes);

            }
        };
        request.send(null);
    },

    get: function(url) {
        var asset = Assets.get(url);

        if (asset == null || asset.type != Assets.Type.RACE_TRACK) return null;

        return asset.contents;
    },

    getAll: function() {
        return Assets.getAll(Assets.Type.RACE_TRACK);
    }
};