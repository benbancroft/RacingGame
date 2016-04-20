/**
 * This code was written by Ben Bancroft
 */

#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_verticies;

varying vec2 vTextureCoord;
varying vec4 vDebugColour;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_centre;
uniform vec2 u_dimension;

uniform mat2 u_rotation;

uniform mat2 u_uvs;
uniform int u_depth;

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
    if (u_uvs[0][0] != 0.0 || u_uvs[0][1] != 0.0 || u_uvs[1][0] != 0.0 || u_uvs[1][1] != 0.0){
        vDebugColour = vec4(1,0,0,1);
    }else{
        vDebugColour = vec4(0,0,0,1);
    }
    vTextureCoord = getUV(u_uvs, a_verticies);

    float depth = 0.0;
    if (u_depth >= 0){
        depth = -1.0 / float(u_depth+1);
    }

    vec2 position = u_position;
    vec2 dimension = u_dimension;
    vec2 centre = u_centre;
    if (u_useViewport){

        vec2 viewportPos = u_viewport[0];
        vec2 viewportDim = u_viewport[1];

        vec2 scenePos = u_viewportScene[0];
        vec2 sceneDim = u_viewportScene[1];

        position = viewportPos.xy+(viewportDim.xy / sceneDim.xy)*(position.xy+scenePos.xy)-(viewportDim.xy/2.0);
        dimension = (viewportDim.xy / sceneDim.xy)*dimension.xy;
        centre = (viewportDim.xy / sceneDim.xy)*centre.xy;
    }

    gl_Position = vec4(toScreenSpace(position + (a_verticies*dimension-centre)*u_rotation), 0, 1);
}