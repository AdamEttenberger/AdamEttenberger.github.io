precision mediump float;

varying vec2 UV;

uniform vec3 uResolution; // = {width, height, aspect}
uniform float uTime;

void main() {
  gl_FragColor = vec4(UV.x, UV.y, 0.5+0.5*cos(uTime), 1.0);
}
