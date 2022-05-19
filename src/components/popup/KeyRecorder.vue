<template>
  <q-card>
    <q-btn color="negative" icon="stop" label="停止录制" v-close-popup />
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      recordEvent: null,
    };
  },
  mounted() {
    this.startRecord();
  },
  unmounted() {
    document.removeEventListener("keyup", this.recordEvent);
  },
  methods: {
    startRecord() {
      let keys = [];
      this.recordEvent = (event) => {
        event.preventDefault();
        keys.push(
          event.code.includes("Key") ? event.code.slice(-1) : event.key
        );
        setTimeout(() => {
          this.$emit(
            "sendKeys",
            this.generatedKeyTapCode(this.keyAnalysis(keys.slice(0, 2)))
          );
          keys = [];
        }, 200);
      };
      document.addEventListener("keyup", this.recordEvent);
    },
    keyAnalysis(keys) {
      if (keys.length === 1) return keys;
      keys = keys.sort((x, y) => x.length - y.length);
      if (keys[1].length === 1) keys.pop();
      return keys;
    },
    generatedKeyTapCode(keys) {
      return `keyTap(${JSON.stringify(keys)
        .slice(1, -1)
        .replace("Meta", "command")
        .toLowerCase()})\nquickcommand.sleep(50)\n`;
    },
  },
};
</script>
