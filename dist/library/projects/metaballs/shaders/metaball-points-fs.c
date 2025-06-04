precision mediump float;

uniform float uAlpha;
uniform vec2 uRenderbufferSize;
uniform vec3 uLightPosition;
uniform vec4 uLightColor;
uniform float uLightRadius;

void main(void)
{
  vec3 pos = vec3( gl_FragCoord.xy / uRenderbufferSize, 0.0 );
  float dv = distance(pos, uLightPosition);
  if (dv < uLightRadius)
  {
    float g = uLightColor.a  * ( 1.0 - ( dv / uLightRadius ) );
    gl_FragColor = vec4(uLightColor.rgb, g * uAlpha);
  }
  else
    discard;
}