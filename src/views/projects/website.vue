<script setup lang="ts">
import Button from '@/components/button.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import ProjectLabel from '@/components/project_label.vue'
import Section from '@/components/section.vue'
import { useEmailTemplateStore } from '@/stores/email_template'

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { default: null },
})

const emails = useEmailTemplateStore();
</script>

<template>
  <ProjectLabel :title="title" :date="date" :lastmod="lastmod" />
  <Column class="content">
    <Section heading="Welcome!">
      <p>
        This website is my personal portfolio containing some of the interesting or interactive projects I've built or worked on.
        The source for this website is available on my GitHub at:
        <br />
        <ExternalLink to="https://github.com/AdamEttenberger/AdamEttenberger.github.io">AdamEttenberger/AdamEttenberger.github.io</ExternalLink>.
      </p>
    </Section>

    <Section heading="Beginnings">
      <p>
        Throughout my time at college I self-hosted a private server from my room to play <ExternalLink to="https://en.wikipedia.org/wiki/Minecraft">Minecraft</ExternalLink> Java Edition, <ExternalLink to="https://en.wikipedia.org/wiki/Terraria">Terraria</ExternalLink>, and <ExternalLink to="https://en.wikipedia.org/wiki/Starbound">Starbound</ExternalLink> with a few friends.
        As graduation approached I needed a personal portfolio and wanted to share some of my more interesting or interactive class projects, so I hosted this website on Ubuntu Server 12.04 with plain hand crafted HTML, CSS, and JavaScript files served with Apache server.
      </p>
    </Section>

    <Section heading="Learning">
      <p>
        To exercise continued learning over the years I've maintained this website, changing how it was built, styled, where and how it was hosted, and generally just experimented with different tools because I'm naturally very curious. I've tried a number of linux distros, web servers, content management systems, and frameworks. Two of my favorite tools have probably been <ExternalLink to="https://gohugo.io/">Hugo</ExternalLink> and most recently <ExternalLink to="https://vuejs.org/">Vue</ExternalLink>.
      </p>
      <br />
      <p>
        Some of the IT software and tools I've used along my journey have been (in no particular order, and not exhaustive):
      </p>
      <br />
      <ul class="software-list list-none">
        <li><ExternalLink to="https://github.com/ansible/ansible">Ansible</ExternalLink></li>
        <li><ExternalLink to="https://httpd.apache.org/">Apache HTTPD</ExternalLink></li>
        <li><ExternalLink to="https://getbootstrap.com/">Bootstrap</ExternalLink></li>
        <li><ExternalLink to="https://caddyserver.com/">Caddy</ExternalLink></li>
        <li><ExternalLink to="https://www.docker.com/">Docker</ExternalLink></li>
        <li><ExternalLink to="https://www.freeipa.org/">FreeIPA</ExternalLink></li>
        <li><ExternalLink to="https://gohugo.io/">Hugo</ExternalLink></li>
        <li><ExternalLink to="https://jekyllrb.com/">Jekyll</ExternalLink></li>
        <li><ExternalLink to="https://en.wikipedia.org/wiki/Internet_Information_Services">Microsoft IIS</ExternalLink></li>
        <li><ExternalLink to="https://nodejs.org/">Node JS</ExternalLink></li>
        <li><ExternalLink to="https://nginx.org/">Nginx</ExternalLink></li>
        <li><ExternalLink to="https://www.openldap.org/">OpenLDAP</ExternalLink></li>
        <li><ExternalLink to="https://www.proxmox.com/">Proxmox</ExternalLink></li>
        <li><ExternalLink to="https://vite.dev/">Vite</ExternalLink></li>
        <li><ExternalLink to="https://vuejs.org/">Vue</ExternalLink></li>
      </ul>

      <br />
      <p>
        I really enjoy learning new things, and experimenting with new technology!
      </p>
    </Section>

    <Section heading="Feedback">
      <p>
        If you have critical feedback that is both specific and actionable such as a security or privacy concern, please use the following email template including as much detail as possible and I will attempt to mitigate or resolve concerns in a timely manner.
        Please review the <RouterLink to="/privacy">privacy statement</RouterLink> which includes sections on providing feedback and email policy.
      </p>
      <br />
      <Button class="feedback" :mailto="emails.feedback" />
    </Section>

    <Section heading="More Coming Soon!">
      <p>Recently I've been converting my website from Hugo to Vue, and it's been a joy working with templates in Vue!</p>
      <br />
      <p>
        This website was originally put together with a few select class projects from my time at college because I wanted to share them mainly with those who would be interviewing me as I left college.
        Since then I've neglected to add new content to the website for a while. Expect more updates as I finish populating the site, polishing styles, and continue adding more projects.
      </p>
    </Section>
  </Column>
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