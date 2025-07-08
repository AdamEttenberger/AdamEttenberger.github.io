Transform.prototype = new GameObjectComponent();
Transform.prototype.constructor = Transform;

function Transform()
{
  var p_matrix = mat4.create();
  this.position = vec3.create();
  this.rotation = quat.create();
  this.scale = vec3.fromValues(1, 1, 1);

  this.copy = function(other) {
    vec3.copy(this.position, other.position);
    quat.copy(this.rotation, other.rotation);
    vec3.copy(this.scale, other.scale);
  }

  this.toMatrix = function()
  {
    mat4.fromRotationTranslation(p_matrix, this.rotation, this.position);
    mat4.scale( p_matrix, p_matrix, this.scale );
    return p_matrix;
  }

  this.serialize = async function() {
    return {
      "type": "Transform",
      "position": vec3.equals(this.position, vec3.create()) ? undefined : Array.from(this.position),
      "rotation": quat.exactEquals(this.rotation, quat.create()) ? undefined : Array.from(this.rotation),
      "scale": vec3.equals(this.scale, vec3.fromValues(1, 1, 1)) ? undefined : Array.from(this.scale),
    };
  }

  this.deserialize = async function(jsonObject) {
    if (jsonObject?.type !== "Transform") {
      return;
    }
    vec3.copy(this.position, jsonObject.position ?? vec3.create());
    quat.copy(this.rotation, jsonObject.rotation ?? quat.create());
    vec3.copy(this.scale, jsonObject.scale ?? vec3.fromValues(1, 1, 1));
    return this;
  }
}