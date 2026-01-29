FlockManager.prototype = new GameObjectComponent();
FlockManager.prototype.constructor = FlockManager;

function FlockManager()
{
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  var triVertices = [
    0.0,  0.5,  0.0,
    -0.5,  -0.5,  -0.5,
    -0.5,  -0.5,  0.5,
    0.5,  -0.5,  0.5,
    0.5,  -0.5,  -0.5
  ];

  var triUV = [
    0.5, 0.5,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
    ];

  var triIndices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 1,
    3, 2, 1,
    1, 4, 3
    ];

  var triBuffers = [
    new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, triVertices, 3 ),
    new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, triUV, 2 ),
    new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, triIndices, 1 ),
  ];

  // Creates a virtual GameObject because managers aren't
  // attached to the scene tree.
  this.m_gameObject = new GameObject();
  this.m_cache = new Set();
  this.draw = function(gl) { this.m_gameObject.draw(gl); }
  this.update = function(dt) { this.m_gameObject.update(dt); }

  this.count = function(spawner) {
    return spawner.children.length;
  }

  this.spawn = function(spawner, count = 1) {
    for (var i = 0; i < count; ++i) {
      var tri = new GameObject();

      var _rand_quaternion = () => {
        var q1 = quat.setAxisAngle(quat.create(), FlockerComponent.axis_forward(), Math.random()*2*Math.PI);
        var q2 = quat.setAxisAngle(quat.create(), vec3.fromValues(1, 0, 0), Math.random()*2*Math.PI);
        var result = quat.multiply(quat.create(), q1, q2);
        return quat.normalize(result, result);
      };

      tri.m_transform.rotation = _rand_quaternion();
      vec3.transformQuat(tri.m_transform.position, FlockerComponent.axis_forward(), _rand_quaternion());
      vec3.scale(tri.m_transform.position, tri.m_transform.position, 20.0);

      tri.m_transform.scale = vec3.fromValues(1.5, 1.5, 1.5);
      tri.addComponent(new TextureModelComponent().setTexture(g_game.loadTexture("/library/projects/flocking/images/ship.png")).setBuffers(triBuffers));
      tri.addComponent(new FlockerComponent());
      spawner.addChildGameObject(tri);
      this.m_cache.add(tri);
    }
  }

  this.despawn = function(spawner, count = 1) {
    if (count > spawner.children.length) {
      count = spawner.children.length;
    }
    for (var i = 0; i < count; ++i) {
      var removed = spawner.removeChildGameObject(spawner.children.at(spawner.children.length - 1));
      this.m_cache.delete(removed);
    }
  }

  this.forEach = function(fn) {
    this.m_cache.forEach(fn)
  }

  this.serialize = async function() {
    return {"type": "FlockManager"};
  }

  this.deserialize = function(jsonObject) { return this; }
}

FlockManager.Instance = function()
{
  return new FlockManager();
}