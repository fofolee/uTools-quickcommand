<template>
  <div class="ubrowser-editor">
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      header-nav
      animated
      alternative-labels
      flat
      class="ubrowser-stepper"
    >
      <!-- 基础参数步骤 -->
      <q-step :name="1" title="基础参数" icon="settings" :done="step > 1">
        <UBrowserBasic :configs="configs" @update:configs="updateConfigs" />
      </q-step>

      <!-- 浏览器操作步骤 -->
      <q-step :name="2" title="浏览器操作" icon="touch_app" :done="step > 2">
        <UBrowserOperations
          :configs="configs"
          @update:configs="updateConfigs"
          v-model:selected-actions="selectedActions"
          @remove-action="removeAction"
        />
      </q-step>

      <!-- 运行参数步骤 -->
      <q-step
        :name="3"
        title="运行参数"
        icon="settings_applications"
        class="q-pb-md"
      >
        <UBrowserRun :configs="configs" @update:configs="updateConfigs" />
      </q-step>
    </q-stepper>
  </div>
</template>

<style scoped>
.ubrowser-editor {
  width: 100%;
}

.ubrowser-stepper {
  box-shadow: none;
  background-color: rgba(255, 255, 255, 0.8);
}

.body--dark .ubrowser-stepper {
  background-color: rgba(255, 255, 255, 0.05);
}

.ubrowser-stepper :deep(.q-stepper__header) {
  cursor: pointer;
}

.ubrowser-stepper :deep(.q-stepper__step-inner) {
  padding-bottom: 5px;
}
</style>

<script>
import { defineComponent } from "vue";
import UBrowserBasic from "./UBrowserBasic.vue";
import UBrowserOperations from "./UBrowserOperations.vue";
import UBrowserRun from "./UBrowserRun.vue";

