ParticleManager.prototype = new GameObjectComponent();
ParticleManager.prototype.constructor = ParticleManager;

function ParticleManager()
{
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  this.m_members = new Array( );
  var m_recycled = new Array( );

  this.draw = function(gl) { /* Draw Code */ }

  this.update = function()
  {
    for(i in this.m_members)
    {
      var p = this.m_members[i];
      vec3.add( p.velocity, p.velocity, p.acceleration );
      vec3.add( p.position, p.position, p.velocity );
    }
  }

  this.createParticle = function()
  {
    var p;

    if ( m_recycled.length != 0 )
    {
      p = m_recycled.splice( 0, 1 )[0];
      p.reset( );
    }
    else
      p = new Particle( );

    this.m_members.push( p );
    return p;
  }

  this.destroyParticle = function( index )
  {
    m_recycled.push( this.m_members.splice( index, 1 )[0] );
  }

  this.destroyParticles = function( indices )
  {
    for( i in indices )
      m_recycled.push( this.m_members.splice( indices[i] - i, 1 )[0] );
  }
}

ParticleManager.Instance = function()
{
  return new ParticleManager();
}