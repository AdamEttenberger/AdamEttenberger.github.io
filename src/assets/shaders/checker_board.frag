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

uniform vec4 uBackgroundColor;
uniform vec4 uEvenColor;
uniform vec4 uOddColor;
uniform float uGridSize;

void main() {
  vec2 p = UV;
  p -= vec2(0.5);       // move the origin to the center of the view.
  p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.

  // The UV texture space fills the viewport, but the area
  // isn't square, clip the area outside the projected bounds.
  vec2 extent = abs(p);
  bool clip = (max(extent.x, extent.y) > 0.5);
  if (clip) {
    vColor = uBackgroundColor;
    return;
  }

  // Scale the grid from the lower-left corner rather than the center,
  // this ensures that no cells are partially drawn.
  vec2 grid_uv = (p + vec2(0.5)) * uGridSize;
  bool is_even = mod(floor(grid_uv.x) + floor(grid_uv.y), 2.0) == 0.0;
  vColor = is_even ? uEvenColor : uOddColor;
}
