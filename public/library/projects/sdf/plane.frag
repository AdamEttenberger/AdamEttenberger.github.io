precision mediump float;

varying vec2 UV;

uniform vec3 uResolution; // = {width, height, aspect}
uniform float uTime;

float sdf_plane(vec2 p, vec2 n, float h) {
  return dot(p, n) - h;
}

vec4 gradient_bands(float sdf, float bandsize) {
  const vec3 inside = vec3(1.0, 0.0, 0.0);
  const vec3 outside = vec3(0.0, 0.0, 1.0);
  vec3 color = (sdf > 0.0) ? outside : inside;

  float band = ceil(abs(sdf) / bandsize) * bandsize;
  color = mix(color, vec3(0.0), band);
  return vec4(color, 1.0);
}

void main() {
  vec2 p = UV;
  p -= vec2(0.5);       // translate to center the circle in the view.
  p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.

  const vec2 normal = vec2(1.0, -1.0);
  const float distance_from_origin = 0.0;
  float sdf = sdf_plane(p, normal, distance_from_origin);
  gl_FragColor = gradient_bands(sdf, 0.1);
}
