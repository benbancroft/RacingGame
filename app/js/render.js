//Globals

var canvas;
var textCanvas;
var textCtx;
var gl;
var soundContext;
var volume;

//Misc

function resizeCanvas() {
    textCanvas.width = canvas.width = window.innerWidth;
    textCanvas.height = canvas.height = window.innerHeight;
}

var TextAlign = {
    START: 0, END: 1, LEFT: 2, CENTRE: 3, RIGHT: 4
};

//Render state

var Renderer = function(){

    //logic

    canvas = document.getElementById("canvas");
    textCanvas = document.getElementById("text");
    textCtx = textCanvas.getContext("2d");
    resizeCanvas();
    gl = canvas.getContext("experimental-webgl");

    if (!gl){
        Engine.log("Browser does not support WebGL - cannot run game.");
        return;
    }

    soundContext = new AudioContext();
    volume = soundContext.createGain();
    volume.connect(soundContext.destination);

    this.setFont("Arial", 32);

    //current shader
    this.shader = null;
    this.shaderType = null;

    //GLSL
    //All shaders
    this.colourLocation = null;
    this.useColourBlendLocation = null;
    this.resolutionLocation = null;
    this.dimensionLocation = null;
    this.depthLocation = null;
    this.textureSampleLocation = null;
    this.useViewportLocation = null;
    this.viewportSettings = null;
    this.viewportSceneSettings = null;

    //Draw shader
    this.useColourLocation = null;
    this.positionLocation = null;
    this.uvLocation = null;
    this.centreLocation = null;
    this.rotationLocation = null;

    //Tile shader
    this.tileMapSquareSizeLocation = null;
    this.tileMapChunkSizeLocation = null;
    this.tileSheetSquareSizeLocation = null;
    this.tileMapOffsetLocation = null;
    this.tileMapSeperationLocation = null;
    this.tileMapLocation = null;
    this.tileSheetSizeLocation = null;

    this.verticiesLocation = null;

    //States

    this.useColour = false;
    this.useColourBlend = false;
    this.useAlphaState = true;

    this.textureURL = "";
    this.currentTexture = null;
    this.colour = new Vector4(1.0, 1.0, 1.0, 1.0);

    this.centrePosition = new Vector2(0.0, 0.0);

    this.currentSpriteURL = "";
    this.currentSpriteIndex = 0;
    this.setupForSprite = false;

    this.rotation = 0;

    this.resolution = new Vector2(canvas.width, canvas.height);

    this.useViewport = false;
    this.vpTopLeft = new Vector2(0.0, 0.0);
    this.vpDimensions = new Vector2(0.0, 0.0);

    this.vpsTopLeft = new Vector2(0.0, 0.0);
    this.vpsDimensions = new Vector2(0.0, 0.0);

    //Load stuff

    Shaders.load("assets/shaders/draw");
    Shaders.load("assets/shaders/tile");

    window.requestAnimationFrame(this.animate.bind(this));

    textCtx.textBaseline = 'middle';

};

Renderer.prototype.resetRenderer = function(isDraw){
    if (isDraw){
        gl.clear(gl.COLOR_BUFFER_BIT/* | DEPTH_BUFFER_BIT*/);
        //glClearColor(1.0f, 0.0f, 0.0f, 0.0f);
        this.setShader("assets/shaders/draw", Shaders.Types.DRAW, true);

        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    }
    gl.disable(gl.CULL_FACE);
    this.setUseAlpha(false, true);
    this.setUseColourBlending(false, true);
    //glEnable(DEPTH_TEST);
    gl.enable(gl.BLEND);
    //glBlendFunc(SRC_ALPHA, ONE);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //glBlendFunc(SRC_ALPHA, DST_ALPHA);
};

