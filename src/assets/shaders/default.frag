#version 300 es
precision mediump float;

in vec2 UV;

out vec4 vColor;

uniform vec3 uResolution; // = {width, height, aspect}
uniform float uTime;

void main() {
  vColor = vec4(UV.x, UV.y, 0.5+0.5*cos(uTime), 1.0);
}
