<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/button.vue'
import HeroSection from '@/components/hero/hero-section.vue'
import Link from '@/components/link.vue'
import Section from '@/components/section.vue'
import { EmailHiring } from '@/content/socials'
import { type IProjectInfo } from '@/types/project_types'
import { ThemeColor } from '@/composables/theme'
import ProjectItem from '@/components/cards/project-item.vue'
import YouTubeItem from '@/components/cards/youtube-item.vue'
import Author from '@/content/author'

const route = useRoute();
const router = useRouter();
const firstSection = useTemplateRef<Element>('first-section');

defineProps<{
  projects: Array<IProjectInfo>;
}>();

function onScrollToContent() {
  if (!firstSection.value) {
    return;
  }
  router.push({
    path: route.path,
    query: route.query,
    hash: `#${firstSection.value.id}`,
  })
}
</script>

<template>
  <article>
    <HeroSection :author="Author" @scroll-to-content="onScrollToContent" />

    <Section heading="About" ref="first-section">
      <p>
        I'm a <b>{{ Author.job_title }}</b> specializing in <b>UI systems, rendering, tools development, systems design, optimization, and user-facing platform features</b>.
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
      <ul class="software-titles list-none centered">
        <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_Advanced_Warfare">Call of Duty: Advanced Warfare</Link></li>
        <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_WWII">Call of Duty: WWII</Link></li>
        <li><Link to="https://en.wikipedia.org/wiki/Microsoft_Edge">Microsoft Edge</Link></li>
        <li><Link to="https://en.wikipedia.org/wiki/Chromium_(web_browser)">Chromium</Link></li>
      </ul>
      <YouTubeItem :title="['Call of Duty', 'WWII']"
                    :role="['Tools Engineer', 'UI Engineer']"
                    youtube-id="D4Q_XYVescc" />
      <YouTubeItem :title="['Call of Duty', 'Advanced Warfare']"
                    :role="['Tools Engineer', 'UI Engineer']"
                    youtube-id="sFu5qXMuaJU" />
      <p>
        Outside of professional work, I use this site to explore technologies and ideas that interest me, including game development, graphics, rendering, and procedural systems.
      </p>
    </Section>

    <Section heading="Personal Projects">
      <div class="projects-list">
        <ProjectItem v-for="item in projects"
                    :key="item.subpath"
                    :title="item.title"
                    :image="item.icon"
                    :to="`/projects/${item.subpath}/`"
                    :date="item.date"
                    :color="item.color" />
      </div>
    </Section>

    <Section heading="Hiring?">
      <p>
        If your team needs an experienced and flexible <b>{{ Author.job_title }}</b>, use the template below:
      </p>
      <Button class="email" :to="EmailHiring" :color="ThemeColor.Accent" />
    </Section>
  </article>
</template>

<style scoped>
.projects-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: var(--padding-xxlarge);

  /**
   * Some magic to rescale the project cards.
   * @container won't accept variables, so manually addressing 3 zoom steps:
   * 1. The default colulmn width: 55rem, see var(--app-column-max-width)
   * 2. 40rem is about when 3-column cards become too small, reset zoom and resume with 2-column layout.
   * 3. 20rem is about when 2-column cards become too small, reset zoom and resume with 1-column layout.
   */
  @container article (max-width: 55rem) {
    zoom: clamp(0.5, calc(100cqi / 55rem), 1.0);
  }
  @container article (max-width: 40rem) {
    zoom: clamp(0.5, calc(100cqi / 40rem), 1.0);
  }
  @container article (max-width: 20rem) {
    zoom: clamp(0.5, calc(100cqi / 20rem), 1.0);
  }
}

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