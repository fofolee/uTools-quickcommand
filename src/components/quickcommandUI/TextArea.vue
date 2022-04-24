<template>
  <q-card class="q-dialog-plugin">
    <textarea
      v-model="result"
      :placeholder="options.placeholder"
      autofocus
      class="fixed"
      :style="{
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: '#00000000',
        color: $q.dark.isActive ? 'white' : 'black',
        fontSize: '16px',
        outline: 'none',
        border: '3px solid #3577cb',
        borderRadius: '5px',
      }"
    />
    <div class="fixed-bottom-right q-pa-md q-gutter-sm">
      <q-btn round color="blue-grey" icon="arrow_back" v-close-popup />
      <q-btn round color="primary" icon="done" @click="clickOK" />
    </div>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      result: this.options.value,
    };
  },
  props: {
    options: Object,
  },
  methods: {
    clickOK() {
      this.$emit("clickOK", this.result);
    },
  },
};
</script>
