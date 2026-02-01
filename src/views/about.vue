<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import DateText from '@/components/date_text.vue';
import Section from '@/components/section.vue'
import { useEmailTemplateStore } from '@/stores/email_template'
const emails = useEmailTemplateStore();
const current_job_title = "Senior Software Engineer";
</script>

<template>
  <Column>
    <Section heading="Hiring?">
      <p>
        If your team needs an experienced and flexible <b>{{ current_job_title }}</b>, use the template below:
      </p>
      <br />
      <Button class="email" :mailto="emails.hiring" />
    </Section>

    <Section :heading="current_job_title">
      <p>
        Creative software engineer with experience in game development, layout engines, large platform development, and optimization.
        Driven by curiosity to learn and solve complex problems, and passion for game design and software development.
      </p>
      <br />
      <p>
        I bring a unique mix of insight, experience, and flexibility to any team having worked on massive software projects in both <i>'corporate'</i> and <i>'creative'</i> worlds.
        I thrive in a remote work environment, earning a promotion to <b>Senior Software Engineer</b> at Microsoft while working remote full-time from around <DateText :date="new Date('2020/03/01')" /> - <DateText :date="new Date('2025/05/13')" />.
      </p>
      <br />
      <p>
        With 12+ years professional experience working with C++, C#, JavaScript, and experimenting with various other languages; pivoting between or adopting new programming languages comes easily.
      </p>
      <br />
      <br />
    </Section>

    <Section heading="Projects">
      <p>
        Projects I've worked on during my career include:
      </p>
      <br />
      <ul class="software-titles list-none centered">
        <li><ExternalLink to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_Advanced_Warfare">Call of Duty: Advanced Warfare</ExternalLink></li>
        <li><ExternalLink to="https://en.wikipedia.org/wiki/Call_of_Duty%3A_WWII">Call of Duty: WWII</ExternalLink></li>
        <li><ExternalLink to="https://en.wikipedia.org/wiki/Microsoft_Edge">Microsoft Edge</ExternalLink></li>
        <li><ExternalLink to="https://en.wikipedia.org/wiki/Chromium_(web_browser)">Chromium</ExternalLink></li>
      </ul>
    </Section>

    <Section heading="About me">
      <p>
        When I'm not working you'll often find me playing video games, tinkering with a side project, researching something I've recently become curious about, or spending time with family.
      </p>
      <br />
      <p>
        I enjoy learning and experimenting with new technology; frequently researching what's new and shiny with open-source IT infrastructure tools since I maintain a few small virtualization servers as a hobby.
        Among services hosted are ephemeral development virtual machines, network attached storage, a cookbook, and a suite of local AI text, image, and video generation tools to experiment with.
      </p>
    </Section>
  </Column>
</template>

<style scoped>
.email {
  font-size: large;
  text-align: center;
  font-weight: bolder;
  max-width: max-content;
}

.software-titles {
  font-size: large;
}
</style>