export default defineComponent({
  name: "UBrowserEditor",
  components: {
    UBrowserBasic,
    UBrowserOperations,
    UBrowserRun,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      step: 1,
      selectedActions: [],
      configs: {
        // 基础参数
        useragent: {
          value: "",
        },
        goto: {
          url: "",
          headers: {
            Referer: "",
            userAgent: "",
          },
          timeout: 60000,
        },
        // 浏览器操作
        wait: {
          value: "",
          timeout: 60000,
        },
        click: {
          selector: "",
        },
        css: {
          value: "",
        },
        press: {
          key: "",
          modifiers: [],
        },
        paste: {
          text: "",
        },
        screenshot: {
          selector: "",
          rect: { x: 0, y: 0, width: 0, height: 0 },
          savePath: "",
        },
        pdf: {
          options: {
            marginsType: 0,
            pageSize: "A4",
          },
          savePath: "",
        },
        device: {
          size: { width: 1280, height: 800 },
          useragent: "",
        },
        cookies: {
          name: "",
        },
        setCookies: {
          items: [{ name: "", value: "" }],
        },
        removeCookies: {
          name: "",
        },
        clearCookies: {
          url: "",
        },
        evaluate: {
          function: "",
          params: [],
        },
        when: {
          condition: "",
        },
        mousedown: {
          selector: "",
        },
        mouseup: {
          selector: "",
        },
        file: {
          selector: "",
          files: [],
        },
        value: {
          selector: "",
          value: "",
        },
        check: {
          selector: "",
          checked: false,
        },
        focus: {
          selector: "",
        },
        scroll: {
          target: "",
          x: 0,
          y: 0,
        },
        download: {
          url: "",
          savePath: "",
        },
        // 运行参数
        run: {
          show: true,
          width: 1280,
          height: 800,
          x: undefined,
          y: undefined,
          center: true,
          minWidth: 800,
          minHeight: 600,
          maxWidth: undefined,
          maxHeight: undefined,
          resizable: true,
          movable: true,
          minimizable: true,
          maximizable: true,
          alwaysOnTop: false,
          fullscreen: false,
          fullscreenable: true,
          enableLargerThanScreen: false,
          opacity: 1,
        },
      },
      defaultRunConfigs: {
        show: true,
        width: 1280,
        height: 800,
        center: true,
        minWidth: 800,
        minHeight: 600,
        resizable: true,
        movable: true,
        minimizable: true,
        maximizable: true,
        alwaysOnTop: false,
        fullscreen: false,
        fullscreenable: true,
        enableLargerThanScreen: false,
        opacity: 1,
      },
    };
  },
  methods: {
    updateConfigs(newConfigs) {
      this.configs = newConfigs;
    },
    removeAction(action) {
      const index = this.selectedActions.findIndex(
        (a) => a.value === action.value
      );
      if (index > -1) {
        this.selectedActions.splice(index, 1);
      }
    },
    generateCode() {
      let code = "utools.ubrowser";

      // 基础参数
      if (this.configs.useragent.value) {
        code += `.useragent('${this.configs.useragent.value}')`;
      }

      if (this.configs.goto.url) {
        const gotoOptions = {};
        if (this.configs.goto.headers.Referer) {
          gotoOptions.headers = gotoOptions.headers || {};
          gotoOptions.headers.Referer = this.configs.goto.headers.Referer;
        }
        if (this.configs.goto.headers.userAgent) {
          gotoOptions.headers = gotoOptions.headers || {};
          gotoOptions.headers["User-Agent"] =
            this.configs.goto.headers.userAgent;
        }
        if (this.configs.goto.timeout !== 60000) {
          gotoOptions.timeout = this.configs.goto.timeout;
        }

        code += `.goto('${this.configs.goto.url}'${
          Object.keys(gotoOptions).length
            ? `, ${JSON.stringify(gotoOptions)}`
            : ""
        })`;
      }

      // 浏览器操作
      this.selectedActions.forEach((action) => {
        const config = this.configs[action.value];
        switch (action.value) {
          case "wait":
            if (config.value) {
              code += `.wait('${config.value}'${
                config.timeout !== 60000 ? `, ${config.timeout}` : ""
              })`;
            }
            break;

          case "click":
            if (config.selector) {
              code += `.click('${config.selector}')`;
            }
            break;

          case "css":
            if (config.value) {
              code += `.css('${config.value}')`;
            }
            break;

          case "press":
            if (config.key) {
              const modifiers = config.modifiers.length
                ? `, ${JSON.stringify(config.modifiers)}`
                : "";
              code += `.press('${config.key}'${modifiers})`;
            }
            break;

          case "paste":
            if (config.text) {
              code += `.paste('${config.text}')`;
            }
            break;

          case "screenshot":
            if (config.selector || config.savePath) {
              const options = {};
              if (config.selector) options.selector = config.selector;
              if (config.rect.width && config.rect.height) {
                options.rect = config.rect;
              }
              code += `.screenshot('${config.savePath}'${
                Object.keys(options).length
                  ? `, ${JSON.stringify(options)}`
                  : ""
              })`;
            }
            break;

          case "pdf":
            if (config.savePath) {
              code += `.pdf('${config.savePath}'${
                config.options ? `, ${JSON.stringify(config.options)}` : ""
              })`;
            }
            break;

          case "device":
            if (config.size.width && config.size.height) {
              const options = {
                size: config.size,
              };
              if (config.useragent) options.useragent = config.useragent;
              code += `.device(${JSON.stringify(options)})`;
            }
            break;

          case "cookies":
            if (config.name) {
              code += `.cookies('${config.name}')`;
            }
            break;

          case "setCookies":
            if (config.items?.length) {
              code += `.setCookies(${JSON.stringify(config.items)})`;
            }
            break;

          case "removeCookies":
            if (config.name) {
              code += `.removeCookies('${config.name}')`;
            }
            break;

          case "clearCookies":
            code += `.clearCookies(${config.url ? `'${config.url}'` : ""})`;
            break;

          case "evaluate":
            if (config.function) {
              const params = config.params.length
                ? `, ${JSON.stringify(config.params)}`
                : "";
              code += `.evaluate(\`${config.function}\`${params})`;
            }
            break;

          case "when":
            if (config.condition) {
              code += `.when('${config.condition}')`;
            }
            break;

          case "mousedown":
          case "mouseup":
            if (config.selector) {
              code += `.${action.value}('${config.selector}')`;
            }
            break;

          case "file":
            if (config.selector && config.files?.length) {
              code += `.file('${config.selector}', ${JSON.stringify(
                config.files
              )})`;
            }
            break;

          case "value":
            if (config.selector) {
              code += `.value('${config.selector}', '${config.value}')`;
            }
            break;

          case "check":
            if (config.selector) {
              code += `.check('${config.selector}'${
                config.checked !== undefined ? `, ${config.checked}` : ""
              })`;
            }
            break;

          case "focus":
            if (config.selector) {
              code += `.focus('${config.selector}')`;
            }
            break;

          case "scroll":
            if (config.type === "element" && config.selector) {
              code += `.scroll('${config.selector}')`;
            } else if (config.type === "position") {
              if (config.x !== undefined && config.y !== undefined) {
                code += `.scroll(${config.x}, ${config.y})`;
              } else if (config.y !== undefined) {
                code += `.scroll(${config.y})`;
              }
            }
            break;

          case "download":
            if (config.url) {
              code += `.download('${config.url}'${
                config.savePath ? `, '${config.savePath}'` : ""
              })`;
            }
            break;

          case "hide":
          case "show":
            code += `.${action.value}()`;
            break;

          case "devTools":
            if (config.mode) {
              code += `.devTools('${config.mode}')`;
            } else {
              code += `.devTools()`;
            }
            break;
        }
      });

      // 运行参数
      const runOptions = {};
      Object.entries(this.configs.run).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== this.defaultRunConfigs[key]
        ) {
          runOptions[key] = value;
        }
      });

      code += `.run(${
        Object.keys(runOptions).length ? JSON.stringify(runOptions) : ""
      })`;

      this.$emit("update:modelValue", code);
    },
  },
  watch: {
    configs: {
      deep: true,
      handler() {
        this.generateCode();
      },
    },
    selectedActions: {
      handler() {
        this.generateCode();
      },
    },
    step: {
      handler() {
        this.generateCode();
      },
    },
  },
});
</script>
