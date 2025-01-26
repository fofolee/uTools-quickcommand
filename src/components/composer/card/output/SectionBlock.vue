<template>
  <div>
    <div class="row items-center">
      <q-badge color="primary" class="q-ma-sm q-pa-xs">{{ title }}</q-badge>
      <div v-if="subtitle" class="text-caption text-grey-5">
        {{ subtitle }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SectionBlock",
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
  },
});
</script>
