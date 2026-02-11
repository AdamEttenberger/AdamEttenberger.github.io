#version 300 es
precision mediump float;

in vec2 UV;

out vec4 vColor;

uniform vec3 uResolution; // = {width, height, aspect}
/**
 * Time needs to be high precision to avoid a bug
 * on mobile devices which caused the renderer to appear
 * sluggish over time once a certain threshold was reached.
 * e.g., a few minutes on screen caused choppy simulations.
 */
uniform highp float uTime;

void main() {
  vColor = vec4(UV.x, UV.y, 0.5+0.5*cos(uTime), 1.0);
}
