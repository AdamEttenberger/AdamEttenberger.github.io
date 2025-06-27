<script setup>
import ExternalLink from '@/components/external_link.vue'
import ProjectCard from '@/components/project_card.vue'
</script>

<template>
  <ProjectCard title="Match-3 Game"
               image="/images/projects/tile_match.png"
               route="/projects/match_three"
               :date="new Date('2025/05/27')"
               :lastmod="new Date('2025/06/04')">
    <p>
      A simple 3D Match-3 game made with the <ExternalLink to="https://godotengine.org/">Godot</ExternalLink> game engine and <ExternalLink to="https://www.blender.org/">Blender</ExternalLink>.
    </p>
  </ProjectCard>

  <ProjectCard title="This Website"
               image="/images/projects/website.png"
               route="/projects/website">
    <p>
      This portfolio website is something I initially created while at RIT to showcase some of my class projects or personal projects.
      Originally static HTML, CSS, JavaScript, and ShockWave Flash files, this has been migrated over the years to newer technologies, multiple frameworks / CMS / templating engines.
      Most recently switched to <ExternalLink to="https://vuejs.org/">Vue3</ExternalLink> + <ExternalLink to="https://vite.dev/">Vite</ExternalLink> hosted with <ExternalLink to="https://pages.github.com/">GitHub Pages</ExternalLink>.
    </p>
  </ProjectCard>

  <ProjectCard title="RENU - Imagine Cup 2013 @ RIT"
               image="/images/projects/renu.png"
               route="/projects/renu"
               :date="new Date('2012/12/01')"
               :lastmod="new Date('2012/12/01')">
    <p>
      Renu is a 2D platformer that was built in less than 23 hours by a team of four during "Imagine Cup 2013 @ RIT" winning second place.
      Renu was built using CreateJS, PreloadJS, and SoundJS targeting Windows 8 and HTML5 Canvas.
    </p>
  </ProjectCard>

  <ProjectCard title="WebGL Metaballs"
               image="/images/projects/metaballs.png"
               route="/projects/webgl_metaballs"
               :date="new Date('2012/10/08')"
               :lastmod="new Date('2025/06/18')">
    <p>
      Demonstrates something like <ExternalLink to="https://en.wikipedia.org/wiki/Deferred_shading">Deferred shading</ExternalLink> to achieve 2D <ExternalLink to="https://en.wikipedia.org/wiki/Metaballs">Metaballs</ExternalLink>.
      WebGL Metaballs used <ExternalLink to="https://github.com/toji/gl-matrix">gl-matrix</ExternalLink> to speed production.
    </p>
  </ProjectCard>

  <ProjectCard title="WebGL Flocking"
               image="/images/projects/flocking.png"
               route="/projects/webgl_flocking"
               :date="new Date('2012/10/05')"
               :lastmod="new Date('2012/10/05')">
    <p>
      Using the GameObject/Component model in the WebGL example below, I have put together a 3D flocking simulation using Craig Reynolds' <ExternalLink to="https://www.red3d.com/cwr/boids/">Boids Algorithm</ExternalLink>.
      WebGL Flocking used <ExternalLink to="https://github.com/toji/gl-matrix">gl-matrix</ExternalLink> to speed production.
    </p>
  </ProjectCard>

  <ProjectCard title="WebGL Proto-Engine"
               image="/images/projects/proto_engine.png"
               route="/projects/webgl_proto_engine"
               :date="new Date('2012/09/01')"
               :lastmod="new Date('2025/06/26')">
    <p>
      A Simple 3D WebGL demonstration using a GameObject/Component model. In this project I used a JavaScript math library <ExternalLink to="https://github.com/toji/gl-matrix">gl-matrix</ExternalLink> to speed production.
    </p>
  </ProjectCard>
</template>
