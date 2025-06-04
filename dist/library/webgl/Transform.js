Transform.prototype = new GameObjectComponent();
Transform.prototype.constructor = Transform;

function Transform()
{
  var p_matrix = mat4.create();
  this.position = vec3.create();
  this.rotation = quat.create();
  this.scale = vec3.fromValues(1, 1, 1);

  this.toMatrix = function()
  {
    mat4.fromRotationTranslation(p_matrix, this.rotation, this.position);
    mat4.scale( p_matrix, p_matrix, this.scale );
    return p_matrix;
  }
}