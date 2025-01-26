<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="output-editor q-px-sm">
      <div class="row justify-center q-px-sm q-pt-md">
        {{ commandName }}
      </div>
      <div class="simple-output q-px-sm">
        <q-badge color="primary" class="q-mb-sm q-pa-xs">完整结果</q-badge>
        <q-input v-model="simpleOutputVar" filled dense autofocus>
          <template v-slot:prepend>
            <div class="variable-label">
              {{ currentOutputs?.label || "输出变量名" }}
            </div>
          </template>
        </q-input>
      </div>
      <div v-if="currentOutputs?.structure">
        <div class="row items-center">
          <q-badge color="primary" class="q-ma-sm q-pa-xs">详细输出</q-badge>
          <div
            v-if="Array.isArray(currentOutputs.structure)"
            class="text-caption text-grey-5"
          >
            数组中第一个元素
          </div>
        </div>
        <q-scroll-area
          style="height: 200px"
          :thumb-style="{
            width: '2px',
          }"
        >
          <div class="detail-output column q-col-gutter-sm q-px-sm">
            <!-- 处理数组类型的structure -->
            <template v-if="Array.isArray(currentOutputs.structure)">
              <div
                v-for="(output, key) in currentOutputs.structure[0]"
                :key="key"
              >
                <!-- 如果是嵌套对象 -->
                <div v-if="hasNestedFields(output)">
                  <BorderLabel
                    :label="output.label || key"
                    :model-value="false"
                  >
                    <div class="column q-col-gutter-sm">
                      <div
                        v-for="(subOutput, subKey) in getNestedFields(output)"
                        :key="subKey"
                      >
                        <div class="output-item">
                          <q-input
                            v-model="outputVars[`[0].${key}.${subKey}`]"
                            filled
                            dense
                            autofocus
                            class="col"
                            :placeholder="subOutput.placeholder"
                          >
                            <template v-slot:prepend>
                              <div class="variable-label">
                                {{ subOutput.label }}
                              </div>
                            </template>
                          </q-input>
                        </div>
                      </div>
                    </div>
                  </BorderLabel>
                </div>
                <!-- 如果是普通字段 -->
                <div v-else class="output-item">
                  <q-input
                    v-model="outputVars[`[0].${key}`]"
                    filled
                    dense
                    class="col"
                    :placeholder="output.placeholder"
                    autofocus
                  >
                    <template v-slot:prepend>
                      <div class="variable-label">{{ output.label }}</div>
                    </template>
                  </q-input>
                </div>
              </div>
            </template>
            <!-- 处理对象类型的structure -->
            <template v-else>
              <div
                v-for="(output, key) in currentOutputs?.structure"
                :key="key"
              >
                <!-- 如果是嵌套对象 -->
                <div v-if="hasNestedFields(output)">
                  <BorderLabel
                    :label="output.label || key"
                    :model-value="false"
                  >
                    <div class="column q-col-gutter-sm">
                      <div
                        v-for="(subOutput, subKey) in getNestedFields(output)"
                        :key="subKey"
                      >
                        <div class="output-item">
                          <q-input
                            v-model="outputVars[`${key}.${subKey}`]"
                            filled
                            dense
                            autofocus
                            class="col"
                            :placeholder="subOutput.placeholder"
                          >
                            <template v-slot:prepend>
                              <div class="variable-label">
                                {{ subOutput.label }}
                              </div>
                            </template>
                          </q-input>
                        </div>
                      </div>
                    </div>
                  </BorderLabel>
                </div>
                <!-- 如果是普通字段 -->
                <div v-else class="output-item">
                  <q-input
                    v-model="outputVars[key]"
                    filled
                    dense
                    class="col"
                    :placeholder="output.placeholder"
                    autofocus
                  >
                    <template v-slot:prepend>
                      <div class="variable-label">{{ output.label }}</div>
                    </template>
                  </q-input>
                </div>
              </div>
            </template>
          </div>
        </q-scroll-area>
      </div>

      <div v-if="!!asyncMode">
        <q-badge color="primary" class="q-ma-sm q-pa-xs">运行模式</q-badge>
        <div class="row q-col-gutter-sm q-px-sm">
          <q-select
            v-model="asyncMode"
            :options="asyncModeOptions"
            filled
            dense
            autofocus
            emit-value
            map-options
            class="col"
          >
          </q-select>
          <q-input
            v-model="callbackFunc"
            filled
            dense
            autofocus
            class="col-8"
            v-if="asyncMode === 'then'"
            placeholder="新函数名则自动创建"
          >
            <template v-slot:prepend>
              <div class="variable-label">回调函数</div>
            </template>
          </q-input>
        </div>
      </div>

      <div class="row justify-end q-px-sm q-py-sm">
        <q-btn flat label="取消" color="primary" v-close-popup />
        <q-btn flat label="确定" color="primary" @click="handleConfirm" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";

