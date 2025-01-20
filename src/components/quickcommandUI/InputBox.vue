<template>
  <q-card class="quickcommand-ui q-dialog-plugin" style="width: 60vw">
    <q-card-section v-if="options.title">
      <div class="text-h5" align="center" v-text="options.title"></div>
    </q-card-section>
    <q-card-section class="input-container">
      <div v-for="(label, index) in options.labels" :key="index">
        <div class="q-pa-xs">{{ label }}</div>
        <q-input
          outlined
          dense
          v-model="results[index]"
          :hint="options.hints[index]"
          hide-hint
          :autofocus="index === 0"
          @keyup.enter="clickOK"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right" class="button-container">
      <q-btn label="取消" color="grey" flat @click="hide" />
      <q-btn color="primary" label="确定" flat @click="clickOK" />
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

<style scoped>
.input-container {
  padding: 15px 15px 0 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.button-container {
  padding: 5px 15px;
}
</style>
