RotateComponent.prototype = new GameObjectComponent();
RotateComponent.prototype.constructor = RotateComponent;

function RotateComponent( qrot )
{
  this.rotation = quat.normalize( quat.create(), qrot );

  this.update = function()
  {
    quat.multiply( this.m_gameObject.m_transform.rotation, this.m_gameObject.m_transform.rotation, this.rotation );
    quat.normalize( this.m_gameObject.m_transform.rotation, this.m_gameObject.m_transform.rotation );
  }
}