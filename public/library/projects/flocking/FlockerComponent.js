FlockerComponent.prototype = new GameObjectComponent();
FlockerComponent.prototype.constructor = FlockerComponent;

// TODO: `axis_forward` should be (0, 0, -1) to match the coordinate system.
FlockerComponent.axis_forward = function() { return vec3.fromValues(0, 1, 0); }

FlockerComponent.maxSpeed = 12;
FlockerComponent.maxForce = 20;

FlockerComponent.alignmentScale = 9.0;
FlockerComponent.separationScale = 15.0;
FlockerComponent.cohesionScale = 7.0;
FlockerComponent.containmentScale = 100.0;

FlockerComponent.sightRadius = 8.0;
FlockerComponent.separationRadius = 3.0;
FlockerComponent.containmentRadius = 30.0;

function FlockerComponent( )
{
  this.closeFlockersArray = new Array( );
  this.distanceArray = new Array( );

  this.speed = 0.0;

  this.unit_forward = function() { var fwd = FlockerComponent.axis_forward(); return vec3.transformQuat( fwd, fwd, this.m_gameObject.m_transform.rotation); }
  this.velocity = function() { return vec3.scale(vec3.create(), this.unit_forward(), this.speed); }

  var _resizeVec3Impl = function(f, new_length, old_length) {
    if (old_length === new_length) {
      return f;
    }
    return vec3.scale(f, f, new_length / old_length);
  }

  this.resizeVec3 = function(v, new_length) {
    return _resizeVec3Impl(v, new_length, vec3.length(v));
  }

  /**
   * Clamps the value `f` in-place to FlockerComponent.maxForce.
   * @param {vec3} f Vector to clamp.
   * @returns The new vector `f`.
   */
  this.clampForce = function(f) {
    var mag = vec3.length(f);
    if (mag <= FlockerComponent.maxForce) {
      return f;
    }
    return _resizeVec3Impl(f, FlockerComponent.maxForce, mag);
  }

  /**
   * Clamps the value `f` in-place to FlockerComponent.maxSpeed.
   * @param {vec3} f Vector to clamp.
   * @returns The final length of `f`.
   */
  this.clampVelocity = function(f) {
    var mag = vec3.length(f);
    if (mag <= FlockerComponent.maxSpeed) {
      return mag;
    }
    _resizeVec3Impl(f, FlockerComponent.maxSpeed, f);
    return FlockerComponent.maxSpeed;
  }

  this.alignment = function()
  {
    if (!this.closeFlockersArray.length) {
      return vec3.create();
    }
    var f = vec3.create();
    this.closeFlockersArray.forEach(element => vec3.add(f, f, element.getComponent(FlockerComponent).unit_forward()));
    vec3.scale(f, f, 1 / this.closeFlockersArray.length);
    return vec3.normalize(f, f);
  }

  this.cohesion = function()
  {
    if (!this.closeFlockersArray.length) {
      return vec3.create();
    }
    var f = vec3.create();
    this.closeFlockersArray.forEach(element => vec3.add(f, f, element.m_transform.position));
    vec3.scale(f, f, 1 / this.closeFlockersArray.length);
    vec3.subtract(f, f, this.m_gameObject.m_transform.position);
    return vec3.normalize(f, f);
  }

  this.separation = function()
  {
    if (!this.closeFlockersArray.length) {
      return vec3.create();
    }
    var f = vec3.create();
    this.closeFlockersArray.forEach((closeFlocker, index) => {
      if (this.distanceArray[index] >= FlockerComponent.separationRadius) {
        return;
      }
      var delta_from_other = vec3.subtract(vec3.create(), this.m_gameObject.m_transform.position, closeFlocker.m_transform.position);
      var weight = vec3.scale(vec3.create(), delta_from_other, 1.0 / this.distanceArray[index] * this.distanceArray[index]);
      vec3.add(f, f, weight);
    });
    vec3.scale(f, f, 1 / this.closeFlockersArray.length);
    vec3.normalize(f, f);
    return f;
  }

  this.containment = function(origin)
  {
    var containment_radius = vec3.fromValues(FlockerComponent.containmentRadius, FlockerComponent.containmentRadius, FlockerComponent.containmentRadius);
    var containment_visible_radius = vec3.subtract(vec3.create(), containment_radius, vec3.fromValues(FlockerComponent.sightRadius, FlockerComponent.sightRadius, FlockerComponent.sightRadius));
    var delta_to_target = vec3.sub(vec3.create(), origin, this.m_gameObject.m_transform.position);
    var abs_diff = vec3.fromValues(Math.abs(delta_to_target[0]), Math.abs(delta_to_target[1]), Math.abs(delta_to_target[2]));
    if (vec3.equals(containment_visible_radius, vec3.max(vec3.create(), abs_diff, containment_visible_radius))) {
      return vec3.create();
    }
    return vec3.normalize(vec3.create(), delta_to_target);
  }

  this.calcSteeringForce = function()
  {
    var f = vec3.create( );

    FlockManager.Instance().forEach(member => {
      if (member === this.m_gameObject) {
        return;
      }
      var dist_squared = vec3.squaredDistance( this.m_gameObject.m_transform.position, member.m_transform.position );
      if ( dist_squared > FlockerComponent.sightRadius * FlockerComponent.sightRadius ) {
        return;
      }
      this.closeFlockersArray.push(member);
      this.distanceArray.push(Math.sqrt(dist_squared));
    });

    vec3.add( f, f, vec3.scale( vec3.create(), this.alignment(), FlockerComponent.alignmentScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.cohesion(), FlockerComponent.cohesionScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.separation(), FlockerComponent.separationScale ) );
    vec3.add( f, f, vec3.scale( vec3.create(), this.containment(FlockManager.Instance().m_gameObject.m_transform.position), FlockerComponent.containmentScale ) );

    this.closeFlockersArray.splice( 0, this.closeFlockersArray.length );
    this.distanceArray.splice( 0, this.distanceArray.length );

    return this.clampForce(f);
  }

  this.update = function(dt)
  {
    var f = vec3.scale(vec3.create(), this.calcSteeringForce(), dt);
    var new_forward = vec3.add(vec3.create(), this.velocity(), f);
    this.speed = Math.min(vec3.length(new_forward), FlockerComponent.maxSpeed);

    vec3.add(this.m_gameObject.m_transform.position,
             this.m_gameObject.m_transform.position,
             vec3.scale(vec3.create(), this.velocity(), dt));

    vec3.normalize(new_forward, new_forward);
    quat.normalize(this.m_gameObject.m_transform.rotation,
                   quat.rotationTo(quat.create(), FlockerComponent.axis_forward(), new_forward));
  }

  this.serialize = async function() {
    return {
      "type": "FlockerComponent",
      "speed": this.speed,
    };
  }

  this.deserialize = async function(jsonObject) {
    if (jsonObject.type !== "FlockerComponent") {
      return;
    }
    this.speed = jsonObject.speed ?? 0;
    return this;
  }
}
