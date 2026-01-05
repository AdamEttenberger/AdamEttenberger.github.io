precision mediump float;

varying vec2 UV;

uniform vec3 uResolution; // = {width, height, aspect}
uniform float uTime;

const vec3 color_inside = vec3(1.0, 0.0, 0.0);
const vec3 color_outside = vec3(0.0, 0.0, 1.0);

float sdf_plane(vec2 p, vec2 n, float h) {
  return dot(p, n) - h;
}

void main() {
  vec2 uv = UV;
  uv -= vec2(0.5); // translate to center the circle in the view.

  float sdf = sdf_plane(uv, vec2(1.0, -1.0), 0.0);
  gl_FragColor = vec4((sdf > 0.0) ? color_outside : color_inside, 1.0);
}
