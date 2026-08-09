<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Link from '@/components/link.vue'
import DateText from '@/components/date_text.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
import { EmailHiring } from '@/content/socials'

const current_job_title = "Senior Software Engineer";
</script>

<template>
  <Section heading="About">
    <p>
      I'm a <b>{{ current_job_title }}</b> specializing in <b>UI systems, rendering, tools development, systems design, optimization, and user-facing platform features</b>.
    </p>
    <p>
      My career bridges two demanding domains: AAA game development and large-scale browser engineering.
      That intersection taught me how to engineer high-performance underlying systems while keeping user experiences intuitive and seamless.
    </p>
    <p>
      At <b>Microsoft</b>, I worked on <b>Microsoft Edge</b> and <b>Chromium</b>, contributing to layout, accessibility, composition, and AI-powered user input features.
      My work included integrating handwriting-to-text and text prediction capabilities, contributing to the open-source Chromium project, and working with teams across Edge, Windows, and Microsoft Office.
      I also mentored students through Microsoft's Explore program.
    </p>
    <p>
      Before Microsoft, I worked at <b>Sledgehammer Games</b> on Call of Duty, where I developed UI systems and internal content-authoring tools for <b>Call of Duty: Advanced Warfare</b> and <b>Call of Duty: WWII</b>.
      I built a <Link to="https://en.wikipedia.org/wiki/WYSIWYG">WYSIWYG</Link> UI editor that allowed designers to create sophisticated game interfaces without depending on dedicated UI engineers, including rendering, interaction, animation, asset serialization, and optimized Lua export.
    </p>
    <p>
      Across both domains, I have gravitated toward problems where <b>systems engineering and user experience meet</b>: building the underlying technology, designing the abstractions around it, and turning it into something that other engineers, designers, or end users can actually use.
    </p>
  </Section>

  <Section heading="What I Work On">
    <p>
      I primarily work with <b>C++</b>, <b>C#</b>, <b>JavaScript</b>, and experiment with various other languages; pivoting between or adopting new programming languages comes easily.
      I've also been picking up <b>Godot Engine</b> on my own time, extending that same adaptability to game development outside proprietary engines.
    </p>

    <ul>
    <li>C++ and systems programming</li>
    <li>UI, layout, rendering, and composition systems</li>
    <li>Developer and content-authoring tools</li>
    <li>Browser and game-engine development</li>
    <li>Accessibility and platform integration</li>
    <li>AI-powered feature integration</li>
    <li>Software architecture, performance, and optimization</li>
    <li>End-to-end feature development</li>
    </ul>

    <p>
      I enjoy taking ambiguous problems from initial design through implementation and into a shipped product.
      I'm particularly interested in technically challenging systems that have a direct impact on how people create or interact with software.
    </p>
  </Section>

  <Section heading="Selected Work">
    <p>
      My professional work includes contributions to Microsoft Edge and open-source Chromium, as well as UI systems and tooling shipped in multiple Call of Duty titles.
    </p>
    <p>
      Outside of professional work, I use this site to explore technologies and ideas that interest me, including game development, graphics, rendering, and procedural systems.
    </p>
    <ul class="software-titles list-none centered">
      <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_Advanced_Warfare">Call of Duty: Advanced Warfare</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_WWII">Call of Duty: WWII</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Microsoft_Edge">Microsoft Edge</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Chromium_(web_browser)">Chromium</Link></li>
    </ul>
  </Section>
  
  <Section heading="Hiring?">
    <p>
      If your team needs an experienced and flexible <b>{{ current_job_title }}</b>, use the template below:
    </p>
    <Button class="email" :to="EmailHiring" :color="ThemeColor.Accent" />
  </Section>
</template>

<style scoped>
.email {
  align-self: center;
  font-size: large;
  text-align: center;
  font-weight: bolder;
  max-width: max-content;
}

.software-titles {
  font-size: large;
}
</style>
