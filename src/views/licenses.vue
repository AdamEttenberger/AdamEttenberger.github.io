<script setup lang="ts">
import Column from '@/components/column.vue'
import Section from '@/components/section.vue'
import LicenseItem from '@/components/licenses/license_item.vue'
import { ILicenseInfo } from '@/types/license_types';
defineProps({
  licenses: { type: Array<ILicenseInfo>, required: true },
})
</script>

<template>
  <Column>
    <Section heading="Licenses">
      <p>
        This website was build with the help of some third-party.
        Their license information may be found here.
      </p>
    </Section>
  </Column>

  <Column v-for="item in licenses">
    <LicenseItem v-bind="item" />
  </Column>
</template>
