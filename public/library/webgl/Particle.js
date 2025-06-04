function Particle( )
{
  this.position = vec3.create( );
  this.velocity = vec3.create( );
  this.acceleration = vec3.create( );
  this.color = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
  this.radius = 0;

  this.reset = function( )
  {
    this.position = vec3.create( );
    this.velocity = vec3.create( );
    this.acceleration = vec3.create( );
    this.color = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
    this.radius = 0;
  }
}