<script setup lang="ts">
import Layer from '@/components/layer.vue'
import Link from '@/components/link.vue'
import SocialButton from '@/components/buttons/social-button.vue'
import { SocialButtonList } from '@/content/socials'
import { type IAuthor } from '@/content/author'
defineProps<{
  author: IAuthor;
}>();
</script>

<template>
  <footer class="rows">
    <Layer class="responsive-row" :depth="0" absolute>
      <div class="socials columns gap-s">
        <SocialButton v-for="item of SocialButtonList" :key="item.type" v-bind="item" />
      </div>
      <div class="links">
        <span><Link to="/privacy">Privacy</Link></span>
        <span><Link to="/licenses">Licenses</Link></span>
      </div>
      <div class="copyright">&copy;&nbsp;{{ new Date().getFullYear() }} {{ author.name }}</div>
    </Layer>
  </footer>
</template>

<style scoped>
footer {
  container: footer / inline-size;

  & :any-link {
    text-decoration: none;
  }
  & :any-link:hover {
    text-decoration: underline;
  }
}

.responsive-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  border-radius: 0;
  border-top: var(--size-header-footer-border) solid var(--theme-accent-500);

  & > .socials {
    justify-self: left;
  }

  & > .links {
    justify-self: center;
    & > :not(:first-child)::before {
      display: inline-block;
      content: '\00B7 ';
      padding: 0 var(--padding-normal);
    }
  }

  & > .copyright {
    justify-self: right;
  }

  @container (max-width: 40rem) {
    flex-direction: column;
    justify-content: center;
    gap: var(--padding-normal);

    & > :is(.copyright, .links, .socials) {
      justify-self: center;
    }

    @media only screen and (min-resolution: 192dpi) {
      font-size: 1.5rem;
    }
  }
}
</style>
