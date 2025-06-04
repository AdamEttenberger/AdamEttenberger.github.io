MetaballComponent.prototype = new ModelComponent();
MetaballComponent.prototype.constructor = MetaballComponent;

function MetaballComponent( )
{
  const kRenderTargetResolution = 512;

  // Initialize Default Vertex Texture shader
  if ( gl != null )
  {
    // Shader for Rendering a basic Texture
    if (MetaballComponent.TextureShader == null)
    {
      MetaballComponent.TextureShader = new ShaderProgram( );
      Promise.all([
        MetaballComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-vs.c", gl.VERTEX_SHADER ),
        MetaballComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-fs.c", gl.FRAGMENT_SHADER ),
      ])
      .then(() => {
        MetaballComponent.TextureShader.linkProgram( );
        MetaballComponent.TextureShader.apply( );

        MetaballComponent.TextureShader.vertexPositionAttribute = gl.getAttribLocation(MetaballComponent.TextureShader, "aVertexPosition");
        MetaballComponent.TextureShader.vertexTextureAttribute = gl.getAttribLocation(MetaballComponent.TextureShader, "aTextureCoord");
        MetaballComponent.TextureShader.alphaUniform = gl.getUniformLocation(MetaballComponent.TextureShader, "uAlpha");
        MetaballComponent.TextureShader.samplerUniform = gl.getUniformLocation(MetaballComponent.TextureShader, "uSampler");
        MetaballComponent.TextureShader.mMatrix = gl.getUniformLocation(MetaballComponent.TextureShader, "mMatrix");
        MetaballComponent.TextureShader.vMatrix = gl.getUniformLocation(MetaballComponent.TextureShader, "vMatrix");
        MetaballComponent.TextureShader.pMatrix = gl.getUniformLocation(MetaballComponent.TextureShader, "pMatrix");

        gl.uniform1f(MetaballComponent.TextureShader.alphaUniform, 1.0);
            })
            .catch(e => {
                throw e;
            });
    }

    // Shader for Rendering Gradient Points on the GPU
    if (MetaballComponent.MetaballPointsShader == null)
    {
      MetaballComponent.MetaballPointsShader = new ShaderProgram( );
      Promise.all([
        MetaballComponent.MetaballPointsShader.attachShader( "/library/projects/metaballs/shaders/metaball-points-vs.c", gl.VERTEX_SHADER ),
        MetaballComponent.MetaballPointsShader.attachShader( "/library/projects/metaballs/shaders/metaball-points-fs.c", gl.FRAGMENT_SHADER ),
      ])
      .then(() => {
        MetaballComponent.MetaballPointsShader.linkProgram( );
        MetaballComponent.MetaballPointsShader.apply( );

        MetaballComponent.MetaballPointsShader.vertexPositionAttribute = gl.getAttribLocation(MetaballComponent.MetaballPointsShader, "aVertexPosition");
        MetaballComponent.MetaballPointsShader.vertexColorAttribute = gl.getAttribLocation(MetaballComponent.MetaballPointsShader, "aVertexColor");
        MetaballComponent.MetaballPointsShader.alphaUniform = gl.getUniformLocation(MetaballComponent.MetaballPointsShader, "uAlpha");
        MetaballComponent.MetaballPointsShader.renderbufferSize = gl.getUniformLocation(MetaballComponent.MetaballPointsShader, "uRenderbufferSize");
        MetaballComponent.MetaballPointsShader.lightPosition = gl.getUniformLocation(MetaballComponent.MetaballPointsShader, "uLightPosition");
        MetaballComponent.MetaballPointsShader.lightRadius = gl.getUniformLocation(MetaballComponent.MetaballPointsShader, "uLightRadius");
        MetaballComponent.MetaballPointsShader.lightColor = gl.getUniformLocation(MetaballComponent.MetaballPointsShader, "uLightColor");

        gl.uniform1f(MetaballComponent.MetaballPointsShader.alphaUniform, 1.0);
        gl.uniform2f(MetaballComponent.MetaballPointsShader.renderbufferSize, kRenderTargetResolution, kRenderTargetResolution);
      });
    }

    // Shader for Rendering Metaballs given a Texture with gradient Alpha
    if (MetaballComponent.MetaballShader == null)
    {
      MetaballComponent.MetaballShader = new ShaderProgram( );
      Promise.all([
        MetaballComponent.MetaballShader.attachShader( "/library/projects/metaballs/shaders/metaball-vs.c", gl.VERTEX_SHADER ),
        MetaballComponent.MetaballShader.attachShader( "/library/projects/metaballs/shaders/metaball-fs.c", gl.FRAGMENT_SHADER ),
      ])
      .then(() => {
        MetaballComponent.MetaballShader.linkProgram( );
        MetaballComponent.MetaballShader.apply( );

        MetaballComponent.MetaballShader.vertexPositionAttribute = gl.getAttribLocation(MetaballComponent.MetaballShader, "aVertexPosition");
        MetaballComponent.MetaballShader.vertexTextureAttribute = gl.getAttribLocation(MetaballComponent.MetaballShader, "aTextureCoord");
        MetaballComponent.MetaballShader.alphaUniform = gl.getUniformLocation(MetaballComponent.MetaballShader, "uAlpha");
        MetaballComponent.MetaballShader.alphaThreshold = gl.getUniformLocation(MetaballComponent.MetaballShader, "uThreshold");
        MetaballComponent.MetaballShader.samplerUniform = gl.getUniformLocation(MetaballComponent.MetaballShader, "uSampler");
        MetaballComponent.MetaballShader.mMatrix = gl.getUniformLocation(MetaballComponent.MetaballShader, "mMatrix");
        MetaballComponent.MetaballShader.vMatrix = gl.getUniformLocation(MetaballComponent.MetaballShader, "vMatrix");
        MetaballComponent.MetaballShader.pMatrix = gl.getUniformLocation(MetaballComponent.MetaballShader, "pMatrix");

        gl.uniform1f(MetaballComponent.MetaballShader.alphaUniform, 1.0);
        gl.uniform1f(MetaballComponent.MetaballShader.alphaThreshold, 0.5);
      });
    }

    // Shader for Rendering Outlined Metaballs given a Texture with gradient Alpha
    if (MetaballComponent.OutlineMetaballShader == null)
    {
      MetaballComponent.OutlineMetaballShader = new ShaderProgram( );
      Promise.all([
        MetaballComponent.OutlineMetaballShader.attachShader( "/library/projects/metaballs/shaders/outline-metaball-vs.c", gl.VERTEX_SHADER ),
        MetaballComponent.OutlineMetaballShader.attachShader( "/library/projects/metaballs/shaders/outline-metaball-fs.c", gl.FRAGMENT_SHADER ),
      ])
      .then(() => {
        MetaballComponent.OutlineMetaballShader.linkProgram( );
        MetaballComponent.OutlineMetaballShader.apply( );

        MetaballComponent.OutlineMetaballShader.vertexPositionAttribute = gl.getAttribLocation(MetaballComponent.OutlineMetaballShader, "aVertexPosition");
        MetaballComponent.OutlineMetaballShader.vertexTextureAttribute = gl.getAttribLocation(MetaballComponent.OutlineMetaballShader, "aTextureCoord");
        MetaballComponent.OutlineMetaballShader.alphaUniform = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "uAlpha");
        MetaballComponent.OutlineMetaballShader.alphaThreshold = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "uThreshold");
        MetaballComponent.OutlineMetaballShader.samplerUniform = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "uSampler");
        MetaballComponent.OutlineMetaballShader.mMatrix = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "mMatrix");
        MetaballComponent.OutlineMetaballShader.vMatrix = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "vMatrix");
        MetaballComponent.OutlineMetaballShader.pMatrix = gl.getUniformLocation(MetaballComponent.OutlineMetaballShader, "pMatrix");

        gl.uniform1f(MetaballComponent.OutlineMetaballShader.alphaUniform, 1.0);
        gl.uniform1f(MetaballComponent.OutlineMetaballShader.alphaThreshold, 0.5);
      });
    }

    // Shader for Rendering Outlined Metaballs given a Texture with gradient Alpha
    if (MetaballComponent.HueMetaballShader == null)
    {
      MetaballComponent.HueMetaballShader = new ShaderProgram( );
      Promise.all([
        MetaballComponent.HueMetaballShader.attachShader( "/library/projects/metaballs/shaders/hue-metaball-vs.c", gl.VERTEX_SHADER ),
        MetaballComponent.HueMetaballShader.attachShader( "/library/projects/metaballs/shaders/hue-metaball-fs.c", gl.FRAGMENT_SHADER ),
      ])
      .then(() => {
        MetaballComponent.HueMetaballShader.linkProgram( );
        MetaballComponent.HueMetaballShader.apply( );

        MetaballComponent.HueMetaballShader.vertexPositionAttribute = gl.getAttribLocation(MetaballComponent.HueMetaballShader, "aVertexPosition");
        MetaballComponent.HueMetaballShader.vertexTextureAttribute = gl.getAttribLocation(MetaballComponent.HueMetaballShader, "aTextureCoord");
        MetaballComponent.HueMetaballShader.alphaUniform = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "uAlpha");
        MetaballComponent.HueMetaballShader.alphaThreshold = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "uThreshold");
        MetaballComponent.HueMetaballShader.hue = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "uHue");
        MetaballComponent.HueMetaballShader.samplerUniform = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "uSampler");
        MetaballComponent.HueMetaballShader.mMatrix = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "mMatrix");
        MetaballComponent.HueMetaballShader.vMatrix = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "vMatrix");
        MetaballComponent.HueMetaballShader.pMatrix = gl.getUniformLocation(MetaballComponent.HueMetaballShader, "pMatrix");

        gl.uniform1f(MetaballComponent.HueMetaballShader.alphaUniform, 1.0);
        gl.uniform1f(MetaballComponent.HueMetaballShader.alphaThreshold, 0.5);
        gl.uniform1f(MetaballComponent.HueMetaballShader.hue, 0.0);
      });
    }

  }

  var target = new RenderTarget( kRenderTargetResolution, kRenderTargetResolution );
  target.texture.loaded = true;

  var planarVertices = [ -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0 ];
  var planarUV = [ 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 ];
  var planarIndices = [ 0, 1, 2, 0, 2, 3 ];

  this.vertexPositionBuffer = new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, planarVertices, 3 );
   this.vertexTextureBuffer = new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, planarUV, 2 );
  this.indexBuffer = new Buffer( gl, null, gl.ELEMENT_ARRAY_BUFFER, planarIndices, 1 );
  this.startTime = Date.now();

  this.spawnParticles = function( count )
  {
    for(i = 0; i < count; i++)
    {
      var p = ParticleManager.Instance().createParticle( );
      p.velocity = vec3.fromValues( (Math.random()*20)-10, (Math.random()*20)-10, 0 );
      vec3.normalize( p.velocity, p.velocity );
      vec3.scale( p.velocity, p.velocity, 1.0 / 500 );
      p.position = vec3.fromValues( Math.random(), Math.random(), 0 );
      p.radius = 0.1;//((Math.random()*30-5)+5)/100.0;
      p.color = vec4.fromValues( Math.ceil(Math.random()*10.0)/10.0, Math.ceil(Math.random()*10.0)/10.0, Math.ceil(Math.random()*10.0)/10.0, 1.0 );
    }
  }

  this.spawnParticles( 25 );

  /*
   * quadrant:
   * |=====|=====|
   * |  1  |  0  |
   * |-----|-----|
   * |  2  |  3  |
   * |=====|=====|
   *
   * shader:
   *   - MetaballComponent.MetaballShader
   *   - MetaballComponent.TextureShader
   *   - MetaballComponent.OutlineMetaballShader
   *   - MetaballComponent.HueMetaballShader
   */
  this.drawQuadrant = function( quadrant, shader ) {
    /* Render the Pre-Metaball RenderTarget to the Canvas ( On the Left Side ) */
    Game.pushMatrix( );
    var x, y;
    switch (quadrant) {
      case 0: x = 1.0; y = 1.0; break;
      case 1: x = -1.0; y = 1.0; break;
      case 2: x = -1.0; y = -1.0; break;
      case 3: x = 1.0; y = -1.0; break;
    }
    mat4.translate( Game.mMatrix, Game.mMatrix, vec3.fromValues( x, y, 0.0 ) );
    if (shader.apply( ))
    {
      this.vertexPositionBuffer.bindBuffer();
      gl.enableVertexAttribArray(shader.vertexPositionAttribute);
      gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
      this.vertexTextureBuffer.bindBuffer();
      gl.enableVertexAttribArray(shader.vertexTextureAttribute);
      gl.vertexAttribPointer(shader.vertexTextureAttribute, this.vertexTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
      this.indexBuffer.bindBuffer();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);

      this.indexBuffer.bindBuffer();
      gl.uniformMatrix4fv(shader.mMatrix, false, Game.mMatrix);
      gl.uniformMatrix4fv(shader.vMatrix, false, Game.vMatrix);
      gl.uniformMatrix4fv(shader.pMatrix, false, Game.pMatrix);

      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

      gl.disableVertexAttribArray(shader.vertexPositionAttribute);
      gl.disableVertexAttribArray(shader.vertexTextureAttribute);
      this.vertexPositionBuffer.unbindBuffer();
      this.vertexTextureBuffer.unbindBuffer();
      this.indexBuffer.unbindBuffer();
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    Game.popMatrix( );
    /* */
  }

  this.draw = function( gl )
  {
    /* Render to the RenderTarget */
    target.begin( );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    // Enable Blending so the Alphas work properly
    gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
    gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA );
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const kCycleTimeMs = 30000.0;
    gl.uniform1f(MetaballComponent.HueMetaballShader.hue, (((Date.now() - this.startTime) % kCycleTimeMs) / kCycleTimeMs));

    if (MetaballComponent.MetaballPointsShader.apply( ))
    {
      this.vertexPositionBuffer.bindBuffer();
      gl.enableVertexAttribArray(MetaballComponent.MetaballPointsShader.vertexPositionAttribute);
      gl.vertexAttribPointer(MetaballComponent.MetaballPointsShader.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
      this.indexBuffer.bindBuffer();

      var viewport = [ 0.0, 0.0, 1.0, 1.0 ];

      var p;
      for(i in ParticleManager.Instance().m_members)
      {
        p = ParticleManager.Instance().m_members[i];

        /* Bounce Particles */
          if ( p.position[0] < viewport[0] || p.position[0] > viewport[2] )
            p.velocity[0] *= -1.0;
          if ( p.position[1] < viewport[1] || p.position[1] > viewport[3] )
            p.velocity[1] *= -1.0;
        /* */

        gl.uniform3f(MetaballComponent.MetaballPointsShader.lightPosition, p.position[0], p.position[1], 0.0);
        gl.uniform4f(MetaballComponent.MetaballPointsShader.lightColor, p.color[0], p.color[1], p.color[2], p.color[3]);
        gl.uniform1f(MetaballComponent.MetaballPointsShader.lightRadius, p.radius);
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);
      }

      gl.disableVertexAttribArray(MetaballComponent.MetaballPointsShader.vertexPositionAttribute);
      this.indexBuffer.unbindBuffer();
      this.vertexPositionBuffer.unbindBuffer();
    }
    target.end( );
    /* */

    // Disable Blending, it will look off when rendering the final results.
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    this.drawQuadrant(1, MetaballComponent.TextureShader);
    this.drawQuadrant(0, MetaballComponent.MetaballShader);
    this.drawQuadrant(2, MetaballComponent.OutlineMetaballShader);
    this.drawQuadrant(3, MetaballComponent.HueMetaballShader);
  }
}

MetaballComponent.TextureShader = null;