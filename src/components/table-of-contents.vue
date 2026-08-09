<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Section from '@/components/section.vue'

withDefaults(defineProps<{
  heading?: string;
}>(), {
  heading: "In This Article"
});

interface ITableOfContentsSectionItem {
  heading: string;
  anchor_id: string;
};

const route = useRoute()
const router = useRouter()

function onTableOfContentsNavigation(anchor_id) {
  router.push({
    path: route.path,
    query: route.query,
    hash: `#${anchor_id}`,
  })
}

const sections = ref<ITableOfContentsSectionItem>(null);

onMounted(() => {
  sections.value = Array.from(document.querySelectorAll(".table-of-contents ~ section")).map(item => ({
    heading: item.querySelector("h1").innerText,
    anchor_id: item.id
  }));
});
</script>

<template>
  <Section class="table-of-contents" :heading>
    <ol>
      <li v-for="item in sections">
        <a href="javascript:void(0);" @click="onTableOfContentsNavigation(item.anchor_id)">{{ item.heading }}</a>
      </li>
    </ol>
  </Section>
</template>

<style scoped>
ol {
  list-style: none;
}
</style>
