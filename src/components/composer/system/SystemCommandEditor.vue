<template>
  <div class="row q-col-gutter-sm">
    <!-- 命令输入和选项按钮 -->
    <div class="col-12 command-input-wrapper">
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <VariableInput
            :model-value="argvs.command"
            @update:model-value="(val) => updateArgvs('command', val)"
            label="命令"
            icon="terminal"
          />
        </div>
        <q-btn
          flat
          round
          dense
          icon="settings"
          :color="showOptions ? 'primary' : 'grey-7'"
          @click="showOptions = !showOptions"
        >
          <q-tooltip>选项</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 执行选项 -->
    <div class="col-12">
      <q-slide-transition>
        <div v-show="showOptions" class="row q-col-gutter-sm">
          <!-- 工作目录 -->
          <div class="col-12 col-sm-6">
            <VariableInput
              :model-value="argvs.options.cwd"
              @update:model-value="(val) => updateArgvs('options.cwd', val)"
              label="工作目录"
              icon="folder"
            />
          </div>

          <!-- Shell路径 -->
          <div class="col-12 col-sm-6">
            <VariableInput
              :model-value="argvs.options.shell"
              @update:model-value="(val) => updateArgvs('options.shell', val)"
              label="Shell路径"
              icon="terminal"
            />
          </div>

          <!-- 超时和缓冲区 -->
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-sm-6">
                <NumberInput
                  :model-value="argvs.options.timeout"
                  @update:model-value="
                    (val) => updateArgvs('options.timeout', val)
                  "
                  label="超时时间(ms)"
                  icon="timer"
                />
              </div>
              <div class="col-sm-6">
                <NumberInput
                  :model-value="argvs.options.maxBuffer"
                  @update:model-value="
                    (val) => updateArgvs('options.maxBuffer', val)
                  "
                  label="最大缓冲区(bytes)"
                  icon="memory"
                />
              </div>
            </div>
          </div>

          <!-- 编码处理 -->
          <div class="col-12">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-6 row justify-between">
                <q-toggle
                  :model-value="argvs.options.windowsHide"
                  @update:model-value="
                    (val) => updateArgvs('options.windowsHide', val)
                  "
                  label="隐藏命令窗口"
                />
                <q-toggle
                  :model-value="argvs.options.autoEncoding"
                  @update:model-value="
                    (val) => updateArgvs('options.autoEncoding', val)
                  "
                  label="自动处理编码"
                />
              </div>
              <div class="col-6" v-if="!argvs.options.autoEncoding">
                <q-select
                  :model-value="argvs.options.encoding"
                  @update:model-value="
                    (val) => updateArgvs('options.encoding', val)
                  "
                  :options="encodingOptions"
                  label="输出编码"
                  dense
                  filled
                  emit-value
                  map-options
                  options-dense
                >
                  <template v-slot:prepend>
                    <q-icon name="code" />
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <!-- 环境变量 -->
          <div class="col-12">
            <DictEditor
              :model-value="argvs.options.env"
              @update:model-value="(val) => updateArgvs('options.env', val)"
              label="环境变量"
              icon="attach_money"
            />
          </div>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyArgv } from "js/composer/formatString";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import DictEditor from "components/composer/common/DictEditor.vue";

export default defineComponent({
  name: "SystemCommandEditor",
  components: {
    VariableInput,
    NumberInput,
    DictEditor,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      showOptions: false,
      encodingOptions: [
        { label: "Buffer", value: "buffer" },
        { label: "UTF-8", value: "utf8" },
        { label: "GBK", value: "gbk" },
        { label: "GB2312", value: "gb2312" },
        { label: "ASCII", value: "ascii" },
        { label: "Base64", value: "base64" },
      ],
      defaultArgvs: {
        command: newVarInputVal("str"),
        options: {
          cwd: newVarInputVal("str"),
          env: {},
          autoEncoding: true,
          encoding: "buffer",
          timeout: 0,
          maxBuffer: 1024 * 1024, // 1MB
          shell: newVarInputVal("str"),
          windowsHide: true,
        },
      },
    };
  },
  computed: {
    argvs: {
      get() {
        return (
          this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
        );
      },
      set(value) {
        this.updateModelValue(value);
      },
    },
  },
  methods: {
    generateCode(argvs) {
      const args = [];

      // 添加命令
      args.push(stringifyArgv(argvs.command));

      // 添加选项
      const options = { ...argvs.options };
      // 移除默认值
      Object.keys(options).forEach((key) => {
        if (
          JSON.stringify(options[key]) ===
          JSON.stringify(this.defaultArgvs.options[key])
        ) {
          delete options[key];
        }
      });

      if (Object.keys(options).length > 0) {
        args.push(stringifyArgv(options));
      }

      return `${this.modelValue.value}(${args.join(", ")})`;
    },
    updateArgvs(key, value) {
      if (key.includes(".")) {
        // 处理嵌套属性，如 'options.encoding'
        const [parent, child] = key.split(".");
        this.argvs = {
          ...this.argvs,
          [parent]: {
            ...this.argvs[parent],
            [child]: value,
          },
        };
      } else {
        // 处理顶层属性
        this.argvs = { ...this.argvs, [key]: value };
      }
    },
    getSummary(argvs) {
      return stringifyArgv(argvs.command);
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        code: this.generateCode(argvs),
        argvs,
      });
    },
  },
  mounted() {
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.q-expansion-item :deep(.q-expansion-item__container) {
  border: 1px solid #ddd;
  border-radius: 4px;
}
.command-input-wrapper {
  position: relative;
}
</style>
