SkinnedModelComponent.prototype = new GameObjectComponent();
SkinnedModelComponent.prototype.constructor = SkinnedModelComponent;

function SkinnedModelComponent( texture, vertexBuffers, indexBuffer )
{
  // Initialize Default Vertex Texture shader
  if ( gl != null )
  if (SkinnedModelComponent.TextureShader == null)
  {
    SkinnedModelComponent.TextureShader = new ShaderProgram( );
    Promise.all([
      SkinnedModelComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-vs.c", gl.VERTEX_SHADER ),
      SkinnedModelComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      SkinnedModelComponent.TextureShader.linkProgram( );
      SkinnedModelComponent.TextureShader.apply( );

      SkinnedModelComponent.TextureShader.vertexPositionAttribute = gl.getAttribLocation(SkinnedModelComponent.TextureShader, "aVertexPosition");
      SkinnedModelComponent.TextureShader.vertexTextureAttribute = gl.getAttribLocation(SkinnedModelComponent.TextureShader, "aTextureCoord");
      SkinnedModelComponent.TextureShader.alphaUniform = gl.getUniformLocation(SkinnedModelComponent.TextureShader, "uAlpha");
      SkinnedModelComponent.TextureShader.samplerUniform = gl.getUniformLocation(SkinnedModelComponent.TextureShader, "uSampler");
      SkinnedModelComponent.TextureShader.mMatrix = gl.getUniformLocation(SkinnedModelComponent.TextureShader, "mMatrix");
      SkinnedModelComponent.TextureShader.vMatrix = gl.getUniformLocation(SkinnedModelComponent.TextureShader, "vMatrix");
      SkinnedModelComponent.TextureShader.pMatrix = gl.getUniformLocation(SkinnedModelComponent.TextureShader, "pMatrix");

      gl.uniform1f(SkinnedModelComponent.TextureShader.alphaUniform, 1.0);
        })
        .catch( e => Game.ExceptionHandler(e) );
  }

  this.texture = texture;
  this.buffers = vertexBuffers;
  this.indexBuffer = indexBuffer;

  this.draw = function(gl)
  {
    if (this.texture.loaded
      && SkinnedModelComponent.TextureShader.apply( )
      )
    {
      for(i in this.buffers)
      {
        this.buffers[i].bindBuffer();
        switch( this.buffers[i].BufferType )
        {
          case Buffer.POSITION:
            {
              gl.enableVertexAttribArray(SkinnedModelComponent.TextureShader.vertexPositionAttribute);
              gl.vertexAttribPointer(SkinnedModelComponent.TextureShader.vertexPositionAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
          case Buffer.TEXTURE:
            {
              gl.enableVertexAttribArray(SkinnedModelComponent.TextureShader.vertexTextureAttribute);
              gl.vertexAttribPointer(SkinnedModelComponent.TextureShader.vertexTextureAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
        }
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      this.indexBuffer.bindBuffer();

      gl.uniformMatrix4fv(SkinnedModelComponent.TextureShader.mMatrix, false, Game.mMatrix);
      gl.uniformMatrix4fv(SkinnedModelComponent.TextureShader.vMatrix, false, Game.vMatrix);
      gl.uniformMatrix4fv(SkinnedModelComponent.TextureShader.pMatrix, false, Game.pMatrix);

      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

      gl.disableVertexAttribArray(SkinnedModelComponent.TextureShader.vertexPositionAttribute);
      gl.disableVertexAttribArray(SkinnedModelComponent.TextureShader.vertexTextureAttribute);

      for(i in this.buffers)
        this.buffers[i].unbindBuffer();
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.indexBuffer.unbindBuffer();
    }
  }
}

SkinnedModelComponent.TextureShader = null;