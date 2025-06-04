<script setup>
import Player from '../../components/player.vue'
import ProjectLabel from '../../components/project_label.vue'
import UnderConstruction from '/src/components/under_construction.vue'
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
          :frame="frame" />
  <ProjectLabel :title="title"
                :date="date"
                :lastmod="lastmod" />
  <UnderConstruction />
</template>
