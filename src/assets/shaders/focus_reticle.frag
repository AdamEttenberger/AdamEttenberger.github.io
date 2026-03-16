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

uniform float uStrokeWidth;
uniform float uGap;

uniform vec4 uBackgroundColor;
uniform vec4 uFillColor;

void main() {
  vec2 p = UV;
  p -= vec2(0.5);       // move the origin to the center of the view.
  p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.

  vec2 extent = abs(p);
  float min_extent = min(extent.x, extent.y);
  float max_extent = max(extent.x, extent.y);

  // The UV texture space fills the viewport, but the area
  // isn't square, clip the area outside the projected bounds.
  bool clip = (max_extent > 0.5);

  vColor = clip || (min(step(0.5 - uStrokeWidth, max_extent), step(uGap * 0.5, min_extent)) < 1.0)
      ? uBackgroundColor
      : uFillColor;
}
