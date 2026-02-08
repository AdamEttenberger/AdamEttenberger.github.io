<script setup lang="ts">
import { ref } from 'vue'
import Code from '@/components/code.vue'
import Layer from '@/components/layer.vue'
import Details from '@/components/details.vue'
import Link from '@/components/link.vue'
import Figure from '@/components/figure.vue'
import Player from '@/components/player.vue'
import { PlayerState } from '@/types/player_state'
import Section from '@/components/section.vue'
import { IProjectInfo } from '@/types/project_types'
import useIntersectionObserver from '@/composables/intersection_observer'

defineProps<IProjectInfo>();
const player_states = ref({});

const { observe: mapPlayerIntersectionObserver } = useIntersectionObserver((key, entry, _index, _array) => {
  player_states.value[key] = entry.isIntersecting
      ? PlayerState.Playing
      : PlayerState.Empty;
});

function makePlayerRef(key) {
  return (e) => mapPlayerIntersectionObserver(key, e?.$el);
}

function onPlayerLoaded(target_frame, filepath) {
  postMessageToFrame(target_frame, filepath);
}

function postMessageToFrame(target_frame, filepath) {
  target_frame.contentWindow.postMessage({
    file: filepath,
  }, window.location.origin);
}
</script>

<template>
  <article>
    <Player :ref="makePlayerRef('main')" :state="player_states['main']"
            :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/proto_engine/main.html" />

    <!-- <Layer> -->
      <Section heading="What's this?">
        <p>
          This project is a simple proof-of-concept component based game engine, heavily inspired by Unity's component based <Link to="https://docs.unity3d.com/ScriptReference/GameObject.html">GameObject</Link> + <Link to="https://docs.unity3d.com/ScriptReference/MonoBehaviour.html">MonoBehavior</Link> model.
          This is the foundation for the WebGL Flocking and Metaballs projects which are projects I worked on while at college.
          The flocking demo was originally a ShockWave Flash application, and the Metaballs project was originally a Windows based C++ OpenGL application.
        </p>
        <p>
          <Link to="https://en.wikipedia.org/wiki/Adobe_Flash">Adobe Flash</Link> was a powerful animation and media tool, and popular choice for browser games.
          However <Link to="https://en.wikipedia.org/wiki/WebGL">WebGL</Link>, a new experimental technology became available around the same time Flash's end-of-life discussions began.
          This project was driven by both a desire to learn a new technology and to get ahead of the deprecation of Flash.
          At this point in time I had some experience working with the native C++ OpenGL API on Windows, but browser support for WebGL was still in its infancy.
        </p>
      </Section>

      <Section heading="Goals">
        <ul>
          <li>Implement a basic 3D scene without importing a third-party game engine or rendering framework.</li>
          <li>Interchangeable model rendering types (color, texture, color + texture).</li>
          <li>Easy to quickly prototype new behaviors.</li>
        </ul>
      </Section>

      <Section heading="Overview">
        <p>
          This program was designed to be a simple and minimal prototyping environment, and a quick way to migrate my Flocking demo away from a dying web technology. It consists of a few key objects:
        </p>
        <ul class="list-none">
          <li>
            <Details summary="Game">
              <p>The core of the application which handles the main loop, resource loading, and owns the scene tree composed of GameObjects and their GameObjectComponents.</p>
            </Details>
          </li>
          <li>
            <Details summary="GameObject">
              <p>The main high-level primitive in the engine, a node within a tree of GameObject instances which may have a single parent and many children, a collection of GameObjectComponent instances and helpful methods.</p>
            </Details>
          </li>
          <li>
            <Details summary="GameObjectComponent">
              <p>Any atomic bundle of data which may be attached to a GameObject.</p>
            </Details>
          </li>
        </ul>

        <p>
          This demo utilizes the following set of components:
        </p>
        <ul class="list-none">
          <li>
            <Details summary="Transform">
              <p>Owns the local transformation matrix, and intermediary values to provide a GameObject with local position, rotation, and scale information.</p>
            </Details>
          </li>
          <li>
            <Details summary="RotateComponent">
              <p>Owns a relative angular velocity as a Quaternion which is applied to a GameObject Transform each frame.</p>
            </Details>
          </li>
          <li>
            <Details summary="ModelComponent">
              <p>Owns a VertexBuffer, IndexBuffer, ShaderProgram, and logic for rendering vertices with position and color data.</p>
            </Details>
          </li>
          <li>
            <Details summary="TextureModelComponent">
              <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position and texture data.</p>
            </Details>
          </li>
          <li>
            <Details summary="ColorTextureModelComponent">
              <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position, color, and texture data.</p>
            </Details>
          </li>
        </ul>
        <Figure src_light="/images/projects/proto_engine/architecture_light.png"
                src_dark="/images/projects/proto_engine/architecture_dark.png"
                alt="UML-like class relationship diagram." />
        <Figure src_light="/images/projects/proto_engine/scene_light.png"
                src_dark="/images/projects/proto_engine/scene_dark.png"
                alt="Scene hierarchy, the Game has 2 children, a triangular prism model and invisible pivot. The invisible pivot has 3 children, the colored, skinned, and colored + skinned cube models. All GameObject instances have a Transform and RotateComponent." />
      </Section>

      <Section heading="WebGL Tutorial?">
        <p>
          This isn't a WebGL tutorial.
          For a deeper dive I encourage checking out the excellent MDN <Link to="https://developer.mozilla.org/docs/Web/API/WebGL_API">WebGL API documentation</Link> and <Link to="https://developer.mozilla.org/docs/Web/API/WebGL_API/Tutorial">WebGL tutorial</Link> for modern best practices.
          Also check out <Link to="https://learnopengl.com/">https://learnopengl.com/</Link> which is a great primer for OpenGL and rendering concepts.
          Keep in mind that this project is fairly old and was quickly thrown together.
          Something to consider if you're starting a new WebGL project is <Link to="https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/getContext">HTMLCanvasElement.getContext</Link> now supports more modern advanced OpenGL APIs like "webgl2" and "webgpu".
          This project originally targeted "webgl" and "experimental-webgl" APIs.
        </p>
      </Section>

      <Section heading="Important API Differences">
        <p>
          There are a few concepts I want to briefly mention, as rendering APIs can differ significantly in their default behavior, even if that behavior is configurable.
          This demo relies on WebGL APIs which are based on OpenGL.
        </p>
        <p>
          OpenGL uses a "right-handed" coordinate system while DirectX uses a "left-handed" coordinate system.
          The main differences are the z-axis is inverted and rotations other than the z-axis are opposite one another.
          In OpenGL the forward (into the screen) vector is (-z) and DirectX forward is (+z).
          With rotation the "rule of thumb" is to point your thumb (based on the coordinate system "handed-ness") along a positive-axis and positive-rotation turns the direction your fingers curl when making a fist.
          Since the z-axis is inverted, rotation around the positive z-axis is the same direction for both systems.
        </p>
        <Figure src_light="/images/projects/proto_engine/coordinate_system_light.png"
                src_dark="/images/projects/proto_engine/coordinate_system_dark.png"
                alt="Illustration of the default coordinate system in OpenGL (left) and DirectX (right)." />
        <p>
          Texture coordinates are also inverted along the y-axis.
          In OpenGL the UV origin is the bottom-left corner while in DirectX the UV origin is the top-left corner.
        </p>
        <Figure src_light="/images/projects/proto_engine/uv_coordinate_system_light.png"
                src_dark="/images/projects/proto_engine/uv_coordinate_system_dark.png"
                alt="Illustration of the default UV coordinate system in OpenGL (left) and DirectX (right)." />
        <p>
          When considering <Link to="https://en.wikipedia.org/wiki/Back-face_culling">back-face culling</Link> the windings are opposite as well.
          By default OpenGL uses a counter-clockwise front-face winding while DirectX uses a clockwise front-face winding.
        </p>
        <Figure src_light="/images/projects/proto_engine/winding_order_light.png"
                src_dark="/images/projects/proto_engine/winding_order_dark.png"
                alt="Illustration of the default winding order in OpenGL (left) and DirectX (right)." />
        <p>
          Keep in mind this is just the tip of the iceberg; a few important high-level differences that can be confusing when first getting started with rendering.
        </p>
      </Section>

      <Section heading="Building a Scene">
        <p>
          First the Game object is initialized:
        </p>
        <Code lang="javascript"
              caption="Creates a new `Game` object."
              text="
          var canvas = document.querySelector('canvas');
          game = new Game(canvas);
          game.clear_color = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
        " />
        <p>
          Then Model data is loaded:
        </p>
        <Code lang="javascript"
              caption="Load vertex position, color, and index buffers for a unit equilateral triangle into WebGL."
              text="
            var v1 = vec3.fromValues(0, 1, 0);
            var v2 = vec3.rotateZ(/*dest=*/vec3.create(),
                                  /*src=*/v1,
                                  /*origin=*/vec3.create(),
                                  /*radians=*/(2/3) * Math.PI);
            var v3 = vec3.rotateZ(/*dest=*/vec3.create(),
                                  /*src=*/v1,
                                  /*origin=*/vec3.create(),
                                  /*radians=*/-(2/3) * Math.PI);

            var buffers = [
              new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER,
                [
                  Array.from(v1),
                  Array.from(v2),
                  Array.from(v3),
                ].flat(),
                3),
              new Buffer( gl, Buffer.COLOR, gl.ARRAY_BUFFER,
                [
                  1, 0, 0, 1, // red   #FF0000FF
                  0, 1, 0, 1, // green #00FF00FF
                  0, 0, 1, 1, // blue  #0000FFFF
                ],
                4),
              new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER,
                [
                  0, 1, 2,
                ],
                1),
            ];
        " />
        <p>
          Then the scene is populated and the camera is setup:
        </p>
        <Code lang="javascript"
              caption="Creates a new parent and child GameObject then adds the parent to the scene root."
              text="
          var triangle = new GameObject();
          triangle.addComponent(new ModelComponent().setBuffers(buffers));
          triangle.addComponent(new RotateComponent().pushEuler(0, 0, -120));
          game.m_root.addChildGameObject(triangle);" />
        <Code lang="javascript"
              caption="Setup the camera."
              text="
          // Setup the camera (move the world forward 5 units).
          mat4.perspective(game.pMatrix, 45, game.aspect, 1.0, 1000.0);
          mat4.fromTranslation(game.vMatrix, vec3.fromValues(0.0, 0.0, -5.0));
        " />
        <p>
          Finally, the game loop is started and any further updates should be driven by GameObjectComponent logic.
        </p>
        <Code lang="javascript"
              caption="Start the core game loop."
              text="
          game.start();
        " />
        <Player :ref="makePlayerRef('triangle')" :state="player_states['triangle']"
                title="Hello Triangle"
                :date="new Date('2025/06/26')"
                :lastmod="new Date('2025/06/26')"
                frame="/library/projects/proto_engine/hello_triangle.html" />
      </Section>

      <Section heading="Component Examples">
        <p>
          All components implement the same interface, GameObjectComponent, which contains an update and draw method which are called by the Game instance.
        </p>
        <Code lang="javascript" file="/library/proto_engine/GameObjectComponent.js" />
        <p>
          A simple component example is the RotateComponent, which applies an angular velocity to the object's transform each frame:
        </p>
        <Details summary="RotateComponent.js">
          <Code lang="javascript" file="/library/proto_engine/RotateComponent.js" />
        </Details>
        <p>
          A more complex example is the ColorTextureModelComponent which creates a ShaderProgram used to render itself:
        </p>
        <Details summary="ColorTextureModelComponent.js">
          <Code lang="javascript" file="/library/proto_engine/ColorTextureModelComponent.js" />
        </Details>
      </Section>

      <Section heading="Serialization/Deserialization">
        <p>
          Scenes or individual GameObjects can be serialized and deserialized, which enables support for saving and loading levels or prefab objects.
        </p>
        <p>
          For example, the "Hello Triangle" scene has been exported as the following JSON file:
        </p>
        <Details summary="hello_triangle.json">
          <Code file="/library/proto_engine/scenes/hello_triangle.json" />
        </Details>
        <p>
          The JSON may be loaded into the Proto-Engine, for example with this minimal project loader:
        </p>
        <Details summary="project_loader.js">
          <Code lang="javascript" file="/library/projects/proto_engine/project_loader.js" />
        </Details>
        <Player :ref="makePlayerRef('json-loader')" :state="player_states['json-loader']"
                title="hello_triangle.json"
                :date="new Date('2025/06/26')"
                :lastmod="new Date('2025/06/26')"
                frame="/library/projects/proto_engine/project_loader.html"
                @load="(e) => onPlayerLoaded(e, '/library/proto_engine/scenes/hello_triangle.json')" />
        <p>
          The following demo loads <Link public to="/library/proto_engine/scenes/deserialization_example.json">deserialization_example.json</Link> which is a scene composed of parts from the demo at the top of the page and the giant textured cube from the <RouterLink to="/projects/flocking">WebGL Flocking</RouterLink> project page.
          This also includes binary data such as models and textures which are output as a JSON array and base64 encoded string respectively.
          While JSON isn't the most space efficient file format, this does make it possible to deploy a game or demo with a single self-contained JSON file.
          JSON is very flexible for prototyping and very easy to work with in JavaScript.
        </p>
        <Player :ref="makePlayerRef('json-deserialize-example')" :state="player_states['json-deserialize-example']"
                title="deserialization_example.json"
                :date="new Date('2025/06/25')"
                :lastmod="new Date('2025/06/25')"
                frame="/library/projects/proto_engine/project_loader.html"
                @load="(e) => onPlayerLoaded(e, '/library/proto_engine/scenes/deserialization_example.json')" />
        <p>
          Serialization and deserialization are handled asynchronously, and JavaScript Promises make it easy to schedule parallel and order dependent tasks together.
          One challenge that came up involved serialization being called before a scene was fully loaded, since models and textures are bundled into the output.
          If a resource wasn't ready the serialization would fail, causing part of the scene tree to be pruned.
          However the fix was simple, the only change needed was to `await` the resource loader during serialization.
          This allows other serialization tasks to continue asynchronously while resource dependent tasks are blocked until they're ready.
        </p>
        <Code lang="javascript"
              caption="Texture serialization seamlessly waits until the texture is ready without blocking other tasks."
              text="
          // Game.js
          static async serializeTexture(texture) {
            await texture.loader;
            const canvas = document.createElement('canvas');
            canvas.width = texture.image.width;
            canvas.height = texture.image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(texture.image, 0, 0);
            return canvas.toDataURL('image/png', 1.0);
          }

          // TextureModelComponent.js
          async serialize() {
            return {
              'type': 'TextureModelComponent',
              'texture': await Game.serializeTexture(this.texture),
              'buffers': await Promise.all(this.buffers.map(element => element.serialize())),
            };
          }
        " />
        <Code lang="javascript"
              caption="High-level deserialization logic."
              text="
          // Game.js
          async deserializeGameObject(jsonGameObject) {
            var obj = new GameObject();
            // Ensure all components are added to the current object before deserializing children.
            await Promise.all(jsonGameObject.components?.map(this.deserializeComponent, this)).then(new_components => {
              new_components.forEach(component => obj.addComponent(component));
            });
            await Promise.all(jsonGameObject.children?.map(this.deserializeGameObject, this)).then(new_children => {
              new_children.forEach(child => obj.addChildGameObject(child));
            });
            return obj;
          }

          async deserializeComponent(jsonComponent) {
              var TComponent = this.component_types.get(jsonComponent.type);
              return await new TComponent().deserialize(jsonComponent);
          }
        " />
      </Section>
    <!-- </Layer> -->
  </article>
</template>

<style scoped>
.list-none {
  padding-inline-start: 0;
}

.list-none li:not(:last-child) {
  padding-left: 0;
  padding-bottom: var(--padding-normal);
}
</style>