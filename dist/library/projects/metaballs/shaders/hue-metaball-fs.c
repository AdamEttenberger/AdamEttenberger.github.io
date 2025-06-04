precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;
uniform float uThreshold;
uniform float uHue;

vec3 hue_to_rgb(float hue) {
  float H = hue;
  float slice = H * 6.0;
  int remainder = int(slice);

  const float C = 1.0;
  float X = 1.0 - abs(mod(slice, 2.0) - 1.0);

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
  if (result.a < uThreshold)
  {
    if (result.a < uThreshold * 0.6)
      gl_FragColor = vec4(hue_to_rgb(uHue), result.a * uAlpha);
    else if (result.a < uThreshold * 0.8)
      gl_FragColor = vec4(1.0, 1.0, 1.0, result.a * uAlpha);
    else
      gl_FragColor = vec4(0.0, 0.0, 0.0, result.a * uAlpha);
  }
  else
    discard;
}