Renderer.prototype.initiseRenderer = function(){
    //set unform locations
    this.colourLocation = gl.getUniformLocation(this.shader.program, "u_colour");
    this.useColourBlendLocation = gl.getUniformLocation(this.shader.program, "u_useColourBlend");
    this.resolutionLocation = gl.getUniformLocation(this.shader.program, "u_resolution");
    this.dimensionLocation = gl.getUniformLocation(this.shader.program, "u_dimension");
    this.depthLocation = gl.getUniformLocation(this.shader.program, "u_depth");
    this.textureSampleLocation = gl.getUniformLocation(this.shader.program, "u_textureSample");
    this.useViewportLocation = gl.getUniformLocation(this.shader.program, "u_useViewport");
    this.viewportSettings = gl.getUniformLocation(this.shader.program, "u_viewport");
    this.viewportSceneSettings = gl.getUniformLocation(this.shader.program, "u_viewportScene");
    this.positionLocation = gl.getUniformLocation(this.shader.program, "u_position");

    if (this.shaderType == Shaders.Types.DRAW){
        this.uvLocation = gl.getUniformLocation(this.shader.program, "u_uvs");
        this.rotationLocation = gl.getUniformLocation(this.shader.program, "u_rotation");
        this.centreLocation = gl.getUniformLocation(this.shader.program, "u_centre");
        this.useColourLocation = gl.getUniformLocation(this.shader.program, "u_useColour");
    }

    if (this.shaderType == Shaders.Types.TILE){
        this.tileMapSquareSizeLocation = gl.getUniformLocation(this.shader.program, "u_mapSquareSize");
        this.tileMapChunkSizeLocation = gl.getUniformLocation(this.shader.program, "u_mapChunkSize");
        this.tileSheetSquareSizeLocation = gl.getUniformLocation(this.shader.program, "u_tileSheetSquareSize");
        this.tileMapOffsetLocation = gl.getUniformLocation(this.shader.program, "u_mapOffsetSize");
        this.tileMapSeperationLocation = gl.getUniformLocation(this.shader.program, "u_mapSeperationSize");
        this.tileMapLocation = gl.getUniformLocation(this.shader.program, "u_mapTile");
        this.tileSheetSizeLocation = gl.getUniformLocation(this.shader.program, "u_tileSheetSize");
    }

    this.verticiesLocation = gl.getAttribLocation(this.shader.program, "a_verticies");
    gl.enableVertexAttribArray(this.verticiesLocation);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.vertexAttribPointer(this.verticiesLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0]), gl.STATIC_DRAW);

    if (this.shaderType == Shaders.Types.DRAW){
        this.setUseColour(false, true);
    }

    this.setResolution(this.resolution, true);
    this.setColour(this.colour, true);

    this.setUseAlpha(this.useAlphaState, true);

    this.setCentre(this.centrePosition, false, true);

    this.setRotation(this.rotation, true);

    this.setUseViewport(this.useViewport, true);
    this.setViewport(this.vpTopLeft, this.vpDimensions, true);
    //check difference
    this.setViewportScene(this.vpsTopLeft, this.vpsDimensions, true);

    this.setTexture(this.textureURL, false, true);
    gl.uniform1i(this.textureSampleLocation, 0);

    /*SetDimensions(dimensions, false, true);
     SetDepth(depth, true);

     engine.DrawUseAlpha(true);
     engine.DrawUseColourBlending(false);*/

    /*gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);*/

    this.resetRenderer(false);
};

Renderer.prototype.setShader = function(url, type, force){
    if (!force && url == this.shader.url) return;
    var shader = Shaders.get(url);
    if (shader != null && this.shader != shader){
        this.shader = shader;
        gl.useProgram(shader.program);
    }
    if (this.shaderType != type){
        this.shaderType = type;
        this.initiseRenderer();
    }
}

//Rendering

Renderer.prototype.setResolution = function(resolution, force){
    if (!force && resolution == this.resolution) return;
    this.resolution = resolution;
    gl.uniform2f(this.resolutionLocation, resolution.x, resolution.y);
};

Renderer.prototype.getResolution = function(){
    return this.resolution;
};

