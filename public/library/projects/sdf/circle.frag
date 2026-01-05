precision mediump float;

varying vec2 UV;

uniform vec3 uResolution; // = {width, height, aspect}
uniform float uTime;

const vec3 color_inside = vec3(1.0, 0.0, 0.0);
const vec3 color_outside = vec3(0.0, 0.0, 1.0);

float sdf_circle(vec2 p, float r) {
  return length(p) - r;
}

void main() {
  vec2 uv = UV;
  uv -= vec2(0.5); // translate to center the circle in the view.

  float sdf = sdf_circle(uv, 0.5);
  gl_FragColor = vec4((sdf > 0.0) ? color_outside : color_inside, 1.0);
}
