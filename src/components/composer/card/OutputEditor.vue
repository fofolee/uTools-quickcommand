<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="output-editor q-px-sm">
      <div class="row justify-center q-px-sm q-pt-md">
        {{ commandName }}
      </div>

      <!-- 完整结果部分 -->
      <SectionBlock title="完整结果" :subtitle="outputTypeName || ''">
        <OutputField
          v-model="simpleOutputVar"
          :label="currentOutputs?.label || '输出变量名'"
          :suggest-name="currentOutputs?.suggestName"
          autofocus
          :show-variable-list="true"
          class="q-px-sm"
        />
      </SectionBlock>

      <!-- 详细输出部分 -->
      <template v-if="currentOutputs?.structure">
        <SectionBlock
          title="详细输出"
          :subtitle="
            isOutputTypeArray && currentOutputs.structure.length === 1
              ? '第一个元素'
              : ''
          "
        >
          <q-scroll-area
            :style="{
              height: `${Math.min(220, 44 * inputNumbers)}px`,
            }"
            :thumb-style="{
              width: '2px',
            }"
          >
            <div class="detail-output column q-col-gutter-sm q-px-sm">
              <template v-if="isOutputTypeArray">
                <!-- 处理数组结构但内部是简单对象的情况 -->
                <template v-if="isSimpleArrayStructure">
                  <template
                    v-for="(output, index) in currentOutputs.structure"
                    :key="index"
                  >
                    <OutputField
                      v-model="outputVars['[' + index + ']']"
                      :label="output.label"
                      :placeholder="output.placeholder"
                      :suggest-name="output.suggestName"
                      :show-variable-list="true"
                    />
                  </template>
                </template>
                <!-- 处理数组结构且内部是复杂对象的情况 -->
                <template v-else>
                  <template
                    v-for="(item, index) in currentOutputs.structure"
                    :key="index"
                  >
                    <div
                      class="text-caption q-px-sm"
                      v-if="currentOutputs.structure.length > 1"
                    >
                      第{{ index + 1 }}个元素
                    </div>
                    <div class="q-col-gutter-sm column">
                      <OutputStructure
                        v-for="(output, key) in item"
                        :key="key"
                        :output="output"
                        :output-key="key"
                        :is-array="true"
                        :array-index="index"
                        :fixed-fields="fixedFields"
                        v-model="outputVars"
                      />
                    </div>
                  </template>
                </template>
              </template>
              <template v-else>
                <template
                  v-for="(output, key) in currentOutputs?.structure"
                  :key="key"
                >
                  <OutputStructure
                    :output="output"
                    :output-key="key"
                    :fixed-fields="fixedFields"
                    v-model="outputVars"
                  />
                </template>
              </template>
            </div>
          </q-scroll-area>
        </SectionBlock>
      </template>

      <!-- 运行模式部分 -->
      <template v-if="!!asyncMode">
        <SectionBlock title="运行模式">
          <div class="row q-col-gutter-sm q-px-sm">
            <OutputField
              v-model="asyncMode"
              class="col"
              :options="asyncModeOptions"
            />
            <template v-if="asyncMode === 'then'">
              <OutputField
                v-model="callbackFunc"
                label="回调函数"
                placeholder="新函数名则自动创建"
                class="col-8"
                :show-function-list="true"
              />
            </template>
          </div>
        </SectionBlock>
      </template>

      <div class="row justify-end q-px-sm q-py-sm">
        <q-btn flat label="清空" color="primary" @click="handleClear" />
        <q-btn flat label="取消" color="primary" v-close-popup />
        <q-btn flat label="确定" color="primary" @click="handleConfirm" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { validateVariableName } from "js/common/variableValidator";
import OutputField from "./output/OutputField.vue";
import SectionBlock from "./output/SectionBlock.vue";
import OutputStructure from "./output/OutputStructure.vue";

export default defineComponent({
  name: "OutputEditor",
  components: {
    OutputField,
    SectionBlock,
    OutputStructure,
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
    inputNumbers() {
      const structure = this.currentOutputs?.structure;
      if (!structure) return 0;
      if (Array.isArray(structure)) {
        if (this.isSimpleArrayStructure) {
          return structure.length;
        }
        return Object.keys(structure[0]).length;
      }
      return Object.keys(structure).length;
    },
    outputTypeName() {
      const structure = this.currentOutputs?.structure;
      if (Array.isArray(structure)) {
        return "数组";
      }
      if (typeof structure === "object") {
        return "对象";
      }
      return this.currentOutputs?.typeName;
    },
    isOutputTypeArray() {
      return this.outputTypeName === "数组";
    },
    isSimpleArrayStructure() {
      if (!this.isOutputTypeArray || !this.currentOutputs?.structure?.length) {
        return false;
      }
      const firstItem = this.currentOutputs.structure[0];
      // 如果数组第一项只包含 label 和 placeholder，则认为是简单结构
      return (
        Object.keys(firstItem).every((key) => this.fixedFields.includes(key)) &&
        firstItem.label
      );
    },
    currentSubCommand() {
      if (!this.command.subCommands) return {};
      return this.command.subCommands.find(
        (cmd) => cmd.value === this.command.subCommand
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
      fixedFields: ["label", "placeholder", "suggestName"],
    };
  },
  watch: {
    "command.outputVariable": {
      handler(value) {
        this.initOutputVars(value);
      },
      immediate: true,
    },
    "command.asyncMode": {
      handler(value) {
        this.asyncMode = value;
      },
      immediate: true,
    },
    "command.callbackFunc": {
      handler(value) {
        this.callbackFunc = value;
      },
      immediate: true,
    },
  },
  methods: {
    initOutputVars(outputVariable) {
      // 初始化完整输出变量名
      if (!outputVariable) {
        this.simpleOutputVar = "";
        this.outputVars = {};
        return;
      }

      this.simpleOutputVar = outputVariable.name;
      this.outputVars = outputVariable.details;
    },
    handleConfirm() {
      const outputVariable = {};

      if (this.simpleOutputVar) {
        outputVariable.name = this.simpleOutputVar;
      }

      if (this.currentOutputs) {
        const flatVars = {};
        Object.entries(this.outputVars || {}).forEach(([path, value]) => {
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

      // 检查变量名是否合法
      const varNames = [
        outputVariable.name,
        ...Object.values(outputVariable.details || {}),
        result.callbackFunc,
      ].filter(Boolean);

      const invalidVars = varNames.filter((name) => {
        return !validateVariableName(name).isValid;
      });

      if (invalidVars.length > 0) {
        quickcommand.showMessageBox(
          `变量名/函数名 ${invalidVars.join(", ")} 包含无效字符，请修改`,
          "error"
        );
        return;
      }

      this.$emit("confirm", result);
      this.isOpen = false;
    },
    handleClear() {
      this.simpleOutputVar = "";
      this.outputVars = {};
    },
  },
});
</script>

<style scoped>
.output-editor {
  width: 450px;
}
</style>