Renderer.prototype.setUseColour = function(useColourState, forSprite, force){
    if (force == true || useColourState != this.useColour){
        this.useColour = useColourState;
        if (this.shaderType == Shaders.Types.DRAW){
            gl.uniform1i(this.useColourLocation, useColourState ? 1 : 0);
        }
    }
    this.setupForSprite = forSprite;
};

Renderer.prototype.setColour = function(colour, force){
    //Colour is vector4
    if (force == true || this.colour.equals(colour) == false){
        this.colour = colour;
        gl.uniform4f(this.colourLocation, colour.x, colour.y, colour.z, colour.w);
    }
};

Renderer.prototype.setCentre = function(centre, forSprite, force){
    //Colour is vector4
    if (force == true || this.centrePosition.equals(centre) == false){
        this.centrePosition = centre;
        if (this.shaderType == Shaders.Types.DRAW) gl.uniform2f(this.centreLocation, centre.x, centre.y);
    }
    this.setupForSprite = forSprite;
};

Renderer.prototype.setUseAlpha = function(state, force){
    if (!force && state == this.useAlphaState) return;
    if (state == true){
        gl.enable(gl.BLEND);
    }else{
        gl.disable(gl.BLEND);
    }
    this.useAlphaState = state;
};

Renderer.prototype.setUseColourBlending = function(state, force){
    if (!force && state == this.useColourBlendState) return;
    this.useColourBlendState = state;
    gl.uniform1i(this.useColourBlendLocation, state ? 1 : 0);
};

Renderer.prototype.setTexture = function(url, forSprite, force){
    if ((force == true || url != this.textureURL) && url != null){
        var asset = Assets.get(url);
        if (asset != null && asset.type == Assets.Type.TEXTURE){
            this.textureURL = url;
            this.currentTexture = asset.contents;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.currentTexture.glTexture);
        }
    }else if (url == null){
        this.textureURL = null;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    this.setupForSprite = forSprite;
};

Renderer.prototype.setDimensions = function(newDimensions, forSprite, force){
    if (force == true || newDimensions.equals(this.dimensions) == false){
        this.dimensions = newDimensions;
        gl.uniform2f(this.dimensionLocation, this.dimensions.x, this.dimensions.y);
    }
    this.setupForSprite = forSprite;
}

Renderer.prototype.setRotation = function(rotation, force){
    if (force == true || rotation != this.rotation){
        this.rotation = rotation;
        var rotationMatrix = new Matrix2(Math.cos(rotation), -Math.sin(rotation), Math.sin(rotation), Math.cos(rotation));
        if (this.shaderType == Shaders.Types.DRAW) gl.uniformMatrix2fv(this.rotationLocation, false, rotationMatrix.toArray());
    }
}

Renderer.prototype.setUVs = function(topLeftCorner, bottomRightCorner, forSprite, force){
    if (this.currentTexture != null){
        if (force == true || topLeftCorner.equals(this.uvTopLeft) == false || bottomRightCorner.equals(this.uvBottomRight) == false){
            var textureDims = new Vector2(this.currentTexture.width, this.currentTexture.height);

            this.uvTopLeft = topLeftCorner;
            this.uvBottomRight = bottomRightCorner;

            var v1 = toUVSpace(topLeftCorner, textureDims);
            var v2 = toUVSpace(bottomRightCorner, textureDims);

            var uvs = new Matrix2(v1.x, v1.y, v2.x, v2.y);
            if (this.shaderType == Shaders.Types.DRAW){
                gl.uniformMatrix2fv(this.uvLocation, false, uvs.toArray());
            }
        }
    }
    this.setupForSprite = forSprite;
};

//Viewport

Renderer.prototype.setUseViewport = function(useViewportState, force){
    if (force == true || useViewportState != this.useViewport){
        this.useViewport = useViewportState;
        gl.uniform1i(this.useViewportLocation, useViewportState ? 1 : 0);
    }
};

