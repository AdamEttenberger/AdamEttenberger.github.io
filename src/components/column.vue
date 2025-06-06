<template>
  <div class="column">
    <slot></slot>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  justify-self: center;
  text-align: justify;
  padding: 0 var(--size-padding-round);
  background-color: var(--color-background-soft);
  border-radius: var(--size-border-radius);
  margin: var(--size-padding-round) 0;

  & > :slotted(.column-framed),
  & > :slotted(:is(img, svg)),
  & > :slotted(p) > :is(img, svg) {
    display: block;
    place-self: center;
    justify-self: center;
    align-self: center;
    border: 6px solid var(--color-divider);
    margin: var(--size-padding-round) 0;
    width: 90%;
    @media only screen and (max-width: 740px) {
      width: 100%;
    }
  }

}

</style>
