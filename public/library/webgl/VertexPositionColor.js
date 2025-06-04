VertexPositionColor.prototype = new IVertexDeclaration();
VertexPositionColor.prototype.constructor = VertexPositionColor;

function VertexPositionColor( spPositionPointer, spColorPointer )
{
  this.spPositionPointer =  spPositionPointer
  this.spColorPointer = spColorPointer;
}