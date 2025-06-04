function Buffer( gl, bufferType, GL_ARRAY_TYPE, arr, itemSize )
{
  var type = GL_ARRAY_TYPE;
  this.BufferType = bufferType;
  this.buff = gl.createBuffer();
  this.itemSize = itemSize;
  this.numItems = arr.length / itemSize;

  if ( type == gl.ARRAY_BUFFER )
  {
    gl.bindBuffer( type, this.buff );
    gl.bufferData( type, new Float32Array(arr), gl.STATIC_DRAW );
  }
  else if ( type == gl.ELEMENT_ARRAY_BUFFER )
  {
    gl.bindBuffer( type, this.buff );
    gl.bufferData( type, new Uint8Array(arr), gl.STATIC_DRAW );
  }
  else
    throw new Error("Must supply ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER as GL_ARRAY_TYPE");

  this.bindBuffer = function()
  {
    gl.bindBuffer( type, this.buff );
    /*
    if ( this.attribute != null )
    {
      gl.enableVertexAttribArray(this.attribute);
      gl.vertexAttribPointer(this.attribute, this.itemSize, gl.FLOAT, false, 0, 0);
    }
    */
  }

  this.unbindBuffer = function()
  {
    /*
    if ( this.attribute != null )
      gl.disableVertexAttribArray(this.attribute);
    */
    gl.bindBuffer( type, null );
  }
}

Buffer.INDEX    = 0;
Buffer.POSITION    = 1;
Buffer.COLOR    = 2;
Buffer.TEXTURE    = 4;
Buffer.NORMAL    = 8;