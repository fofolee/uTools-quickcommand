<template>
  <q-dialog
    v-model="showDialog"
    :maximized="maximized"
    :transition-show="maximized ? 'fade' : 'scale'"
    :transition-hide="maximized ? 'fade' : 'scale'"
  >
    <component
      ref="ui"
      :is="currentUI"
      :options="options"
      @clickOK="clickOK"
      @hide="showDialog = false"
    />
  </q-dialog>
  <!-- waitButton 单独一个 -->
  <q-btn
    class="fixed-top-right"
    style="z-index: 9999"
    v-if="showWb"
    color="primary"
    :label="wbLabel"
    @click="
      showWb = false;
      wbEvent();
    "
  />
</template>

<script>
import { Notify } from "quasar";
import { markRaw } from "vue";
import InputBox from "components/quickcommandUI/InputBox";
import ButtonBox from "components/quickcommandUI/ButtonBox";
import ConfirmBox from "components/quickcommandUI/ConfirmBox";
import TextArea from "components/quickcommandUI/TextArea";
import SelectList from "components/quickcommandUI/SelectList";

export default {
  components: {
    InputBox: markRaw(InputBox),
    ButtonBox: markRaw(ButtonBox),
    ConfirmBox: markRaw(ConfirmBox),
    TextArea: markRaw(TextArea),
    SelectList: markRaw(SelectList),
  },
  data() {
    return {
      currentUI: null,
      options: {},
      showDialog: false,
      maximized: false,
      showWb: false,
      wbLabel: "",
      listeners: [],
    };
  },
  mounted() {
    const quickcommandUI = {
      showInputBox: (options = ["请输入"], title = "") =>
        new Promise((reslove, reject) => {
          let props = {
            labels: [],
            values: [],
            hints: [],
            title: title,
          };
          if (!_.isObject(options))
            return reject(new TypeError(`应为 Object, 而非 ${typeof options}`));
          if (_.isArray(options)) props.labels = options;
          else Object.assign(props, options);
          this.showUI(InputBox, props, false, reslove);
        }),

      showButtonBox: (labels = ["确定"], title = "") =>
        new Promise((reslove, reject) => {
          if (!_.isArray(labels))
            return reject(new TypeError(`应为 Array, 而非 ${typeof labels}`));
          this.showUI(ButtonBox, { labels, title }, false, reslove);
        }),

      showConfirmBox: (message = "", title = "提示", isHtml = false, width) =>
        new Promise((reslove, reject) => {
          this.showUI(
            ConfirmBox,
            { message, title, isHtml, width },
            false,
            reslove
          );
        }),

      showMessageBox: (message, icon = "success", time, position = "top") => {
        message = _.truncate(message, { length: 1200 });
        if (icon === "success") icon = "positive";
        if (icon === "error") icon = "negative";
        if (typeof time === "undefined")
          time = Math.max(message.toString().length * 120, 1000);
        Notify.create({
          type: icon,
          message: message,
          timeout: time,
          position: position,
          actions:
            time === 0
              ? [
                  {
                    label: "确定",
                    color: "white",
                  },
                ]
              : [],
        });
      },

      showTextArea: (placeholder = "", value = "") =>
        new Promise((reslove, reject) => {
          this.showUI(TextArea, { placeholder, value }, true, reslove);
        }),

      showSelectList: (initItems, options = {}) =>
        new Promise((reslove, reject) => {
          if (!_.isArray(initItems))
            return reject(
              new TypeError(`应为 Array, 而非 ${typeof initItems}`)
            );
          let defaultOptions = {
            placeholder: "输入进行筛选，支持拼音",
            optionType: "plaintext",
            enableSearch: true,
            showCancelButton: false,
            closeOnSelect: true,
          };
          options = Object.assign(defaultOptions, options);
          this.showUI(SelectList, { initItems, options }, true, reslove);
        }),

      showWaitButton: (callback, label = "确定") => {
        this.wbLabel = label;
        this.showWb = true;
        this.wbEvent = callback;
      },

      closeWaitButton: () => {
        this.showWb = false;
      },

      updateSelectList: (opt, id) => {
        if (this.currentUI !== SelectList) throw "请先创建 selectList";
        if (typeof id === "undefined") this.$refs.ui.items.push(opt);
        else this.$refs.ui.items[id] = opt;
      },

      listenKeydown: (callback) => {
        this.listeners.push(callback);
        document.addEventListener("keydown", callback);
      },

      removeListener: () => {
        this.listeners.forEach((listener) => {
          document.removeEventListener("keydown", listener);
        });
      },
    };
    Object.assign(window.quickcommand, quickcommandUI);
    window.quickcommand.userData = this.$root.utools.userData;
    Object.freeze(quickcommand);
  },
  methods: {
    clickOK() {},
    wbEvent() {},
    showUI(uiComponent, options, maximized, reslove) {
      this.showDialog = true;
      this.options = options;
      this.maximized = maximized;
      this.currentUI = uiComponent;
      this.clickOK = reslove;
    },
  },
};
</script>
