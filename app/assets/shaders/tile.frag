#ifdef GL_ES
precision mediump float;
//precision mediump int;
#endif

varying vec2 vTextureCoord;
varying vec4 vDebugColour;

uniform vec4 u_colour;
uniform bool u_useColourBlend;
uniform sampler2D u_textureSample;
uniform vec2 u_resolution;
uniform vec2 u_dimension;


uniform sampler2D u_mapTile;

uniform vec2 u_mapSize;
uniform float u_mapChunkSize;
uniform vec2 u_tileSheetSize;
uniform float u_tileSheetSquareSize;
uniform float u_mapSquareSize;
uniform float u_mapTileSize;
uniform vec2 u_mapOffsetSize;
uniform vec2 u_mapSeperationSize;

varying vec2 vMapScaleFactor;

uniform bool u_useViewport;
uniform mat2 u_viewport;
uniform mat2 u_viewportScene;

void main() {

    vec2 sf = vMapScaleFactor;

    vec4 tile = texture2D(u_mapTile, vTextureCoord);

    if(tile.b != 1.0) {
        discard;
    }

    vec2 spriteOffset = (tile.xy * 256.0) * (u_tileSheetSquareSize + u_mapSeperationSize.xy);
    vec2 spriteCoord = mod(vTextureCoord * u_mapChunkSize * u_mapSquareSize, u_mapSquareSize)/u_mapSquareSize*u_tileSheetSquareSize;
    gl_FragColor = texture2D(u_textureSample, (spriteOffset + spriteCoord - 0.1) / (u_tileSheetSize.xy + (u_tileSheetSize.xy / u_tileSheetSquareSize) * u_mapSeperationSize.xy));

}