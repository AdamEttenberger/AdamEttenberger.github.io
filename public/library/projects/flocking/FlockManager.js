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
  this.draw = function(gl) { this.m_gameObject.draw(gl); }
  this.update = function(dt) { this.m_gameObject.update(dt); }

  this.count = function() {
    return this.m_gameObject.children.length;
  }

  this.spawn = function(count = 1) {
    for (var i = 0; i < count; ++i) {
      var tri = new GameObject();
      var v = vec3.fromValues((Math.random()*50)-25, (Math.random()*50)-25, (Math.random()*50)-25);
      var v = vec3.normalize(v, v);
      vec3.scale(v, v, 25);
      vec3.add(tri.m_transform.position, tri.m_transform.position, v);
      tri.m_transform.scale = vec3.fromValues(1.5, 1.5, 1.5);
      tri.addComponent(new TextureModelComponent().setTexture(Game.loadTexture("/library/projects/flocking/images/ship.png")).setBuffers(triBuffers));
      tri.addComponent(new FlockerComponent());
      this.m_gameObject.addChildGameObject(tri);
    }
  }

  this.despawn = function(count = 1) {
    if (count > this.m_gameObject.children.length) {
      count = this.m_gameObject.children.length;
    }
    for (var i = 0; i < count; ++i) {
      this.m_gameObject.removeChildGameObject(this.m_gameObject.children.at(this.m_gameObject.children.length - 1));
    }
  }

  this.forEach = function(fn) {
    this.m_gameObject.children.forEach(fn);
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