export default defineComponent({
  name: "OutputEditor",
  components: {
    BorderLabel,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    command: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "confirm"],
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    currentSubCommand() {
      if (!this.command.subCommands) return {};
      return this.command.subCommands.find(
        (cmd) => cmd.value === this.command.value
      );
    },
    commandName() {
      return this.currentSubCommand.label || this.command.label;
    },
    currentOutputs() {
      return this.currentSubCommand.outputs || this.command.outputs;
    },
  },
  data() {
    return {
      simpleOutputVar: "",
      outputVars: {},
      asyncMode: "await",
      callbackFunc: "",
      asyncModeOptions: [
        {
          label: "等待运行完毕",
          value: "await",
        },
        {
          label: "不等待运行完毕",
          value: "then",
        },
      ],
    };
  },
  watch: {
    "command.outputVariable": {
      immediate: true,
      deep: true,
      handler(newValue) {
        this.initOutputVars(newValue);
      },
    },
    "command.asyncMode": {
      immediate: true,
      handler(newValue) {
        this.asyncMode = newValue;
      },
    },
    "command.callbackFunc": {
      immediate: true,
      handler(newValue) {
        this.callbackFunc = newValue;
      },
    },
  },
  methods: {
    hasNestedFields(output) {
      if (!output) return false;
      return Object.keys(output).some(
        (key) => key !== "label" && key !== "placeholder"
      );
    },
    /**
     * 只处理一层嵌套，手动在配置文件中控制outputs结构不要太复杂
     * 第二层嵌套只嵌套对象，不嵌套数组
     * 最复杂的情况：
     * outputs: {
     *   label: "测试",
     *   structure: [
     *     {
     *       position: { label: "位置", {
     *         x: { label: "X坐标" },
     *         y: { label: "Y坐标" }
     *       }
     *     }
     *   ]
     * }
     *
     *
     */
    getNestedFields(output) {
      const fields = {};
      Object.entries(output).forEach(([key, value]) => {
        if (key !== "label" && key !== "placeholder") {
          fields[key] = value;
        }
      });
      return fields;
    },
    initOutputVars(outputVariable) {
      // 初始化完整输出变量名
      if (!outputVariable) return;
      this.simpleOutputVar = outputVariable.name || "";

      if (this.currentOutputs) {
        // 初始化详细输出变量，直接使用扁平化的结构
        this.outputVars = outputVariable?.details || {};
      }
    },
    handleConfirm() {
      const outputVariable = {
        name: this.simpleOutputVar,
      };

      if (this.currentOutputs) {
        const flatVars = {};
        Object.entries(this.outputVars).forEach(([path, value]) => {
          if (!value) return; // 跳过空值
          flatVars[path] = value;
        });

        // 如果有非空的变量，才添加到结果中
        if (Object.keys(flatVars).length > 0) {
          outputVariable.details = flatVars;
        }
      }

      // 根据输出模式处理
      let result = {
        outputVariable,
      };

      // async模式
      if (this.asyncMode) {
        result.asyncMode = this.asyncMode;
        // 如果是回调函数模式，添加回调函数名和参数信息
        if (this.asyncMode === "then" && this.callbackFunc) {
          result.callbackFunc = this.callbackFunc;
        }
      }

      this.$emit("confirm", result);
      this.isOpen = false;
    },
  },
});
</script>

<style scoped>
.output-editor {
  width: 450px;
}

.output-item {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.output-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.variable-label {
  font-size: 12px;
  border-radius: 4px;
  padding-right: 10px;
  text-align: center;
}

.body--dark .output-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.output-editor :deep(.q-field--filled .q-field__control),
.output-editor :deep(.q-field--filled .q-field__control > *),
.output-editor :deep(.q-field--filled .q-field__native) {
  max-height: 36px;
  min-height: 36px;
  border-radius: 5px;
  font-size: 12px;
}

/* 去除filled输入框边框 */
.output-editor :deep(.q-field__control:before) {
  border: none;
}

/* 去除filled输入框下划线 */
.output-editor :deep(.q-field__control:after) {
  height: 0;
  border-bottom: none;
}
</style>
