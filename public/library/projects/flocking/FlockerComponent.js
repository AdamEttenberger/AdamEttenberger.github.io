FlockerComponent.prototype = new GameObjectComponent();
FlockerComponent.prototype.constructor = FlockerComponent;

FlockerComponent.alignmentScale = 1.0;
FlockerComponent.cohesionScale = 0.5;
FlockerComponent.separationScale = 0.75;
FlockerComponent.containmentScale = 1.0;

FlockerComponent.containmentRadius = 25.0;
FlockerComponent.sightRadius = 6.0;
FlockerComponent.separationRadius = 3.0;
FlockerComponent.maxSpeed = 0.5;
FlockerComponent.maxForce = 0.03125;

function FlockerComponent( )
{
  this.closeFlockersArray = new Array( );
  this.distanceArray = new Array( );

  this.speed = 0.0;

  this.forward = function() { var fwd = vec3.fromValues(0, 1, 0); return vec3.transformQuat( fwd, fwd, this.m_gameObject.m_transform.rotation); }
  this.velocity = vec3.create( );

  this.seek = function( target )
  {
    var dv = vec3.create( );
    vec3.subtract( dv, target, this.m_gameObject.m_transform.position );
    vec3.normalize( dv, dv );
    vec3.scale( dv, dv, FlockerComponent.maxSpeed );
    vec3.subtract( dv, dv, this.velocity );
    return dv;
  }

  this.alignment = function()
  {
    var f = vec3.create( );
    for(i in this.closeFlockersArray)
      vec3.add( f, f, this.closeFlockersArray[i].getComponent(FlockerComponent).forward( ) );
    vec3.normalize( f, f );
    vec3.scale( f, f, FlockerComponent.maxSpeed );
    vec3.subtract( f, f, this.velocity );
    return f;
  }

  this.cohesion = function()
  {
    var f = vec3.create( );
    for(i in this.closeFlockersArray)
      vec3.add( f, f, this.closeFlockersArray[i].m_transform.position );
    if ( this.closeFlockersArray.length > 0 )
      vec3.scale( f, f, 1.0 / this.closeFlockersArray.length );
    return this.seek( f );
  }

  this.separation = function()
  {
    var f = vec3.create( );
    var v = vec3.create( );
    for(i in this.closeFlockersArray)
    {
      if ( this.distanceArray[i] <= FlockerComponent.separationRadius )
      {
        vec3.subtract( v, this.m_gameObject.m_transform.position, this.closeFlockersArray[i].m_transform.position );
        vec3.normalize( v, v );
        vec3.scale( v, v, 1.0 / this.distanceArray[i] );
        vec3.add( f, f, v );
      }
    }
    vec3.normalize( f, f );
    vec3.scale( f, f, FlockerComponent.maxSpeed );
    vec3.subtract( f, f, this.velocity );
    return f;
  }

  this.containment = function()
  {
    var f = vec3.create( );
    if ( vec3.length( this.m_gameObject.m_transform.position ) >= FlockerComponent.containmentRadius )
      return this.seek( f );
    return f;
  }

  this.calcSteeringForce = function()
  {
    var f = vec3.create( );

    for(i in FlockManager.Instance().m_members)
    {
      if ( FlockManager.Instance().m_members[i] !== this.m_gameObject )
      {
        var dist = vec3.dist( this.m_gameObject.m_transform.position, FlockManager.Instance().m_members[i].m_transform.position );
        if ( dist <= FlockerComponent.sightRadius )
        {
          this.closeFlockersArray.push( FlockManager.Instance().m_members[i] );
          this.distanceArray.push( dist );
        }
      }
    }

    vec3.add( f, f, vec3.scale( vec3.create(), this.alignment( ), FlockerComponent.alignmentScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.cohesion( ), FlockerComponent.cohesionScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.separation( ), FlockerComponent.separationScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.containment( ), FlockerComponent.containmentScale ) );

    this.closeFlockersArray.splice( 0, this.closeFlockersArray.length );
    this.distanceArray.splice( 0, this.distanceArray.length );

    return f;
  }

  this.clampSteeringForce = function( f, dest )
  {
    if (!dest || f === dest)
    {
      var mag = vec3.length( f );
      if ( mag > FlockerComponent.maxForce )
      {
        vec3.scale( f, f, 1 / mag );
        vec3.scale( f, f, FlockerComponent.maxForce );
      }
      return f;
    }

    vec3.copy( dest, f );
    var mag = vec3.length( dest );
    if ( mag > FlockerComponent.maxForce )
    {
      vec3.scale( dest, dest, 1 / mag );
      vec3.scale( dest, dest, FlockerComponent.maxForce );
    }
    return dest;
  }

  this.adjustForward = function( )
  {
    var v1 = vec3.fromValues( 0, 1, 0 );
    var v2 = vec3.normalize( vec3.create(), this.velocity );

    var q = quat.create( );
    quat.rotationTo( q, v1, v2 );
    quat.normalize( q, q );

    quat.normalize( this.m_gameObject.m_transform.rotation, q );
  }

  this.update = function()
  {
    var f = this.calcSteeringForce( );
    this.clampSteeringForce( f );

    vec3.add( this.velocity, this.velocity, f );
    this.speed = vec3.length( this.velocity );

    if ( this.speed > FlockerComponent.maxSpeed )
    {
      vec3.scale( this.velocity, this.velocity, 1 / this.speed );
      vec3.scale( this.velocity, this.velocity, FlockerComponent.maxSpeed );
      this.speed = FlockerComponent.maxSpeed;
    }

    vec3.add( this.m_gameObject.m_transform.position, this.m_gameObject.m_transform.position, this.velocity );
    this.adjustForward( );
  }
}