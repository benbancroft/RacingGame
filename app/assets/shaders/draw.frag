/**
 * This code was written by Ben Bancroft
 */

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTextureCoord;
varying vec4 vDebugColour;

uniform vec4 u_colour;
uniform bool u_useColour;
uniform bool u_useColourBlend;
uniform sampler2D u_textureSample;
uniform vec2 u_resolution;

uniform bool u_useViewport;
uniform mat2 u_viewport;

void main() {

    vec2 upperLeft = vec2(u_viewport[0][0], u_resolution.y - u_viewport[0][1]);
    vec2 lowerRight = upperLeft + vec2(u_viewport[1][0], -u_viewport[1][1]);
    if (u_useViewport){
        if (gl_FragCoord.x < upperLeft.x || gl_FragCoord.x > lowerRight.x || gl_FragCoord.y > upperLeft.y || gl_FragCoord.y < lowerRight.y){
            discard;
        }
    }
    if (!u_useColour){
        vec4 colour = texture2D(u_textureSample, vTextureCoord);
        if (u_useColourBlend){
            colour *= u_colour;
        }
        gl_FragColor = colour;
    }else{
        gl_FragColor = u_colour;
    }
}
