function ShaderProgram( )
{
  var shaderProgram = gl.createProgram( );
  var loaded = false;

  shaderProgram.attachShader = function( filename, shaderType )
  {
    return LoadFileAsync('GET', filename)
    .then(xhr => {
      var contents = xhr.responseText;
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, contents);
      gl.compileShader(shader);
      if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) )
      {
        console.log(gl.getShaderInfoLog(shader));
        throw "GL_SHADER_ERROR";
      }
      gl.attachShader( shaderProgram, shader );
        })
        .catch( e => Game.ExceptionHandler(e) );
  }

  shaderProgram.linkProgram = function( )
  {
    gl.linkProgram( shaderProgram );

    if ( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) )
    {
      console.log("Could not initialise shaders");
      throw "GL_SHADER_PROGRAM_ERROR";
    }

    loaded = true;
  }

  shaderProgram.apply = function( )
  {
    if ( loaded ) {
      gl.useProgram( shaderProgram );
      return true;
    }
    return false;
  }

  shaderProgram.isLoaded = function( )
  {
    return loaded;
  }

  return shaderProgram;
}