Renderer.prototype.setViewport = function(position, dimensions, force){
    //dimensions is Vector2 and so is position
    if (force == true || this.vpTopLeft.equals(position) == false || this.vpDimensions.equals(dimensions) == false){

        this.vpTopLeft = position;
        this.vpDimensions = dimensions;

        var viewport = new Matrix2(this.vpTopLeft.x, this.vpTopLeft.y, this.vpDimensions.x, this.vpDimensions.y);
        gl.uniformMatrix2fv(this.viewportSettings, false, viewport.toArray());
    }
};

Renderer.prototype.setViewportScene = function(position, dimensions, force){
    //dimensions is Vector2 and so is position
    if (force == true || this.vpsTopLeft.equals(position) == false || this.vpsDimensions.equals(dimensions) == false){

        this.vpsTopLeft = position;
        this.vpsDimensions = dimensions;

        var viewport = new Matrix2(this.vpsTopLeft.x, this.vpsTopLeft.y, this.vpsDimensions.x, this.vpsDimensions.y);
        gl.uniformMatrix2fv(this.viewportSceneSettings, false, viewport.toArray());
    }
};

Renderer.prototype.draw = function(position){
    gl.uniform2f(this.positionLocation, position.x, position.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

Renderer.prototype.setUseSprite = function (url, index, useDimensions){
    if (url != null && index != null){
        if (!this.setupForSprite || this.currentSpriteURL != url || this.currentSpriteIndex != index){
            var spriteSheet = Sprites.get(url);
            if (spriteSheet != null){
                var sprite = spriteSheet.sprites[index];

                this.currentSpriteURL = url;
                this.currentSpriteIndex = index;

                this.setTexture(spriteSheet.texture, true, true);

                var topCorner = new Vector2(sprite.x, sprite.y);

                this.setUVs(topCorner, new Vector2(topCorner.x + sprite.width, topCorner.y + sprite.height), true, true);

                this.setUseColour(false);

                if (useDimensions) this.setDimensions(new Vector2(sprite.width, sprite.height));

                this.setCentre(new Vector2(sprite.centreX / sprite.width * this.dimensions.x, sprite.centreY / sprite.height * this.dimensions.y), true);
            }
        }
    }
};

Renderer.prototype.drawTileChunk = function(location, tileSheet, squareSize, chunkSize, chunkData, depth){

    this.setShader("assets/shaders/tile", Shaders.Types.TILE);

    this.setDimensions(new Vector2(chunkSize, chunkSize).scale(squareSize));
    //this.setDepth(depth);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.textureSampleLocation, 0);
    this.setTexture(tileSheet, true);

    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(this.tileMapLocation, 1);
    gl.bindTexture(gl.TEXTURE_2D, chunkData);

    gl.uniform1f(this.tileMapSquareSizeLocation, squareSize);
    gl.uniform1f(this.tileMapChunkSizeLocation, chunkSize);
    gl.uniform2f(this.tileMapOffsetLocation, 0, 0);
    gl.uniform2f(this.tileMapSeperationLocation, 2, 2);
    gl.uniform1f(this.tileSheetSquareSizeLocation, 32.0);
    gl.uniform2f(this.tileSheetSizeLocation, 1024.0, 1024.0);

    this.draw(location.clone().scale(chunkSize*squareSize));
};

Renderer.prototype.setTextAlign = function(alignment){
    var alignString = "";

    switch (alignment){
        case TextAlign.START:
            alignString = "start";
            break;
        case TextAlign.END:
            alignString = "end";
            break;
        case TextAlign.LEFT:
            alignString = "left";
            break;
        case TextAlign.CENTRE:
            alignString = "center";
            break;
        case TextAlign.RIGHT:
            alignString = "right";
            break;
    }

    textCtx.textAlign = alignString;
};

Renderer.prototype.setFont = function(name, size){
    textCtx.font = size + "px " + name;
};

Renderer.prototype.drawText = function(text, location){
    textCtx.fillStyle = "rgba(" + Math.floor(this.colour.x*256) + ", " + Math.floor(this.colour.y*256) + ", " + Math.floor(this.colour.z*256) + ", " + Math.floor(this.colour.w*256) + ")";
    textCtx.fillText(text, location.x, location.y);
};