WireModelComponent.prototype = new GameObjectComponent();
WireModelComponent.prototype.constructor = WireModelComponent;

function WireModelComponent( vertexBuffers, indexBuffer )
{
  this.buffers = vertexBuffers;
  this.indexBuffer = indexBuffer;

  this.draw = function(gl)
  {
    for(i in this.buffers)
      this.buffers[i].bindBuffer();
    this.indexBuffer.bindBuffer();

    gl.uniformMatrix4fv(Game.shaderProgram.mMatrix, false, Game.mMatrix);
        gl.uniformMatrix4fv(Game.shaderProgram.vMatrix, false, Game.vMatrix);
    gl.uniformMatrix4fv(Game.shaderProgram.pMatrix, false, Game.pMatrix);

    gl.drawElements(gl.LINES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

    for(i in this.buffers)
      this.buffers[i].unbindBuffer();
    this.indexBuffer.unbindBuffer();
  }
}