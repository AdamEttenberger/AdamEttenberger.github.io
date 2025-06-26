RotateComponent.prototype = new GameObjectComponent();
RotateComponent.prototype.constructor = RotateComponent;

function RotateComponent() {
  this.rotation = quat.create();

  this.update = function() {
    quat.multiply( this.m_gameObject.m_transform.rotation, this.m_gameObject.m_transform.rotation, this.rotation );
    quat.normalize( this.m_gameObject.m_transform.rotation, this.m_gameObject.m_transform.rotation );
  }

  this.fromValues = function(x, y, z, w) {
    this.rotation = quat.fromValues(x ?? 0, y ?? 0, z ?? 0, w ?? 1);
    return this;
  }

  this.fromEuler = function(x, y, z) {
    const kRadToDegScalar = 180 / Math.PI;
    this.rotation = quat.fromEuler(quat.create(),
                                   (x ?? 0) * kRadToDegScalar,
                                   (y ?? 0) * kRadToDegScalar,
                                   (z ?? 0) * kRadToDegScalar);
    return this;
  }

  this.serialize = async function() {
    return {
      "type": "RotateComponent",
      "rotation": quat.equals(this.rotation, quat.create()) ? undefined : Array.from(this.rotation),
    };
  }

  this.deserialize = async function(jsonObject) {
    if (jsonObject.type !== "RotateComponent") {
      return;
    }
    quat.copy(this.rotation, jsonObject.rotation ?? Quat.create());
    return this;
  }
}
