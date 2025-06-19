<template>
  <div class="column">
    <slot></slot>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  text-align: justify;
  padding: var(--size-column-padding);
  background-color: var(--color-background-soft);
  border-radius: var(--size-border-radius);
  margin: var(--size-padding-round) 0;

  & > :slotted(:is(img, svg, .framed, .column-inset)) {
    margin: var(--size-padding-round) var(--size-column-gutter);
    @media only screen and (max-width: 45rem) {
      margin: var(--size-padding-round) 0;
    }
  }

  & > :slotted(:is(img, svg, .framed)) {
    border: var(--size-border-frame) solid var(--color-divider);
  }
}

</style>
