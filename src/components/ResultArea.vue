<template>
  <div>
    <iframe
      ref="iframe"
      sandbox="allow-scripts allow-forms"
      :src="src"
      :height="frameHeight"
      frameborder="0"
      @load="frameLoad"
      v-if="showFrame"
    ></iframe>
    <div
      v-else
      v-show="!!runResult"
      :class="{ 'text-red': !runResultStatus }"
      class="text q-pa-md"
    >
      <div v-for="item in runResult" :key="item">
        <ObjectTree :obj="item" v-if="typeof item === 'object'" />
        <pre class="result" v-text="item" v-else-if="!!item"></pre>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectTree from "components/popup/ObjectTree";

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
  padding: 10px 20px;
  margin: 0;
  color: ${utools.isDarkColors() ? "white" : "unset"}
}
</style>
`;

export default {
  components: { ObjectTree },
  data() {
    return { frameStyle: frameStyle, frameHeight: this.frameInitHeight };
  },
  props: {
    enableHtml: Boolean,
    runResultStatus: Boolean,
    runResult: Object,
    maxHeight: Number,
    frameInitHeight: Number,
  },
  computed: {
    showFrame() {
      return this.enableHtml && this.runResultStatus;
    },
    src() {
      return this.showFrame
        ? window.URL.createObjectURL(
            new Blob([this.frameStyle, this.runResult], {
              type: "text/html",
            })
          )
        : "";
    },
  },
  mounted() {
    this.frameInit();
    console.log(this.runResult);
  },
  methods: {
    frameInit() {
      let cfw = this.$refs?.iframe?.contentWindow;
      if (!cfw) return;
      let showError = (...args) => {
        quickcommand.showMessageBox(args.join(" "), "error", 0);
      };
      let showLog = (...args) => {
        quickcommand.showMessageBox(args.join(" "), "success", 0);
      };
      let ctx = {
        quickcommand: _.cloneDeep(quickcommand),
        utools: _.cloneDeep(utools),
        parent: undefined,
        console: {
          log: showLog,
          error: showError,
        },
        onerror: (e) => showError(e),
      };
      Object.assign(cfw, ctx);
      cfw.onload = () => {
        this.frameHeight = Math.min(
          cfw.document.body.innerText
            ? cfw.document.documentElement.getBoundingClientRect().height
            : 0,
          this.maxHeight
        );
        this.$emit("frameLoad", this.frameHeight);
      };
    },
  },
};
</script>

<style scoped>
.text {
  font-family: Consolas, Monaco, "Courier New";
}
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
