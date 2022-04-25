<template>
  <q-card class="q-dialog-plugin">
    <q-card-section>
      <div class="text-h5" align="left" v-text="options.title"></div>
    </q-card-section>
    <q-card-section>
      {{ options.message }}
    </q-card-section>
    <q-card-section class="flex justify-end q-gutter-sm">
      <q-btn flat label="取消" color="grey" v-close-popup />
      <q-btn
        flat
        autofocus
        label="确定"
        color="primary"
        v-close-popup
        @click="clickOK()"
      />
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  methods: {
    clickOK() {
      this.$emit("clickOK", true);
    },
  },
  props: {
    options: Object,
  },
};
</script>
