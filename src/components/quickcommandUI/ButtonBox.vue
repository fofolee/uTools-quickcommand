<template>
  <q-card class="q-dialog-plugin">
    <q-card-section>
      <div class="text-h5" align="center" v-text="options.title"></div>
    </q-card-section>
    <q-card-section class="q-gutter-lg">
      <div v-for="(label, index) in options.labels" :key="index">
        <q-btn
          class="full-width"
          color="primary"
          :label="label"
          v-close-popup
          @click="clickOK(label, index)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      results: this.values,
    };
  },
  props: {
    options: Object,
  },
  methods: {
    clickOK(label, index) {
      this.$emit("clickOK", { id: index, text: label });
    },
  },
};
</script>
