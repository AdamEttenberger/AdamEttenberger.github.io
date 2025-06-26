FlockManager.prototype = new GameObjectComponent();
FlockManager.prototype.constructor = FlockManager;

function FlockManager()
{
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  this.m_members = new Array();
  this.draw = function(gl) { /* Draw Code */ }
  this.update = function() { /* Update Code */ }

  this.serialize = async function() {
    return {"type": "FlockManager"};
  }

  this.deserialize = function(jsonObject) { return this; }
}

FlockManager.Instance = function()
{
  return new FlockManager();
}