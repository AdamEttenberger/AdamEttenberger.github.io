function RenderTarget(width, height)
{
  var frameBuffer;
  var renderBuffer;
  var previousViewport;
  this.texture;

  /* Initialize the FrameBuffer and RenderBuffer */
  // Initialize the FrameBuffer
  frameBuffer = gl.createFramebuffer( );
  gl.bindFramebuffer( gl.FRAMEBUFFER, frameBuffer );
  frameBuffer.width = width;
  frameBuffer.height = height;

  // Initialize the Texture
  this.texture = gl.createTexture( );
  gl.bindTexture( gl.TEXTURE_2D, this.texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frameBuffer.width, frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  // Initialize the RenderBuffer
  renderBuffer = gl.createRenderbuffer( );
  gl.bindRenderbuffer( gl.RENDERBUFFER, renderBuffer );
  gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, frameBuffer.width, frameBuffer.height );

  // Attach the Texture to RenderBuffer
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0 );
  gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer );

  // Unbind everything so we can render to the canvas
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer( gl.RENDERBUFFER, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  /* */

  this.begin = function()
  {
    previousViewport = gl.getParameter( gl.VIEWPORT );
    gl.bindFramebuffer( gl.FRAMEBUFFER, frameBuffer );
    gl.viewport( 0, 0, frameBuffer.width, frameBuffer.height );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  }

  this.end = function()
  {
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.generateMipmap( gl.TEXTURE_2D ); // Generate a mipmap for the final texture
    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl.viewport( 0, 0, previousViewport[2], previousViewport[3] );
  }
}