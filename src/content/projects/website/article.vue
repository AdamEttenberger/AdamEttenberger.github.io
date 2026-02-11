<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Link from '@/components/link.vue'
import Figure from '@/components/figure.vue'
import Note from '@/components/note.vue'
import ProjectLabel from '@/components/project_label.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
import { useEmailTemplateStore } from '@/stores/email_template'
import { IProjectInfo } from '@/types/project_types'

defineProps<IProjectInfo>();

const emails = useEmailTemplateStore();
</script>

<template>
  <article>
    <ProjectLabel :title="title" :date="date" :lastmod="lastmod" />

    <Section heading="Welcome!">
      <p>
        This website is my personal portfolio containing some of the interesting or interactive projects I've built or worked on.
      </p>
      <p>
        The source for this website is available on my GitHub at:
      </p>
      <p>
        <Link to="https://github.com/AdamEttenberger/AdamEttenberger.github.io">AdamEttenberger/AdamEttenberger.github.io</Link>
      </p>
    </Section>

    <Section heading="Website Design">
      The main goal for this website is to present blog-like content: text, images, videos, and interactive or visually interesting technical demos.
      The experience browsing from a mobile device should be comparable to that on a larger device like a tablet, laptop, or desktop.
      However, larger devices will have much more negative space surrounding the main content, so features may be added to utilize the negative space where appropriate.
    </Section>

    <Section heading="Feedback">
      <p>
        If you'd like to provide feedback that is both <b>specific</b> and <b>actionable</b> such as:
      </p>
      <ul>
        <li>Security or privacy concerns.</li>
        <li>Concerns related to accessibility.</li>
        <li>Peer review feedback, including concerns with accuracy or correctness.</li>
      </ul>
      <p>
        Please review the <RouterLink to="/privacy">privacy statement</RouterLink>, then use the following email template including as much detail as possible, and I will attempt to mitigate or resolve concerns in a timely manner.
      </p>
      <Button class="feedback" :to="emails.feedback" :color="ThemeColor.Accent" />
    </Section>

    <Section heading="Beginnings">
      <p>
        Throughout my time at college I self-hosted a private server for playing <Link to="https://en.wikipedia.org/wiki/Minecraft">Minecraft</Link> Java Edition, <Link to="https://en.wikipedia.org/wiki/Terraria">Terraria</Link>, and <Link to="https://en.wikipedia.org/wiki/Starbound">Starbound</Link> with a few friends.
        As graduation approached I needed a personal portfolio and wanted to share some of my more interesting or interactive class projects, so I hosted this website on Ubuntu Server 12.04 with plain hand crafted HTML, CSS, and JavaScript files served with Apache server.
      </p>
    </Section>

    <Section heading="Learning">
      <p>
        To exercise continued learning over the years I've maintained this website, changing how it was built, styled, where and how it was hosted, and generally just experimented with different tools because I'm naturally very curious.
        I've tried a number of linux distros, web servers, content management systems, and frameworks.
        Two of my favorite tools have probably been <Link to="https://gohugo.io/">Hugo</Link> and most recently <Link to="https://vuejs.org/">Vue</Link>.
      </p>
      <p>
        Some of the IT software and tools I've used along my journey have been (in no particular order, and not exhaustive):
      </p>
      <ul class="software-list list-none">
        <li><Link to="https://github.com/ansible/ansible">Ansible</Link></li>
        <li><Link to="https://httpd.apache.org/">Apache HTTPD</Link></li>
        <li><Link to="https://getbootstrap.com/">Bootstrap</Link></li>
        <li><Link to="https://caddyserver.com/">Caddy</Link></li>
        <li><Link to="https://www.docker.com/">Docker</Link></li>
        <li><Link to="https://www.freeipa.org/">FreeIPA</Link></li>
        <li><Link to="https://gohugo.io/">Hugo</Link></li>
        <li><Link to="https://jekyllrb.com/">Jekyll</Link></li>
        <li><Link to="https://en.wikipedia.org/wiki/Internet_Information_Services">Microsoft IIS</Link></li>
        <li><Link to="https://nodejs.org/">Node JS</Link></li>
        <li><Link to="https://nginx.org/">Nginx</Link></li>
        <li><Link to="https://www.openldap.org/">OpenLDAP</Link></li>
        <li><Link to="https://www.proxmox.com/">Proxmox</Link></li>
        <li><Link to="https://vite.dev/">Vite</Link></li>
        <li><Link to="https://vuejs.org/">Vue</Link></li>
      </ul>

      <p>
        I really enjoy learning new things, and experimenting with new technology!
      </p>
    </Section>

    <Section heading="More Coming Soon!">
      <p>Recently I've been converting my website from Hugo to Vue, and it's been a great experience creating templates in Vue!</p>
      <p>
        This website was originally put together with a few select class projects from my time at college because I wanted to share them mainly with those who would be interviewing me as I left college.
        Since then I've neglected to add new content to the website for a while. Expect more updates as I finish populating the site, polishing styles, and continue adding more projects.
      </p>
      <p>
        You may notice this banner scattered throughout the website:
      </p>
      <Figure caption="Banner indicating a section is either incomplete or will be updated in the future.">
        <Note :color="ThemeColor.Todo">
          Brief description of planned future changes.
        </Note>
      </Figure>
      <p>
        These have two purposes:
      </p>
      <ul>
        <li>A transparent mechanism to inform visitors that the section either isn't complete, or to expect updates in the future.</li>
        <li>Reminders for myself to revisit sections of the website (i.e., <i>TODO</i> notes).</li>
      </ul>
    </Section>
  </article>
</template>

<style scoped>
.software-list {
  columns: 3;
  white-space: nowrap;
}

@media only screen and (max-width: 45rem) {
  .software-list {
    columns: 2;
  }
}
</style>