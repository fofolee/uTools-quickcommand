<template>
  <q-card class="q-dialog-plugin quickcommand-ui">
    <q-card-section v-if="options.title">
      <div class="text-h8" align="center" v-text="options.title"></div>
    </q-card-section>
    <q-card-section class="q-gutter-md">
      <div v-for="(label, index) in options.labels" :key="index">
        <q-btn
          class="full-width"
          color="primary"
          :label="label"
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
    hide() {
      this.$emit("hide");
    },
    clickOK(label, index) {
      this.$emit("clickOK", { id: index, text: label });
      this.hide();
    },
  },
};
</script>
