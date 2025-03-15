<template>
  <q-card
    class="quickcommand-ui q-dialog-plugin"
    :style="{
      width: options.width ? options.width + 'px' : '450px',
    }"
  >
    <q-card-section class="row items-center q-gutter-sm">
      <q-img src="logo.png" width="1.5rem" />
      <div class="text-h8" align="left" v-text="options.title"></div>
    </q-card-section>
    <q-card-section
      v-if="options.isHtml"
      v-html="purify(options.message)"
      class="content"
    />
    <q-card-section v-else v-text="options.message" class="content" />
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
    purify(html) {
      return window.DOMPurify.sanitize(html);
    },
  },
  props: {
    options: Object,
  },
};
</script>

<style scoped>
.content {
  overflow: auto;
  max-height: 350px;
}

.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.q-card--dark {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
</style>
