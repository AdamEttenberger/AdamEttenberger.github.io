<script setup>
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import Section from '@/components/section.vue'
const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false" />
  <Column>
    <Section heading="What's this?">
      <p>
        This project is a simple proof-of-concept component based game engine, heavily inspired by Unity's component based <ExternalLink to="https://docs.unity3d.com/ScriptReference/GameObject.html">GameObject</ExternalLink> + <ExternalLink to="https://docs.unity3d.com/ScriptReference/MonoBehaviour.html">MonoBehavior</ExternalLink> model.
        This is the foundation for the WebGL Flocking and Metaballs projects which are projects I worked on while at college.
        The flocking demo was originally a ShockWave Flash application, and the Metaballs project was originally a Windows based C++ OpenGL application.
      </p>
      <br />
      <p>
        <ExternalLink to="https://en.wikipedia.org/wiki/Adobe_Flash">Adobe Flash</ExternalLink> was a powerful animation and media tool, and popular choice for browser games.
        However <ExternalLink to="https://en.wikipedia.org/wiki/WebGL">WebGL</ExternalLink>, a new experimental technology became available around the same time Flash's end-of-life discussions began.
        This project was driven by both a desire to learn a new technology and to get ahead of the deprecation of Flash.
        At this point in time I had some experience working with the native C++ OpenGL API on Windows, but browser support for WebGL was still in its infancy.
      </p>
    </Section>

    <Section heading="Overview">
      <p>
        This program was designed to be a simple and minimal prototyping environment, and a quick way to migrate my Flocking demo away from a dying web technology. It consists of a few key objects:
      </p>
      <br />
      <ul class="list-none">
        <li>
          <Details summary="Game">
            <p>The core of the application which handles the main loop and owns the scene tree composed of GameObject instances, and schedules component updates.</p>
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
      <br />

      <p>
        This demo utilizes the following set of components:
      </p>
      <br />
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
          <Details summary="SkinnedModelComponent">
            <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position and texture data.</p>
          </Details>
        </li>
        <li>
          <Details summary="ColoredSkinnedModelComponent">
            <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position, color, and texture data.</p>
          </Details>
        </li>
      </ul>
      <br />
      <Figure src="/images/projects/webgl_example/architecture.png"
              alt="UML-like class relationship diagram." />
    </Section>
  </Column>
</template>
