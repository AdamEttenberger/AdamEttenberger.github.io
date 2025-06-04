window.addEventListener("load", main, true);

var game;
var shaderProgram;
var buffers = new Array();

function main()
{
  var canvas = document.querySelector("canvas");

  canvas.style.minWidth = 800;
  canvas.style.minHeight = 600;

  try {
    game = new Game(canvas);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }
  catch(e)
  {
    document.querySelector("canvas.game").html(Game.ExceptionToMessage(e));
    return;
  }

  initScene();

  mat4.ortho(Game.pMatrix, -2.0, 2.0, -2.0, 2.0, 0.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -100.0));

  game.start();
}

function initScene()
{
  game.m_managers.push( ParticleManager.Instance() );

  var plane = new GameObject();
  plane.addComponent( new MetaballComponent( ) );

  game.m_root.addChildGameObject( plane );
}