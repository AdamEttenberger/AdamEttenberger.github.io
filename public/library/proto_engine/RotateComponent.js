RotateComponent.prototype = new GameObjectComponent();
RotateComponent.prototype.constructor = RotateComponent;

function RotateComponent() {
  this.rotation = quat.create();

  this.update = function(dt) {
    quat.multiply(this.m_gameObject.m_transform.rotation,
                  this.m_gameObject.m_transform.rotation,
                  quat.pow(quat.create(), this.rotation, dt));
  }

  /**
   * Rotates this component by angles in degrees to rotate around the x-, y-, and z-axis.
   */
  this.pushEuler = function(x, y, z) {
    quat.multiply(this.rotation, this.rotation, quat.fromEuler(quat.create(), x, y, z));
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
