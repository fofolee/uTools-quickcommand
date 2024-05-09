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
      v-show="!!runResult.length"
      :class="{ 'text-red': !runResultStatus }"
      class="text q-px-md q-py-sm"
    >
      <div v-for="item in runResult" :key="item">
        <ObjectTree :obj="item" v-if="typeof item === 'object'" />
        <pre
          class="result undefined"
          v-else-if="typeof item === 'undefined'"
          v-text="'undefined'"
        />
        <pre class="result" v-text="item" v-else />
      </div>
    </div>
  </div>
</template>

<script>
import ObjectTree from "components/popup/ObjectTree";

const frameStyle = `<style>
::-webkit-scrollbar {
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
    frameInitHeight: Number,
  },
  computed: {
    showFrame() {
      return this.enableHtml && this.runResultStatus;
    },
    src() {
      return this.showFrame
        ? window.URL.createObjectURL(
            new Blob([this.frameStyle].concat(this.runResult), {
              type: "text/html",
            })
          )
        : "";
    },
  },
  mounted() {
    this.frameInit();
  },
  methods: {
    frameInit() {
      if (!this.showFrame) return;
      let cfw = this.$refs.iframe.contentWindow;
      Object.assign(cfw, this.context());
      cfw.onload = () => {
        !utools.isDarkColors() || (cfw.document.body.style.color = "white");
        let clientHeight =
          cfw.document.documentElement.getBoundingClientRect().height;
        clientHeight = clientHeight === 20 ? 0 : clientHeight;
        this.frameHeight = Math.max(
          // 当有绝对定位的元素时只能通过遍历获取高度
          this.getMaxElHeight(cfw.document) || 0,
          clientHeight
        );
        this.$emit("frameLoad", this.frameHeight);
      };
    },
    context() {
      let showError = (...args) => {
        quickcommand.showMessageBox(args.join(" "), "error", 0);
      };
      let showLog = (...args) => {
        quickcommand.showMessageBox(args.join(" "), "success", 0);
      };
      return {
        quickcommand: _.cloneDeep(quickcommand),
        utools: _.cloneDeep(utools),
        parent: undefined,
        console: {
          log: showLog,
          error: showError,
        },
        onerror: (e) => showError(e),
      };
    },
    getMaxElHeight(doc) {
      let els = Array.prototype.slice.call(doc.body.getElementsByTagName("*"));
      let elHeights = [];
      for (let i = 0, l = els.length; i < l; i++) {
        elHeights.push(els[i].scrollTop + els[i].offsetHeight);
      }
      return Math.max.apply(Math, elHeights);
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
.undefined {
  color: #999;
  font-style: italic;
}
iframe {
  width: 100%;
  display: block;
}
</style>
