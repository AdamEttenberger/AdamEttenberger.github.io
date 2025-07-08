RotateComponent.prototype = new GameObjectComponent();
RotateComponent.prototype.constructor = RotateComponent;

function RotateComponent() {
  this.rotation = quat.create();

  this.update = function(dt) {
    quat.multiply(this.m_gameObject.m_transform.rotation,
                  this.m_gameObject.m_transform.rotation,
                  quat.pow(quat.create(), this.rotation, dt));
  }

  this.fromValues = function(x, y, z, w) {
    this.rotation = quat.fromValues(x ?? 0, y ?? 0, z ?? 0, w ?? 1);
    return this;
  }

  /**
   * Euler angles in degrees to rotate around the x-, y-, and z-axis.
   */
  this.fromEuler = function(x, y, z) {
    this.rotation = quat.fromEuler(quat.create(), (x ?? 0), (y ?? 0), (z ?? 0));
    return this;
  }

  this.serialize = async function() {
    return {
      "type": "RotateComponent",
      "rotation": quat.exactEquals(this.rotation, quat.create()) ? undefined : Array.from(this.rotation),
    };
  }

  this.deserialize = async function(jsonObject) {
    if (jsonObject.type !== "RotateComponent") {
      return;
    }
    quat.copy(this.rotation, jsonObject.rotation ?? quat.create());
    return this;
  }
}
