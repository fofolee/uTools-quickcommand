<template>
  <div>
    <iframe
      ref="iframe"
      sandbox="allow-scripts allow-forms"
      :srcdoc="frameStyle + runResult"
      :height="frameHeight"
      frameborder="0"
      @load="frameLoad"
      v-if="showFrame"
    ></iframe>
    <pre
      v-else
      v-show="!!runResult"
      :class="{
        'text-red': !runResultStatus,
        'q-pa-md': 1,
        result: 1,
      }"
      v-text="runResult"
    ></pre>
  </div>
</template>

<script>
const frameStyle = `<style>::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(194, 194, 194, 0.4);
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
body {
  margin: 0;
  padding: 10px 20px;
  color: ${utools.isDarkColors() ? "white" : "unset"}
}
</style>
`;

export default {
  data() {
    return { frameStyle: frameStyle, frameHeight: 0 };
  },
  props: {
    enableHtml: Boolean,
    runResultStatus: Boolean,
    runResult: String,
    maxHeight: Number,
  },
  computed: {
    cfw() {
      return this.$refs?.iframe?.contentWindow;
    },
    showFrame() {
      return this.enableHtml && this.runResultStatus;
    },
  },
  methods: {
    frameLoad() {
      this.cfw.quickcommand = _.cloneDeep(quickcommand);
      this.cfw.utools = _.cloneDeep(utools);
      this.frameHeight = Math.min(
        this.cfw.document.documentElement.getBoundingClientRect().height,
        this.maxHeight
      );
      this.$emit("frameLoad");
    },
  },
};
</script>

<style scoped>
.result {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  margin: 0;
}
iframe {
  width: 100%;
  display: block;
}
</style>
