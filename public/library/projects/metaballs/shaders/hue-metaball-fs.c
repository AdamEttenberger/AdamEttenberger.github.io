precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;
uniform float uThreshold;
uniform float uHue;

/**
 * Converts an HSV value "{H: `hue_scalar`, S: 1.0, V: 1.0}" to vec3 RGB,
 * where `hue_scalar` is a value in the range [0, 1] representing the
 * range in degrees [0, 360].
 * See: https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
 */
vec3 hue_to_rgb(float hue_scalar) {
  float H_prime = hue_scalar * 6.0;
  // `remainder` represents a 60-degree range of hue.
  // i.e., [0] = range(0, 60), [1] = range(60, 120), ...
  int remainder = int(H_prime);

  const float C = 1.0;
  float X = 1.0 - abs(mod(H_prime, 2.0) - 1.0);

  if (remainder == 0) return vec3(C, X, 0.0);
  else if (remainder == 1) return vec3(X, C, 0.0);
  else if (remainder == 2) return vec3(0.0, C, X);
  else if (remainder == 3) return vec3(0.0, X, C);
  else if (remainder == 4) return vec3(X, 0.0, C);
  else return vec3(C, 0.0, X);
}

void main(void)
{
  vec4 result = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  float g = (result.a - uThreshold) / (1.0 - uThreshold);
  if (g >= 0.4) {
    gl_FragColor = vec4(hue_to_rgb(uHue), result.a * uAlpha);
  } else if (g >= 0.2) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, result.a * uAlpha);
  } else if (g >= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, result.a * uAlpha);
  } else {
    discard;
  }
}