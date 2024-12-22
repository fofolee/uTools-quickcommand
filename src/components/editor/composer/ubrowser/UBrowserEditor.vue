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
      <q-step
        :name="1"
        title="基础参数"
        icon="settings"
        :done="step > 1"
      >
        <UBrowserBasic
          :configs="configs"
          @update:configs="updateConfigs"
        />
      </q-step>

      <!-- 浏览器操作步骤 -->
      <q-step
        :name="2"
        title="浏览器操作"
        icon="touch_app"
        :done="step > 2"
      >
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-select
              v-model="selectedActions"
              :options="availableActions"
              multiple
              use-chips
              outlined
              dense
              label="选择操作"
            />
          </div>
          <div class="col-12">
            <UBrowserOperations
              :configs="configs"
              @update:configs="updateConfigs"
              v-model:selected-actions="selectedActions"
              @remove-action="removeAction"
            />
          </div>
        </div>
      </q-step>

      <!-- 运行参数步骤 -->
      <q-step
        :name="3"
        title="运行参数"
        icon="settings_applications"
        class="q-pb-md"
      >
        <UBrowserRun
          :configs="configs"
          @update:configs="updateConfigs"
        />
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import UBrowserBasic from './UBrowserBasic.vue';
import UBrowserOperations from './UBrowserOperations.vue';
import UBrowserRun from './UBrowserRun.vue';

