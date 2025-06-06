<script setup>
import Column from '../../components/column.vue'
import ExternalLink from '../../components/external_link.vue'
import ProjectLabel from '../../components/project_label.vue'
import Divider from '../../components/divider.vue'
import UnderConstruction from '/src/components/under_construction.vue'
const props = defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <ProjectLabel :title="title" />
  <UnderConstruction />
  <Column class="content">
    <Divider>Welcome!</Divider>
    <p>
      This website is my personal portfolio containing some of the interesting or interactive projects I've built or worked on.
    </p>
    <p>
      The source for this website is available on my GitHub at <ExternalLink to="https://github.com/AdamEttenberger/AdamEttenberger.github.io">AdamEttenberger/AdamEttenberger.github.io</ExternalLink>.
    </p>

    <Divider>Beginnings</Divider>
    <p>
      Throughout my time at college I self-hosted a private server from my room to play <ExternalLink to="https://en.wikipedia.org/wiki/Minecraft">Minecraft</ExternalLink> Java Edition, <ExternalLink to="https://en.wikipedia.org/wiki/Terraria">Terraria</ExternalLink>, and <ExternalLink to="https://en.wikipedia.org/wiki/Starbound">Starbound</ExternalLink> with a few friends.
      As graduation approached I needed a personal portfolio and wanted to share some of my more interesting or interactive class projects, so I hosted this website on Ubuntu Server 12.04 with plain hand crafted HTML, CSS, and JavaScript files served with Apache server.
    </p>

    <Divider>Learning</Divider>
    <p>
      To exercise continued learning over the years I've maintained this website, changing how it was built, styled, where and how it was hosted, and generally just experimented with different tools because I'm naturally very curious. I've tried a number of linux distros, web servers, content management systems, and frameworks. Two of my favorite tools have probably been <ExternalLink to="https://gohugo.io/">Hugo</ExternalLink> and most recently <ExternalLink to="https://vuejs.org/">Vue</ExternalLink>.
    </p>
    <br />
    <p>
      Some of the IT software and tools I've used along my journey have been (in no particular order, and not exhaustive):
    </p>
    <ul class="software-list">
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

    <Divider>More Coming Soon!</Divider>
    <p>Recently I've been converting my website from Hugo to Vue, and it's been a joy working with templates in Vue!</p>
    <br />
    <p>
      This website was originally put together with a few select class projects from my time at college because I wanted to share them mainly with those who would be interviewing me as I left college.
      Since then I've neglected to add new content to the website for a while. Expect more updates as I finish populating the site, polishing styles, and continue adding more projects.
    </p>
  </Column>
</template>

<style scoped>
.software-list {
  columns: 3;
  white-space: nowrap;
  & > li {
    list-style: none;
  }
}
</style>