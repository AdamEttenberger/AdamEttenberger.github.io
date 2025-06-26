MetaballComponent.prototype = new GameObjectComponent();
MetaballComponent.prototype.constructor = MetaballComponent;
MetaballComponent.Mode = {
  kVersion2012: "Version2012",
  kVersion2025: "Version2025",
  kWebFigureBaseTexture: "WebFigureBaseTexture",
  kWebFigureDiffuse: "WebFigureDiffuse",
  kWebFigureDiffuseOutline: "WebFigureDiffuseOutline",
  kWebFigureHueOutline: "WebFigureHueOutline",
};
MetaballComponent.Placement = {
  kUpperLeft: "UpperLeft",
  kUpperRight: "UpperRight",
  kLowerLeft: "LowerLeft",
  kLowerRight: "LowerRight",
  kStretch: "Stretch",
};
MetaballComponent.UniformType = {
  alpha: 0,
  sampler: 1,
  mMatrix: 2,
  vMatrix: 3,
  pMatrix: 4,
  renderbufferSize: 5,
  lightPosition: 6,
  lightRadius: 7,
  lightColor: 8,
  threshold: 9,
  hue: 10,
};
MetaballComponent.TextureShader = null;

function MetaballComponent( run_mode )
{
  const kRenderTargetResolution = 512;

  this.init = function( ) {
    var pending_shaders = [];
    // Initialize Default Vertex Texture shader
    if ( gl != null )
    {
      // Shader for Rendering a basic Texture
      if (MetaballComponent.TextureShader == null)
      {
        MetaballComponent.TextureShader = new ShaderProgram( );
        var loader = Promise.all([
          MetaballComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-vs.c", gl.VERTEX_SHADER ),
          MetaballComponent.TextureShader.attachShader( "/library/webgl/shaders/texture-fs.c", gl.FRAGMENT_SHADER ),
        ])
        .then(() => {
          MetaballComponent.TextureShader.linkProgram( );
          MetaballComponent.TextureShader.apply( );

          MetaballComponent.TextureShader.registerVertexAttributes(new Map([
            [Buffer.POSITION, "aVertexPosition"],
            [Buffer.TEXTURE, "aTextureCoord"],
          ]));
          MetaballComponent.TextureShader.registerUniformLocations(new Map([
              [MetaballComponent.UniformType.alpha, "uAlpha"],
              [MetaballComponent.UniformType.sampler, "uSampler"],
              [MetaballComponent.UniformType.mMatrix, "mMatrix"],
              [MetaballComponent.UniformType.vMatrix, "vMatrix"],
              [MetaballComponent.UniformType.pMatrix, "pMatrix"],
          ]));

          MetaballComponent.TextureShader.setUniform1f(MetaballComponent.UniformType.alpha, 1.0);
        })
        .catch(e => {
            throw e;
        });
        pending_shaders.push(loader);
      }

      // Shader for Rendering Gradient Points on the GPU
      if (MetaballComponent.MetaballPointsShader == null)
      {
        MetaballComponent.MetaballPointsShader = new ShaderProgram( );
        var loader = Promise.all([
          MetaballComponent.MetaballPointsShader.attachShader( "/library/projects/metaballs/shaders/metaball-points-vs.c", gl.VERTEX_SHADER ),
          MetaballComponent.MetaballPointsShader.attachShader( this.getMetaballPointsShaderPath(), gl.FRAGMENT_SHADER ),
        ])
        .then(() => {
          MetaballComponent.MetaballPointsShader.linkProgram( );
          MetaballComponent.MetaballPointsShader.apply( );

          MetaballComponent.MetaballPointsShader.registerVertexAttributes(new Map([
            [Buffer.POSITION, "aVertexPosition"],
            [Buffer.COLOR, "aVertexColor"],
          ]));
          MetaballComponent.MetaballPointsShader.registerUniformLocations(new Map([
              [MetaballComponent.UniformType.alpha, "uAlpha"],
              [MetaballComponent.UniformType.renderbufferSize, "uRenderbufferSize"],
              [MetaballComponent.UniformType.lightPosition, "uLightPosition"],
              [MetaballComponent.UniformType.lightRadius, "uLightRadius"],
              [MetaballComponent.UniformType.lightColor, "uLightColor"],
          ]));

          MetaballComponent.MetaballPointsShader.setUniform1f(MetaballComponent.UniformType.alpha, 1.0);
          MetaballComponent.MetaballPointsShader.setUniform2f(MetaballComponent.UniformType.renderbufferSize, kRenderTargetResolution, kRenderTargetResolution);
        });
        pending_shaders.push(loader);
      }

      // Shader for Rendering Metaballs given a Texture with gradient Alpha
      if (MetaballComponent.MetaballShader == null)
      {
        MetaballComponent.MetaballShader = new ShaderProgram( );
        var loader = Promise.all([
          MetaballComponent.MetaballShader.attachShader( "/library/projects/metaballs/shaders/metaball-vs.c", gl.VERTEX_SHADER ),
          MetaballComponent.MetaballShader.attachShader( "/library/projects/metaballs/shaders/metaball-fs.c", gl.FRAGMENT_SHADER ),
        ])
        .then(() => {
          MetaballComponent.MetaballShader.linkProgram( );
          MetaballComponent.MetaballShader.apply( );

          MetaballComponent.MetaballShader.registerVertexAttributes(new Map([
            [Buffer.POSITION, "aVertexPosition"],
            [Buffer.TEXTURE, "aTextureCoord"],
          ]));
          MetaballComponent.MetaballShader.registerUniformLocations(new Map([
              [MetaballComponent.UniformType.alpha, "uAlpha"],
              [MetaballComponent.UniformType.threshold, "uThreshold"],
              [MetaballComponent.UniformType.sampler, "uSampler"],
              [MetaballComponent.UniformType.mMatrix, "mMatrix"],
              [MetaballComponent.UniformType.vMatrix, "vMatrix"],
              [MetaballComponent.UniformType.pMatrix, "pMatrix"],
          ]));

          MetaballComponent.MetaballShader.setUniform1f(MetaballComponent.UniformType.alpha, 1.0);
        });
        pending_shaders.push(loader);
      }

      // Shader for Rendering Outlined Metaballs given a Texture with gradient Alpha
      if (MetaballComponent.OutlineMetaballShader == null)
      {
        MetaballComponent.OutlineMetaballShader = new ShaderProgram( );
        var loader = Promise.all([
          MetaballComponent.OutlineMetaballShader.attachShader( "/library/projects/metaballs/shaders/outline-metaball-vs.c", gl.VERTEX_SHADER ),
          MetaballComponent.OutlineMetaballShader.attachShader( "/library/projects/metaballs/shaders/outline-metaball-fs.c", gl.FRAGMENT_SHADER ),
        ])
        .then(() => {
          MetaballComponent.OutlineMetaballShader.linkProgram( );
          MetaballComponent.OutlineMetaballShader.apply( );

          MetaballComponent.OutlineMetaballShader.registerVertexAttributes(new Map([
            [Buffer.POSITION, "aVertexPosition"],
            [Buffer.TEXTURE, "aTextureCoord"],
          ]));
          MetaballComponent.OutlineMetaballShader.registerUniformLocations(new Map([
              [MetaballComponent.UniformType.alpha, "uAlpha"],
              [MetaballComponent.UniformType.threshold, "uThreshold"],
              [MetaballComponent.UniformType.sampler, "uSampler"],
              [MetaballComponent.UniformType.mMatrix, "mMatrix"],
              [MetaballComponent.UniformType.vMatrix, "vMatrix"],
              [MetaballComponent.UniformType.pMatrix, "pMatrix"],
          ]));

          MetaballComponent.OutlineMetaballShader.setUniform1f(MetaballComponent.UniformType.alpha, 1.0);
        });
        pending_shaders.push(loader);
      }

      // Shader for Rendering Outlined Metaballs given a Texture with gradient Alpha
      if (MetaballComponent.HueMetaballShader == null)
      {
        MetaballComponent.HueMetaballShader = new ShaderProgram( );
        var loader = Promise.all([
          MetaballComponent.HueMetaballShader.attachShader( "/library/projects/metaballs/shaders/hue-metaball-vs.c", gl.VERTEX_SHADER ),
          MetaballComponent.HueMetaballShader.attachShader( "/library/projects/metaballs/shaders/hue-metaball-fs.c", gl.FRAGMENT_SHADER ),
        ])
        .then(() => {
          MetaballComponent.HueMetaballShader.linkProgram( );
          MetaballComponent.HueMetaballShader.apply( );

          MetaballComponent.HueMetaballShader.registerVertexAttributes(new Map([
            [Buffer.POSITION, "aVertexPosition"],
            [Buffer.TEXTURE, "aTextureCoord"],
          ]));
          MetaballComponent.HueMetaballShader.registerUniformLocations(new Map([
              [MetaballComponent.UniformType.alpha, "uAlpha"],
              [MetaballComponent.UniformType.threshold, "uThreshold"],
              [MetaballComponent.UniformType.hue, "uHue"],
              [MetaballComponent.UniformType.sampler, "uSampler"],
              [MetaballComponent.UniformType.mMatrix, "mMatrix"],
              [MetaballComponent.UniformType.vMatrix, "vMatrix"],
              [MetaballComponent.UniformType.pMatrix, "pMatrix"],
          ]));

          MetaballComponent.HueMetaballShader.setUniform1f(MetaballComponent.UniformType.alpha, 1.0);
          MetaballComponent.HueMetaballShader.setUniform1f(MetaballComponent.UniformType.hue, 0.0);
        });
        pending_shaders.push(loader);
      }
    }

    Promise.all(pending_shaders).then(() => {
      this.applyAlphaThresholdValues();
    });
  }

  var target = new RenderTarget( kRenderTargetResolution, kRenderTargetResolution );
  target.texture.loaded = true;

  var planarVertices = [ -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0 ];
  var planarUV = [ 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 ];
  var planarIndices = [ 0, 1, 2, 0, 2, 3 ];
  var startTime = Date.now();

  this.mode = run_mode ?? MetaballComponent.Mode.kVersion2025;
  this.g_radius = 0.1;
  this.g_threshold = 0.5;
  this.vertexPositionBuffer = new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, planarVertices, 3 );
  this.vertexTextureBuffer = new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, planarUV, 2 );
  this.indexBuffer = new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, planarIndices, 1 );

  this.runLatest = function() {
    return this.mode != MetaballComponent.Mode.kVersion2012;
  }

  this.getMetaballPointsShaderPath = function() {
    return (this.runLatest())
        ? "/library/projects/metaballs/shaders/metaball-points-fs-v2025.c"
        : "/library/projects/metaballs/shaders/metaball-points-fs-v2012.c";
  }

  this.spawnParticles = function( count )
  {
    for(i = 0; i < count; i++)
    {
      var p = ParticleManager.Instance().createParticle( );
      p.velocity = vec3.fromValues( (Math.random()*20)-10, (Math.random()*20)-10, 0 );
      vec3.normalize( p.velocity, p.velocity );
      vec3.scale( p.velocity, p.velocity, 1.0 / 500 );
      p.position = vec3.fromValues( Math.random(), Math.random(), 0 );
      // p.radius = 0.1;//((Math.random()*30-5)+5)/100.0;
      p.color = vec4.fromValues( Math.ceil(Math.random()*10.0)/10.0, Math.ceil(Math.random()*10.0)/10.0, Math.ceil(Math.random()*10.0)/10.0, 1.0 );
    }
  }

  this.setParticleCount = function( count ) {
    var delta = count - ParticleManager.Instance().length();
    if (delta > 0) {
      this.spawnParticles(delta);
    } else if (delta < 0) {
      ParticleManager.Instance().destroyParticleCount(-delta);
    }
  }

  this.setAlphaThreshold = function(threshold) {
    var changed = (this.g_threshold != threshold);
    this.g_threshold = threshold;
    if (changed) {
      this.applyAlphaThresholdValues();
    }
  }

  this.applyAlphaThresholdValues = function() {
    if (MetaballComponent.MetaballShader?.apply()) {
      MetaballComponent.MetaballShader.setUniform1f(MetaballComponent.UniformType.threshold, this.g_threshold);
    }
    if (MetaballComponent.OutlineMetaballShader?.apply()) {
      MetaballComponent.OutlineMetaballShader.setUniform1f(MetaballComponent.UniformType.threshold, this.g_threshold);
    }
    if (MetaballComponent.HueMetaballShader?.apply()) {
      MetaballComponent.HueMetaballShader.setUniform1f(MetaballComponent.UniformType.threshold, this.g_threshold);
    }
  }

  this.setParticleCount( 40 );

  /*
   * quadrant:
   * |=====|=====|
   * |  1  |  0  |
   * |-----|-----|
   * |  2  |  3  |
   * |=====|=====|
   *
   * shader:
   *   - (0) MetaballComponent.MetaballShader
   *   - (1) MetaballComponent.TextureShader
   *   - (2) MetaballComponent.OutlineMetaballShader
   *   - (3) MetaballComponent.HueMetaballShader
   */
  this.drawShader = function( placement, shader ) {
    /* Render the Pre-Metaball RenderTarget to the Canvas ( On the Left Side ) */
    Game.pushMatrix( );
    var x, y;
    var scale = 1.0;
    switch (placement) {
      case MetaballComponent.Placement.kUpperLeft: x = -1.0; y = 1.0; break;
      case MetaballComponent.Placement.kUpperRight: x = 1.0; y = 1.0; break;
      case MetaballComponent.Placement.kLowerLeft: x = -1.0; y = -1.0; break;
      case MetaballComponent.Placement.kLowerRight: x = 1.0; y = -1.0; break;
      case MetaballComponent.Placement.kStretch: x = 0.0; y = 0.0; scale = 2.0; break;
    }
    mat4.translate( Game.mMatrix, Game.mMatrix, vec3.fromValues( x, y, 0.0 ) );
    if (scale != 1.0) {
      mat4.scale( Game.mMatrix, Game.mMatrix, vec3.fromValues( scale, scale, 1.0 ) );
    }
    if (shader.apply( ))
    {
      shader.bindBuffers([
        this.vertexPositionBuffer,
        this.vertexTextureBuffer,
        this.indexBuffer,
      ]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);

      shader.setUniformMat4(MetaballComponent.UniformType.mMatrix, Game.mMatrix);
      shader.setUniformMat4(MetaballComponent.UniformType.vMatrix, Game.vMatrix);
      shader.setUniformMat4(MetaballComponent.UniformType.pMatrix, Game.pMatrix);

      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);

      shader.unbindBuffers([
        this.vertexPositionBuffer,
        this.vertexTextureBuffer,
        this.indexBuffer,
      ]);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    Game.popMatrix( );
    /* */
  }

  this.draw = function( gl )
  {
    /* Render to the RenderTarget */
    target.begin( );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    // Enable Blending so the Alphas work properly
    gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
    gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const kCycleTimeMs = 30000.0;
    MetaballComponent.HueMetaballShader.apply( );
    MetaballComponent.HueMetaballShader.setUniform1f(MetaballComponent.UniformType.hue, (((Date.now() - startTime) % kCycleTimeMs) / kCycleTimeMs));

    if (MetaballComponent.MetaballPointsShader.apply( ))
    {
      MetaballComponent.MetaballPointsShader.bindBuffers([
        this.vertexPositionBuffer,
        this.indexBuffer,
      ]);

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

        MetaballComponent.MetaballPointsShader.setUniform3f(MetaballComponent.UniformType.lightPosition, p.position[0], p.position[1], 0.0);
        MetaballComponent.MetaballPointsShader.setUniform4f(MetaballComponent.UniformType.lightColor, p.color[0], p.color[1], p.color[2], p.color[3]);
        MetaballComponent.MetaballPointsShader.setUniform1f(MetaballComponent.UniformType.lightRadius, this.g_radius);

        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0);
      }

      MetaballComponent.MetaballPointsShader.unbindBuffers([
        this.vertexPositionBuffer,
        this.indexBuffer,
      ]);
    }
    target.end( );
    /* */

    // Disable Blending, it will look off when rendering the final results.
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    switch (this.mode) {
      case MetaballComponent.Mode.kVersion2012:
      case MetaballComponent.Mode.kVersion2025:
        this.drawShader(MetaballComponent.Placement.kUpperLeft, MetaballComponent.TextureShader);
        this.drawShader(MetaballComponent.Placement.kUpperRight, MetaballComponent.MetaballShader);
        this.drawShader(MetaballComponent.Placement.kLowerLeft, MetaballComponent.OutlineMetaballShader);
        this.drawShader(MetaballComponent.Placement.kLowerRight, MetaballComponent.HueMetaballShader);
        break;
      case MetaballComponent.Mode.kWebFigureBaseTexture:
        this.drawShader(MetaballComponent.Placement.kStretch, MetaballComponent.TextureShader);
        break;
      case MetaballComponent.Mode.kWebFigureDiffuse:
        this.drawShader(MetaballComponent.Placement.kStretch, MetaballComponent.MetaballShader);
        break;
      case MetaballComponent.Mode.kWebFigureDiffuseOutline:
        this.drawShader(MetaballComponent.Placement.kStretch, MetaballComponent.OutlineMetaballShader);
        break;
      case MetaballComponent.Mode.kWebFigureHueOutline:
        this.drawShader(MetaballComponent.Placement.kStretch, MetaballComponent.HueMetaballShader);
        break;
    }
  }

  this.handleMessage = function( message ) {
    this.g_radius = message.radius;
    this.setAlphaThreshold(message.threshold);
    this.setParticleCount(message.count);
  }

  this.serialize = async function() {
    return {
      "type": "MetaballComponent",
      "mode": this.mode,
      "radius": this.g_radius,
      "threshold": this.g_threshold,
    };
  }

  this.deserialize = function(jsonObject) {
    if (jsonObject.type !== "MetaballComponent") {
      return;
    }
    this.mode = jsonObject.mode ?? MetaballComponent.Mode.kVersion2025;
    this.g_radius = jsonObject.radius ?? 0.1;
    this.g_threshold = jsonObject.threshold ?? 0.5;
    return this;
  }


  this.init();
}
