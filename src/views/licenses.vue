<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Section from '@/components/section.vue'
import LicenseItem from '@/components/licenses/license_item.vue'
import { ILicenseInfo } from '@/types/license_types';
defineProps({
  licenses: { type: Array<ILicenseInfo>, required: true },
})
</script>

<template>
  <article>
    <Section heading="Licenses">
      <p>
        This website was build with the help of some third-party.
        Their license information may be found here.
      </p>
    </Section>

    <Button v-for="item in licenses" :key="item.subpath"
            class="button-item"
            :to="`/licenses/${item.subpath}/`">
      <LicenseItem class="license-item" v-bind="item" />
    </Button>
  </article>
</template>

<style scoped>
.button-item {
  padding: 0 var(--padding-large);
  & .license-item {
    flex: 1;
    align-items: flex-start;
    text-align: left;
  }
}
</style>