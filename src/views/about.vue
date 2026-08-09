<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Link from '@/components/link.vue'
import DateText from '@/components/date_text.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
import { EmailHiring } from '@/content/socials'

const current_job_title = "Senior Software Engineer";
const years_in_industry = 12;
</script>

<template>
  <Section heading="Hiring?">
    <p>
      If your team needs an experienced and flexible <b>{{ current_job_title }}</b>, use the template below:
    </p>
    <Button class="email" :to="EmailHiring" :color="ThemeColor.Accent" />
  </Section>

  <Section :heading="current_job_title">
    <p>
      Creative software engineer with {{ years_in_industry }}+ years spanning <b>AAA game development</b> at Sledgehammer Games building UI systems and content authoring tools for two <i>Call of Duty</i> titles, and <b>browser engine development</b> on Microsoft Edge and Chromium contributing towards layout, accessibility, composition, and driving AI-powered feature integrations.
      Driven by curiosity to learn and solve complex problems, and passion for game design and software development.
    </p>
    <p>
      I bring a unique mix of insight, experience, and flexibility to any team having worked on massive software projects in both <i>'corporate'</i> and <i>'creative'</i> worlds.
      I thrive in a remote work environment, earning a promotion to <b>Senior Software Engineer</b> at Microsoft while working remote full-time from around <DateText :date="new Date('2020/03/01')" /> - <DateText :date="new Date('2025/05/13')" />.
    </p>
    <p>
      I primarily work with <b>C++</b>, <b>C#</b>, <b>JavaScript</b>, and experiment with various other languages; pivoting between or adopting new programming languages comes easily.
      I've also been picking up <b>Godot Engine</b> on my own time, extending that same adaptability to game development outside proprietary engines.
    </p>
  </Section>

  <Section heading="Featured Work">
    <p>
      Software I've worked on throughout my career include:
    </p>
    <ul class="software-titles list-none centered">
      <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_Advanced_Warfare">Call of Duty: Advanced Warfare</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_WWII">Call of Duty: WWII</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Microsoft_Edge">Microsoft Edge</Link></li>
      <li><Link to="https://en.wikipedia.org/wiki/Chromium_(web_browser)">Chromium</Link></li>
    </ul>
  </Section>

  <Section heading="About me">
    <p>
      When I'm not working you'll often find me playing video games, tinkering with a side project, researching something I've recently become curious about, or spending time with family.
    </p>
    <p>
      I enjoy learning and experimenting with new technology; frequently researching what's new and shiny with open-source IT infrastructure tools since I maintain a few small virtualization servers as a hobby.
      Among services hosted are ephemeral development virtual machines, network attached storage, a cookbook, and a suite of local AI text, image, and video generation tools to experiment with.
    </p>
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
