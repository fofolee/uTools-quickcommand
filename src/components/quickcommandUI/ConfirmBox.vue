<template>
  <q-card class="q-dialog-plugin">
    <q-card-section>
      <div class="text-h5" align="left" v-text="options.title"></div>
    </q-card-section>
    <q-card-section>
      {{ options.message }}
    </q-card-section>
    <q-card-section class="flex justify-end q-gutter-sm">
      <q-btn flat label="取消" color="grey" @click="hide" />
      <q-btn flat autofocus label="确定" color="primary" @click="clickOK()" />
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  methods: {
    hide() {
      this.$emit("hide");
    },
    clickOK() {
      this.$emit("clickOK", true);
      this.hide();
    },
  },
  props: {
    options: Object,
  },
};
</script>
