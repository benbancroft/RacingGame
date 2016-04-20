/**
 * This code was written by Ben Bancroft
 */

#ifdef GL_ES
precision mediump float;
//precision mediump int;
#endif

attribute vec2 a_verticies;

varying vec2 vTextureCoord;
varying vec2 vMapOffset;
varying vec4 vDebugColour;

uniform vec2 u_resolution;
uniform vec2 u_dimension;
uniform vec2 u_position;
uniform int u_depth;

uniform vec2 u_mapSize;
uniform float u_mapChunkSize;
uniform float u_mapSquareSize;
uniform vec2 u_mapOffsetSize;
uniform vec2 u_mapSeperationSize;

varying vec2 vMapScaleFactor;

uniform bool u_useViewport;
uniform mat2 u_viewport;
uniform mat2 u_viewportScene;


vec2 getUV(mat2 uvs, vec2 position){
	if (position == vec2(0, 0)){
		return vec2(uvs[0][0], uvs[0][1]);
	}else if(position == vec2(0, 1)){
		return vec2(uvs[0][0], uvs[1][1]);
	}else if(position == vec2(1, 0)){
		return vec2(uvs[1][0], uvs[0][1]);
	}else{
		return vec2(uvs[1][0], uvs[1][1]);
	}
}

vec2 toScreenSpace(vec2 position){
	vec2 zeroToOne = position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   return (zeroToTwo - 1.0) * vec2(1, -1);
}

void main() {

    float depth = 0.0;
    if (u_depth >= 0){
        depth = -1.0 / float(u_depth+1);
    }

    vec2 viewportPos = u_viewport[0];
    vec2 viewportDim = u_viewport[1];

    vec2 scenePos = u_viewportScene[0];
    vec2 sceneDim = u_viewportScene[1];

    vec2 position = u_position;
    vec2 dimension = u_dimension;
    if (u_useViewport){

        vec2 viewportPos = u_viewport[0];
        vec2 viewportDim = u_viewport[1];

        vec2 scenePos = u_viewportScene[0];
        vec2 sceneDim = u_viewportScene[1];

        position = viewportPos.xy+(viewportDim.xy / sceneDim.xy)*(position.xy+scenePos.xy)-(viewportDim.xy/2.0);
        dimension = (viewportDim.xy / sceneDim.xy)*dimension.xy;
    }

    vec2 pixelCoord =  a_verticies*u_dimension;

    vTextureCoord = pixelCoord.xy / u_mapChunkSize / u_mapSquareSize;

    if (u_mapSquareSize == 32.0) vDebugColour = vec4(1.0,1.0,0.0,1.0);
    else vDebugColour = vec4(0.0,0.0,1.0,1.0);

    gl_Position = vec4(toScreenSpace(position + a_verticies*dimension), 0, 1);
}