export default defineComponent({
  name: 'UBrowserEditor',
  components: {
    UBrowserBasic,
    UBrowserOperations,
    UBrowserRun
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      step: 1,
      selectedActions: [],
      configs: {
        // 基础参数
        useragent: {
          value: ''
        },
        goto: {
          url: '',
          headers: {
            Referer: '',
            userAgent: ''
          },
          timeout: 60000
        },
        // 浏览器操作
        wait: {
          value: '',
          timeout: 60000
        },
        click: {
          selector: ''
        },
        css: {
          value: ''
        },
        press: {
          key: '',
          modifiers: []
        },
        paste: {
          text: ''
        },
        screenshot: {
          selector: '',
          rect: { x: 0, y: 0, width: 0, height: 0 },
          savePath: ''
        },
        pdf: {
          options: {
            marginsType: 0,
            pageSize: 'A4'
          },
          savePath: ''
        },
        device: {
          size: { width: 1280, height: 800 },
          useragent: ''
        },
        cookies: {
          name: ''
        },
        setCookies: {
          items: [{ name: '', value: '' }]
        },
        removeCookies: {
          name: ''
        },
        clearCookies: {
          url: ''
        },
        evaluate: {
          function: '',
          params: []
        },
        when: {
          condition: ''
        },
        mousedown: {
          selector: ''
        },
        mouseup: {
          selector: ''
        },
        file: {
          selector: '',
          files: []
        },
        value: {
          selector: '',
          value: ''
        },
        check: {
          selector: '',
          checked: false
        },
        focus: {
          selector: ''
        },
        scroll: {
          target: '',
          x: 0,
          y: 0
        },
        download: {
          url: '',
          savePath: ''
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
          opacity: 1
        }
      }
    };
  },
  computed: {
    availableActions() {
      return [
        { label: '等待', value: 'wait' },
        { label: '点击', value: 'click' },
        { label: '注入CSS', value: 'css' },
        { label: '按键', value: 'press' },
        { label: '粘贴', value: 'paste' },
        { label: '截图', value: 'screenshot' },
        { label: '导出PDF', value: 'pdf' },
        { label: '模拟设备', value: 'device' },
        { label: '获取Cookie', value: 'cookies' },
        { label: '设置Cookie', value: 'setCookies' },
        { label: '删除Cookie', value: 'removeCookies' },
        { label: '清除Cookie', value: 'clearCookies' },
        { label: '执行脚本', value: 'evaluate' },
        { label: '条件判断', value: 'when' },
        { label: '鼠标按下', value: 'mousedown' },
        { label: '鼠标释放', value: 'mouseup' },
        { label: '上传文件', value: 'file' },
        { label: '设置值', value: 'value' },
        { label: '选中状态', value: 'check' },
        { label: '获取焦点', value: 'focus' },
        { label: '滚动', value: 'scroll' },
        { label: '下载', value: 'download' },
        { label: '隐藏', value: 'hide' },
        { label: '显示', value: 'show' },
        { label: '开发工具', value: 'devTools' }
      ];
    }
  },
  methods: {
    updateConfigs(newConfigs) {
      this.configs = newConfigs;
    },
    removeAction(action) {
      const index = this.selectedActions.findIndex(a => a.value === action.value);
      if (index > -1) {
        this.selectedActions.splice(index, 1);
      }
    },
    generateCode() {
      let code = 'utools.ubrowser';

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
          gotoOptions.headers['User-Agent'] = this.configs.goto.headers.userAgent;
        }
        if (this.configs.goto.timeout !== 60000) {
          gotoOptions.timeout = this.configs.goto.timeout;
        }

        code += `.goto('${this.configs.goto.url}'${Object.keys(gotoOptions).length ? `, ${JSON.stringify(gotoOptions)}` : ''})`;
      }

      // 浏览器操作
      this.selectedActions.forEach(action => {
        const config = this.configs[action.value];
        switch (action.value) {
          case 'wait':
            if (config.value) {
              code += `.wait('${config.value}'${config.timeout !== 60000 ? `, ${config.timeout}` : ''})`;
            }
            break;

          case 'click':
            if (config.selector) {
              code += `.click('${config.selector}')`;
            }
            break;

          case 'css':
            if (config.value) {
              code += `.css('${config.value}')`;
            }
            break;

          case 'press':
            if (config.key) {
              const modifiers = config.modifiers.length ? `, ${JSON.stringify(config.modifiers)}` : '';
              code += `.press('${config.key}'${modifiers})`;
            }
            break;

          case 'paste':
            if (config.text) {
              code += `.paste('${config.text}')`;
            }
            break;

          case 'screenshot':
            if (config.selector || config.savePath) {
              const options = {};
              if (config.selector) options.selector = config.selector;
              if (config.rect.width && config.rect.height) {
                options.rect = config.rect;
              }
              code += `.screenshot('${config.savePath}'${Object.keys(options).length ? `, ${JSON.stringify(options)}` : ''})`;
            }
            break;

          case 'pdf':
            if (config.savePath) {
              code += `.pdf('${config.savePath}'${config.options ? `, ${JSON.stringify(config.options)}` : ''})`;
            }
            break;

          case 'device':
            if (config.size.width && config.size.height) {
              const options = {
                size: config.size
              };
              if (config.useragent) options.useragent = config.useragent;
              code += `.device(${JSON.stringify(options)})`;
            }
            break;

          case 'cookies':
            if (config.name) {
              code += `.cookies('${config.name}')`;
            }
            break;

          case 'setCookies':
            if (config.items?.length) {
              code += `.setCookies(${JSON.stringify(config.items)})`;
            }
            break;

          case 'removeCookies':
            if (config.name) {
              code += `.removeCookies('${config.name}')`;
            }
            break;

          case 'clearCookies':
            code += `.clearCookies(${config.url ? `'${config.url}'` : ''})`;
            break;

          case 'evaluate':
            if (config.function) {
              const params = config.params.length ? `, ${JSON.stringify(config.params)}` : '';
              code += `.evaluate(\`${config.function}\`${params})`;
            }
            break;

          case 'when':
            if (config.condition) {
              code += `.when('${config.condition}')`;
            }
            break;

          case 'mousedown':
          case 'mouseup':
            if (config.selector) {
              code += `.${action.value}('${config.selector}')`;
            }
            break;

          case 'file':
            if (config.selector && config.files?.length) {
              code += `.file('${config.selector}', ${JSON.stringify(config.files)})`;
            }
            break;

          case 'value':
            if (config.selector) {
              code += `.value('${config.selector}', '${config.value}')`;
            }
            break;

          case 'check':
            if (config.selector) {
              code += `.check('${config.selector}'${config.checked !== undefined ? `, ${config.checked}` : ''})`;
            }
            break;

          case 'focus':
            if (config.selector) {
              code += `.focus('${config.selector}')`;
            }
            break;

          case 'scroll':
            if (config.x !== undefined || config.y !== undefined) {
              const options = {};
              if (config.target) options.target = config.target;
              if (config.x !== undefined) options.x = config.x;
              if (config.y !== undefined) options.y = config.y;
              code += `.scroll(${JSON.stringify(options)})`;
            }
            break;

          case 'download':
            if (config.url) {
              code += `.download('${config.url}'${config.savePath ? `, '${config.savePath}'` : ''})`;
            }
            break;

          case 'hide':
          case 'show':
          case 'devTools':
            code += `.${action.value}()`;
            break;
        }
      });

      // 运行参数
      const runOptions = {};
      Object.entries(this.configs.run).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          runOptions[key] = value;
        }
      });

      code += `.run(${Object.keys(runOptions).length ? JSON.stringify(runOptions) : ''})`;

      this.$emit('update:modelValue', code);
    }
  },
  watch: {
    configs: {
      deep: true,
      handler() {
        this.generateCode();
      }
    },
    selectedActions: {
      handler() {
        this.generateCode();
      }
    },
    step: {
      handler() {
        this.generateCode();
      }
    }
  }
});
</script>

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
</style>
