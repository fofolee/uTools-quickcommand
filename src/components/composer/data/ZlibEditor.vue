<template>
  <div class="zlib-editor">
    <!-- 操作类型选择 -->
    <OperationCard
      :model-value="argvs.operation"
      @update:model-value="(val) => updateArgvs('operation', val)"
      :options="operations"
    />
    <!-- 数据输入 -->
    <VariableInput
      :model-value="argvs.data"
      @update:model-value="(val) => updateArgvs('data', val)"
      label="要处理的数据"
      icon="data_object"
    />
    <!-- 操作配置 -->
    <div class="operation-options">
      <div class="options-container">
        <!-- 压缩选项 -->
        <div class="row q-col-gutter-sm">
          <!-- 压缩方法选择 -->
          <q-select
            :model-value="argvs.method"
            @update:model-value="updateArgvs('method', $event)"
            :options="methods"
            label="压缩方法"
            class="col-3"
            dense
            filled
            emit-value
            map-options
            options-dense
          />
          <!-- Gzip/Deflate 选项 -->
          <template v-if="argvs.method !== 'brotli'">
            <div class="col-12 col-sm-3">
              <q-select
                :model-value="argvs.options.level"
                @update:model-value="(val) => updateArgvs('options.level', val)"
                :options="compressionLevels"
                label="压缩级别"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                :model-value="argvs.options.memLevel"
                @update:model-value="
                  (val) => updateArgvs('options.memLevel', val)
                "
                :options="memoryLevels"
                label="内存级别"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                :model-value="argvs.options.strategy"
                @update:model-value="
                  (val) => updateArgvs('options.strategy', val)
                "
                :options="strategies"
                label="压缩策略"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
          </template>

          <!-- Brotli 选项 -->
          <template v-else>
            <div class="col-12 col-sm-3">
              <q-select
                :model-value="argvs.options.params.mode"
                @update:model-value="
                  (val) => updateArgvs('options.params.mode', val)
                "
                :options="brotliModes"
                label="压缩模式"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-select
                :model-value="argvs.options.params.quality"
                @update:model-value="
                  (val) => updateArgvs('options.params.quality', val)
                "
                :options="brotliQualities"
                label="压缩质量"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
            <div class="col-12 col-sm-3">
              <NumberInput
                :model-value="argvs.options.params.sizeHint"
                @update:model-value="
                  (val) => updateArgvs('options.params.sizeHint', val)
                "
                label="大小提示"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyArgv } from "js/composer/formatString";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import OperationCard from "components/composer/common/OperationCard.vue";
import { newVarInputVal } from "js/composer/varInputValManager";

export default defineComponent({
  name: "ZlibEditor",
  components: {
    VariableInput,
    NumberInput,
    OperationCard,
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
      operations: [
        { value: "compressData", label: "压缩", icon: "compress" },
        { value: "decompressData", label: "解压", icon: "expand" },
      ],
      methods: [
        { label: "Gzip", value: "gzip" },
        { label: "Deflate", value: "deflate" },
        { label: "Brotli", value: "brotli" },
      ],
      compressionLevels: [
        { label: "默认压缩", value: -1 },
        { label: "不压缩", value: 0 },
        { label: "最快压缩", value: 1 },
        { label: "最佳压缩", value: 9 },
      ],
      memoryLevels: [
        { label: "默认内存", value: 8 },
        { label: "最小内存", value: 1 },
        { label: "最大内存", value: 9 },
      ],
      strategies: [
        { label: "默认策略", value: 0 },
        { label: "过滤策略", value: 1 },
        { label: "哈夫曼策略", value: 2 },
        { label: "RLE策略", value: 3 },
        { label: "固定策略", value: 4 },
      ],
      brotliModes: [
        { label: "通用模式", value: 0 },
        { label: "文本模式", value: 1 },
        { label: "字体模式", value: 2 },
      ],
      brotliQualities: [
        { label: "默认质量", value: 11 },
        { label: "最快压缩", value: 0 },
        { label: "最佳压缩", value: 11 },
      ],
      defaultArgvs: {
        operation: "compressData",
        method: "gzip",
        data: newVarInputVal("str"),
        options: {
          level: -1,
          memLevel: 8,
          strategy: 0,
          params: {
            mode: 0,
            quality: 11,
            sizeHint: 0,
          },
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
    generateCode(argvs = this.argvs) {
      const options =
        argvs.method === "brotli"
          ? { params: argvs.options.params }
          : {
              level: argvs.options.level,
              memLevel: argvs.options.memLevel,
              strategy: argvs.options.strategy,
            };

      return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
        argvs.data
      )}, "${argvs.method}", ${stringifyArgv(options)})`;
    },
    updateArgvs(key, value) {
      this.argvs = {
        ...this.argvs,
        [key]: value,
      };
    },
    getSummary(argvs) {
      const op = this.operations.find(
        (op) => op.value === argvs.operation
      )?.label;
      const method = this.methods.find((m) => m.value === argvs.method)?.label;
      return `${op} (${method})`;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        argvs,
        code: this.generateCode(argvs),
      });
    },
  },
  mounted() {
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.zlib-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options-container {
  min-height: 32px;
  display: flex;
  gap: 8px;
  flex-direction: column;
  justify-content: center;
}
</style>
