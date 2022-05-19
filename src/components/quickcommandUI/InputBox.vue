<template>
  <q-card class="q-dialog-plugin">
    <q-card-section>
      <div class="text-h5" align="center" v-text="options.title"></div>
    </q-card-section>
    <q-card-section class="q-gutter-sm">
      <div v-for="(label, index) in options.labels" :key="index">
        <q-input
          outlined
          v-model="results[index]"
          :label="label"
          :hint="options.hints[index]"
          hide-hint
          :autofocus="index === 0"
          @keyup.enter="clickOK"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn color="negative" label="取消" @click="hide" />
      <q-btn color="blue-9" label="确定" @click="clickOK" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      results: this.options.values,
    };
  },
  props: {
    options: Object,
  },
  methods: {
    hide() {
      this.$emit("hide");
    },
    clickOK() {
      this.$emit("clickOK", this.results);
      this.hide();
    },
  },
};
</script>
