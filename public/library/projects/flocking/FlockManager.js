FlockManager.prototype = new GameObjectComponent();
FlockManager.prototype.constructor = FlockManager;

function FlockManager()
{
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  this.m_members = new Array();
  this.draw = function(gl) { /* Draw Code */ }

  this.update = function()
  {
    /*
    for(i in this.m_members)
    {
      var f = this.m_members[i].getComponent( FlockerComponent ).calcSteeringForce();
    }
    */
  }
}

FlockManager.Instance = function()
{
  return new FlockManager();
}