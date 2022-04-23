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
  color: ${utools.isDarkColors() ? "white" : "unset"}
}
</style>
`;

export default {
  data() {
    return { frameStyle: frameStyle, frameHeight: this.frameInitHeight };
  },
  props: {
    enableHtml: Boolean,
    runResultStatus: Boolean,
    runResult: String,
    maxHeight: Number,
    frameInitHeight: Number,
  },
  computed: {
    cfw() {
      return this.$refs?.iframe?.contentWindow;
    },
    showFrame() {
      return this.enableHtml && this.runResultStatus;
    },
  },
  mounted() {
    this.frameInit();
  },
  methods: {
    frameInit() {
      if (!this.cfw) return;
      let ctx = {
        quickcommand: _.cloneDeep(quickcommand),
        utools: _.cloneDeep(utools),
        parent: undefined,
      };
      Object.assign(this.cfw, ctx);
      this.cfw.onload = () => {
        this.frameHeight = Math.min(
          this.cfw.document.documentElement.getBoundingClientRect().height,
          this.maxHeight
        );
        this.$emit("frameLoad", this.frameHeight);
      };
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
