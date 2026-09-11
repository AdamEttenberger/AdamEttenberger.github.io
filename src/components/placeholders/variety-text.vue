<script setup lang="ts">
import Link from '@/components/link.vue'
defineProps({
  lorem: { type: Boolean },
  paragraph: { type: Boolean },
})
</script>

<template>
  <p v-if="lorem || paragraph">
    <span v-if="paragraph">
      <span>Lorem ipsum <Link to="#" @click.prevent="">dolor sit</Link> amet consectetur, <b>adipisicing elit</b>. Fugit, quia.</span>
      <span>Autem <u>quisquam consectetur dolores</u> placeat <b>voluptatum</b>. <i>Autem ad voluptate</i> blanditiis?</span>
      <span>Voluptatum <b>animi accusamus</b> earum, dolore quia delectus dolorum corporis voluptates.</span>
      <span>Perferendis neque quidem facilis totam veritatis omnis sed. Nihil, mollitia?</span>
    </span>
    <span v-else>Lorem ipsum <Link to="#" @click.prevent="">dolor sit</Link> amet consectetur, <b>adipisicing elit</b>. Quo, eligendi <i>cumque atque</i> totam <u>nulla necessitatibus</u>.</span>
  </p>
  <span v-else>Some Text, <i>italic text</i>, <b>bold text</b>, <RouterLink to="/" @click.prevent="">router link</RouterLink>, <Link to="#" @click.prevent="">external link</Link>.</span>
</template>