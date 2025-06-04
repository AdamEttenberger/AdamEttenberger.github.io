ModelComponent.prototype = new GameObjectComponent();
ModelComponent.prototype.constructor = ModelComponent;

function ModelComponent( vertexBuffers, indexBuffer )
{
  // Initialize Default Vertex Texture shader
  if ( gl != null )
  if (ModelComponent.ColorShader == null)
  {
    ModelComponent.ColorShader = new ShaderProgram( );
    Promise.all([
      ModelComponent.ColorShader.attachShader( "/library/webgl/shaders/color-vs.c", gl.VERTEX_SHADER ),
      ModelComponent.ColorShader.attachShader( "/library/webgl/shaders/color-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      ModelComponent.ColorShader.linkProgram( );
      ModelComponent.ColorShader.apply( );

      ModelComponent.ColorShader.vertexPositionAttribute = gl.getAttribLocation(ModelComponent.ColorShader, "aVertexPosition");
      ModelComponent.ColorShader.vertexColorAttribute = gl.getAttribLocation(ModelComponent.ColorShader, "aVertexColor");
      ModelComponent.ColorShader.alphaUniform = gl.getUniformLocation(ModelComponent.ColorShader, "uAlpha");
      ModelComponent.ColorShader.mMatrix = gl.getUniformLocation(ModelComponent.ColorShader, "mMatrix");
      ModelComponent.ColorShader.vMatrix = gl.getUniformLocation(ModelComponent.ColorShader, "vMatrix");
      ModelComponent.ColorShader.pMatrix = gl.getUniformLocation(ModelComponent.ColorShader, "pMatrix");

      gl.uniform1f(ModelComponent.ColorShader.alphaUniform, 1.0);
        })
        .catch( e => Game.ExceptionHandler(e) );
  }

  this.buffers = vertexBuffers;
  this.indexBuffer = indexBuffer;

  this.draw = function(gl)
  {
    if (ModelComponent.ColorShader.apply())
    {
      for(i in this.buffers)
      {
        this.buffers[i].bindBuffer();
        switch( this.buffers[i].BufferType )
        {
          case Buffer.POSITION:
            {
              gl.enableVertexAttribArray(ModelComponent.ColorShader.vertexPositionAttribute);
              gl.vertexAttribPointer(ModelComponent.ColorShader.vertexPositionAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
          case Buffer.COLOR:
            {
              gl.enableVertexAttribArray(ModelComponent.ColorShader.vertexColorAttribute);
              gl.vertexAttribPointer(ModelComponent.ColorShader.vertexColorAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
        }
      }

      //for(i in this.buffers)
      //  this.buffers[i].bindBuffer();
      this.indexBuffer.bindBuffer();

      gl.uniformMatrix4fv(ModelComponent.ColorShader.mMatrix, false, Game.mMatrix);
      gl.uniformMatrix4fv(ModelComponent.ColorShader.vMatrix, false, Game.vMatrix);
      gl.uniformMatrix4fv(ModelComponent.ColorShader.pMatrix, false, Game.pMatrix);

      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

      gl.disableVertexAttribArray(ModelComponent.ColorShader.vertexPositionAttribute);
      gl.disableVertexAttribArray(ModelComponent.ColorShader.vertexColorAttribute);

      for(i in this.buffers)
        this.buffers[i].unbindBuffer();
      this.indexBuffer.unbindBuffer();
    }
  }
}

ModelComponent.ColorShader = null;