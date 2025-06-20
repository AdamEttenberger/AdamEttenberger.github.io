window.addEventListener("load", main, true);
window.addEventListener("message", handleMessage);

var game;
var shaderProgram;
var buffers = new Array();
var metaball_component;

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

  // Expects to be run from an iframe.
  // e.g., <iframe src="/library/projects/metaballs/main.html?mode=WebFigure1"></iframe>
  const url_params = new URLSearchParams(window.location.search);
  initScene(url_params.get('mode'));

  mat4.ortho(Game.pMatrix, -2.0, 2.0, -2.0, 2.0, 0.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -100.0));

  game.start();
}

function initScene(mode)
{
  game.m_managers.push( ParticleManager.Instance() );

  var plane = new GameObject();
  metaball_component = new MetaballComponent(mode);
  plane.addComponent( metaball_component );

  game.m_root.addChildGameObject( plane );
}

function handleMessage( event ) {
  if (event.origin !== window.location.origin) {
    return;
  }

  metaball_component.handleMessage( event.data );
}