<script setup>
import ProjectCard from '/src/components/project_card.vue'
</script>

<template>
  <ProjectCard title="Match-3 Game"
               image="/images/projects/tile_match.png"
               route="/projects/match_three"
               :date="new Date('2025/05/27')"
               :lastmod="new Date('2025/06/04')">
    <p>A simple 3D Match-3 game made with the <a href="https://godotengine.org/">Godot</a> game engine and <a href="https://www.blender.org/">Blender</a>.</p>
  </ProjectCard>

  <ProjectCard title="RENU - Imagine Cup 2013"
               image="/images/projects/renu.png"
               route="/projects/renu"
               :date="new Date('2012/12/01')"
               :lastmod="new Date('2012/12/01')">
    <p>Renu is a 2D platformer that was built in less than 23 hours by a team of four during "Imagine Cup 2013 @ RIT" winning second place. Renu was built using CreateJS, PreloadJS, and SoundJS targeting Windows 8 and HTML5 Canvas.</p>
  </ProjectCard>

  <ProjectCard title="WebGL Metaballs"
               image="/images/projects/metaballs.png"
               route="/projects/webgl_metaballs"
               :date="new Date('2012/10/08')"
               :lastmod="new Date('2012/10/08')">
    <p>Demonstrates deferred rendering to achieve 2D <a href="https://en.wikipedia.org/wiki/Metaballs">Metaballs</a>. Deferred rendering is a technique where you render a scene multiple times using different shader to achieve a desired effect. In this demonstration, I am rendering points in the first pass and computing their gradient on the GPU, and the second pass is using an alpha threshold to give the desired look. WebGL Metaballs used <a href="https://github.com/toji/gl-matrix">gl-matrix</a> to speed production.</p>
  </ProjectCard>

  <ProjectCard title="WebGL Flocking"
               image="/images/projects/flocking.png"
               route="/projects/webgl_flocking"
               :date="new Date('2012/10/05')"
               :lastmod="new Date('2012/10/05')">
    <p>Using the GameObject/Component model in the WebGL example below, I have put together a 3D flocking simulation using Craig Reynolds' <a href="https://www.red3d.com/cwr/boids/">Boids Algorithm</a>. WebGL Flocking used <a href="https://github.com/toji/gl-matrix">gl-matrix</a> to speed production.</p>
  </ProjectCard>

  <ProjectCard title="WebGL Example"
               image="/images/projects/webgl-example.png"
               route="/projects/webgl_example"
               :date="new Date('2012/09/01')"
               :lastmod="new Date('2012/09/01')">
    <p>A Simple 3D WebGL demonstration using a GameObject/Component model. In this project I used a Javascript math library <a href="https://github.com/toji/gl-matrix">gl-matrix</a> to speed production.</p>
  </ProjectCard>
</template>
