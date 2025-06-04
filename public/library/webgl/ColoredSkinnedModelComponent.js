ColoredSkinnedModelComponent.prototype = new GameObjectComponent();
ColoredSkinnedModelComponent.prototype.constructor = ColoredSkinnedModelComponent;

function ColoredSkinnedModelComponent( texture, vertexBuffers, indexBuffer )
{
  // Initialize Default Vertex Texture shader
  if ( gl != null )
  if (ColoredSkinnedModelComponent.TextureColorShader == null)
  {
    ColoredSkinnedModelComponent.TextureColorShader = new ShaderProgram( );
    Promise.all([
      ColoredSkinnedModelComponent.TextureColorShader.attachShader( "/library/webgl/shaders/color-texture-vs.c", gl.VERTEX_SHADER ),
      ColoredSkinnedModelComponent.TextureColorShader.attachShader( "/library/webgl/shaders/color-texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      ColoredSkinnedModelComponent.TextureColorShader.linkProgram( );
      if ( !ColoredSkinnedModelComponent.TextureColorShader.apply() ) {
        throw "GL_SHADER_ERROR";
      }

      ColoredSkinnedModelComponent.TextureColorShader.vertexPositionAttribute = gl.getAttribLocation(ColoredSkinnedModelComponent.TextureColorShader, "aVertexPosition");
      ColoredSkinnedModelComponent.TextureColorShader.vertexColorAttribute = gl.getAttribLocation(ColoredSkinnedModelComponent.TextureColorShader, "aVertexColor");
      ColoredSkinnedModelComponent.TextureColorShader.vertexTextureAttribute = gl.getAttribLocation(ColoredSkinnedModelComponent.TextureColorShader, "aTextureCoord");
      ColoredSkinnedModelComponent.TextureColorShader.alphaUniform = gl.getUniformLocation(ColoredSkinnedModelComponent.TextureColorShader, "uAlpha");
      ColoredSkinnedModelComponent.TextureColorShader.samplerUniform = gl.getUniformLocation(ColoredSkinnedModelComponent.TextureColorShader, "uSampler");
      ColoredSkinnedModelComponent.TextureColorShader.mMatrix = gl.getUniformLocation(ColoredSkinnedModelComponent.TextureColorShader, "mMatrix");
      ColoredSkinnedModelComponent.TextureColorShader.vMatrix = gl.getUniformLocation(ColoredSkinnedModelComponent.TextureColorShader, "vMatrix");
      ColoredSkinnedModelComponent.TextureColorShader.pMatrix = gl.getUniformLocation(ColoredSkinnedModelComponent.TextureColorShader, "pMatrix");

      gl.uniform1f(ColoredSkinnedModelComponent.TextureColorShader.alphaUniform, 1.0);
        })
        .catch( e => Game.ExceptionHandler(e) );
  }

  this.texture = texture;
  this.buffers = vertexBuffers;
  this.indexBuffer = indexBuffer;

  this.draw = function(gl)
  {
    if (this.texture.loaded
      && ColoredSkinnedModelComponent.TextureColorShader.apply( )
      )
    {
      for(i in this.buffers)
      {
        this.buffers[i].bindBuffer();
        switch( this.buffers[i].BufferType )
        {
          case Buffer.POSITION:
            {
              gl.enableVertexAttribArray(ColoredSkinnedModelComponent.TextureColorShader.vertexPositionAttribute);
              gl.vertexAttribPointer(ColoredSkinnedModelComponent.TextureColorShader.vertexPositionAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
          case Buffer.COLOR:
            {
              gl.enableVertexAttribArray(ColoredSkinnedModelComponent.TextureColorShader.vertexColorAttribute);
              gl.vertexAttribPointer(ColoredSkinnedModelComponent.TextureColorShader.vertexColorAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
          case Buffer.TEXTURE:
            {
              gl.enableVertexAttribArray(ColoredSkinnedModelComponent.TextureColorShader.vertexTextureAttribute);
              gl.vertexAttribPointer(ColoredSkinnedModelComponent.TextureColorShader.vertexTextureAttribute, this.buffers[i].itemSize, gl.FLOAT, false, 0, 0);
              break;
            }
        }
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      this.indexBuffer.bindBuffer();

      gl.uniformMatrix4fv(ColoredSkinnedModelComponent.TextureColorShader.mMatrix, false, Game.mMatrix);
      gl.uniformMatrix4fv(ColoredSkinnedModelComponent.TextureColorShader.vMatrix, false, Game.vMatrix);
      gl.uniformMatrix4fv(ColoredSkinnedModelComponent.TextureColorShader.pMatrix, false, Game.pMatrix);

      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

      gl.disableVertexAttribArray(ColoredSkinnedModelComponent.TextureColorShader.vertexPositionAttribute);
      gl.disableVertexAttribArray(ColoredSkinnedModelComponent.TextureColorShader.vertexTextureAttribute);

      for(i in this.buffers)
        this.buffers[i].unbindBuffer();
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.indexBuffer.unbindBuffer();
    }
  }
}

ColoredSkinnedModelComponent.TextureColorShader = null;