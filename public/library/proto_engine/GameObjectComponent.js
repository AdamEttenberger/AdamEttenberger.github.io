function GameObjectComponent()
{
  this.m_gameObject = null;
  this.update = function(dt) { /* Update Code */ }
  this.draw = function(gl) { /* Draw Code */ }
  this.serialize = async function() { /* Serialize Data */ }
  this.deserialize = async function(jsonObject) { /* Deserialize Data */ }
}