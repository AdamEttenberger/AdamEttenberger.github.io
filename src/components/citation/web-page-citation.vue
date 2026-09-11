<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue'
import { date_formatMLA, date_formatYear, type DateLike } from '@/util/date'

type WebCitationBaseProps = {
  url: string,
  firstname: string,
  lastname: string,
  websiteTitle: string,
  publisher?: string,
};

type CitationDateProp = 
  | { datePublished?: DateLike, yearPublished?: never, }
  | { datePublished?: never,    yearPublished?: DateLike, };

type CitationDocumentTitleProp =
  | { webpageTitle: string, documentTitle?: never, }
  | { webpageTitle?: never, documentTitle: string, };

type WebCitationProps = WebCitationBaseProps & CitationDocumentTitleProp & CitationDateProp;
const props = defineProps<WebCitationProps>();

const display_url = computed<undefined|string>(() => {
  const url = URL.parse(props.url);
  return url ? url.href.substring(url.protocol.length + 2) : undefined;
});
const display_date = computed<string|undefined>(() => {
  if (props.datePublished) {
    return date_formatMLA(props.datePublished);
  }
  if (props.yearPublished) {
    return date_formatYear(props.yearPublished);
  }
});
</script>

<template>
  <cite>
    <Link class="cite-link" :to="url" :alt="`link to webpage: ${webpageTitle ?? documentTitle}`" transparent>
      <span class="author-last-name">{{ lastname }}</span>,
      <span class="author-first-name">{{ firstname }}</span>.
      "<span class="document">{{ webpageTitle ?? documentTitle  }}</span>."
      <i class="website-title">{{  websiteTitle }}</i>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span v-if="display_date"><span class="date-published">{{ display_date }}</span>,</span>
      <span class="link">{{ display_url }}</span>.
    </Link>
  </cite>
</template>

<style scoped>
cite {
  display: flex;
  flex-direction: column;
  text-align: center;
}
</style>
