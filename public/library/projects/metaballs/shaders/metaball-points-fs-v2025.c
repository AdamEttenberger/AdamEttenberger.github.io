precision mediump float;

uniform float uAlpha;
uniform vec2 uRenderbufferSize;
uniform vec3 uLightPosition;
uniform vec4 uLightColor;
uniform float uLightRadius;

void main(void)
{
  vec3 pos = vec3( gl_FragCoord.xy / uRenderbufferSize, 0.0 );
  float d = distance(pos, uLightPosition) - uLightRadius;
  if (d <= 0.0) {
    gl_FragColor = vec4(uLightColor.rgb, uLightColor.a * (-d / uLightRadius) * uAlpha);
  } else {
    discard;
  }
}
