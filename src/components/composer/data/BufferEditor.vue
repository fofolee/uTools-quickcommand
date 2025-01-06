<template>
  <div class="buffer-editor">
    <!-- 操作类型选择 -->
    <OperationCard
      :model-value="argvs.operation"
      @update:model-value="(val) => updateArgvs('operation', val)"
      :options="operations"
    />
    <!-- 操作配置 -->
    <div class="operation-options q-mt-sm">
      <div class="options-container">
        <!-- 创建 Buffer -->
        <div v-if="argvs.operation === 'from'" class="row q-col-gutter-sm">
          <VariableInput
            :model-value="argvs.data"
            @update:model-value="(val) => updateArgvs('data', val)"
            label="数据"
            icon="text_fields"
            class="col"
          />
          <q-select
            :model-value="argvs.encoding"
            @update:model-value="(val) => updateArgvs('encoding', val)"
            :options="encodings"
            label="编码"
            dense
            filled
            emit-value
            map-options
            options-dense
            class="col-3"
          />
        </div>

        <!-- 转换为字符串 -->
        <div
          v-if="argvs.operation === 'toString'"
          class="column q-col-gutter-sm"
        >
          <VariableInput
            :model-value="argvs.buffer"
            @update:model-value="(val) => updateArgvs('buffer', val)"
            label="Buffer"
            icon="memory"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-select
                :model-value="argvs.encoding"
                @update:model-value="(val) => updateArgvs('encoding', val)"
                :options="encodings"
                label="编码"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
            <div class="col-12 col-sm-4">
              <NumberInput
                :model-value="argvs.start"
                @update:model-value="(val) => updateArgvs('start', val)"
                label="起始位置"
              />
            </div>
            <div class="col-12 col-sm-4">
              <NumberInput
                :model-value="argvs.end"
                @update:model-value="(val) => updateArgvs('end', val)"
                label="结束位置"
              />
            </div>
          </div>
        </div>

        <!-- 写入数据 -->
        <div v-if="argvs.operation === 'write'" class="column q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <VariableInput
              :model-value="argvs.buffer"
              @update:model-value="(val) => updateArgvs('buffer', val)"
              label="Buffer"
              icon="memory"
              class="col"
            />
            <VariableInput
              :model-value="argvs.string"
              @update:model-value="(val) => updateArgvs('string', val)"
              label="要写入的字符串"
              icon="edit"
              class="col"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <NumberInput
                :model-value="argvs.offset"
                @update:model-value="(val) => updateArgvs('offset', val)"
                label="偏移量"
              />
            </div>
            <div class="col-4">
              <NumberInput
                :model-value="argvs.length"
                @update:model-value="(val) => updateArgvs('length', val)"
                label="长度"
              />
            </div>
            <div class="col-4">
              <q-select
                :model-value="argvs.encoding"
                @update:model-value="(val) => updateArgvs('encoding', val)"
                :options="encodings"
                label="编码"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
          </div>
        </div>

        <!-- 填充数据 -->
        <div v-if="argvs.operation === 'fill'" class="column q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <VariableInput
              :model-value="argvs.buffer"
              @update:model-value="(val) => updateArgvs('buffer', val)"
              label="Buffer"
              icon="memory"
              class="col"
            />
            <VariableInput
              :model-value="argvs.value"
              @update:model-value="(val) => updateArgvs('value', val)"
              label="填充值"
              icon="format_color_fill"
              class="col"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <NumberInput
                :model-value="argvs.offset"
                @update:model-value="(val) => updateArgvs('offset', val)"
                label="起始位置"
              />
            </div>
            <div class="col-12 col-sm-4">
              <NumberInput
                :model-value="argvs.end"
                @update:model-value="(val) => updateArgvs('end', val)"
                label="结束位置"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                :model-value="argvs.encoding"
                @update:model-value="(val) => updateArgvs('encoding', val)"
                :options="encodings"
                label="编码"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
          </div>
        </div>

        <!-- 复制数据 -->
        <div v-if="argvs.operation === 'copy'" class="column q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <VariableInput
              :model-value="argvs.source"
              @update:model-value="(val) => updateArgvs('source', val)"
              label="源Buffer"
              icon="content_copy"
              class="col"
            />
            <VariableInput
              :model-value="argvs.target"
              @update:model-value="(val) => updateArgvs('target', val)"
              label="目标Buffer"
              icon="save"
              class="col"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <NumberInput
                :model-value="argvs.targetStart"
                @update:model-value="(val) => updateArgvs('targetStart', val)"
                label="目标起始位置"
              />
            </div>
            <div class="col-12 col-sm-4">
              <NumberInput
                :model-value="argvs.sourceStart"
                @update:model-value="(val) => updateArgvs('sourceStart', val)"
                label="源起始位置"
              />
            </div>
            <div class="col-12 col-sm-4">
              <NumberInput
                :model-value="argvs.sourceEnd"
                @update:model-value="(val) => updateArgvs('sourceEnd', val)"
                label="源结束位置"
              />
            </div>
          </div>
        </div>

        <!-- 比较数据 -->
        <div
          v-if="argvs.operation === 'compare'"
          class="column q-col-gutter-sm"
        >
          <div class="row q-col-gutter-sm">
            <VariableInput
              :model-value="argvs.buf1"
              @update:model-value="(val) => updateArgvs('buf1', val)"
              label="Buffer 1"
              icon="memory"
              class="col"
            />
            <VariableInput
              :model-value="argvs.buf2"
              @update:model-value="(val) => updateArgvs('buf2', val)"
              label="Buffer 2"
              icon="memory"
              class="col"
            />
          </div>
        </div>

        <!-- 连接 Buffer -->
        <div v-if="argvs.operation === 'concat'" class="column q-gutter-sm">
          <ArrayEditor
            :model-value="argvs.buffers"
            @update:model-value="(val) => updateArgvs('buffers', val)"
            label="Buffer"
            icon="memory"
          />
          <NumberInput
            :model-value="argvs.totalLength"
            @update:model-value="(val) => updateArgvs('totalLength', val)"
            label="总长度（可选）"
          />
        </div>

        <!-- 查找数据 -->
        <div
          v-if="argvs.operation === 'indexOf'"
          class="column q-col-gutter-sm"
        >
          <div class="row q-col-gutter-sm">
            <VariableInput
              :model-value="argvs.buffer"
              @update:model-value="(val) => updateArgvs('buffer', val)"
              label="Buffer"
              icon="memory"
              class="col"
            />
            <VariableInput
              :model-value="argvs.value"
              @update:model-value="(val) => updateArgvs('value', val)"
              label="要查找的值"
              icon="search"
              class="col"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <NumberInput
                :model-value="argvs.byteOffset"
                @update:model-value="(val) => updateArgvs('byteOffset', val)"
                label="起始位置"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                :model-value="argvs.encoding"
                @update:model-value="(val) => updateArgvs('encoding', val)"
                :options="encodings"
                label="编码"
                dense
                filled
                emit-value
                map-options
                options-dense
              />
            </div>
          </div>
        </div>

        <!-- 切片数据 -->
        <div v-if="argvs.operation === 'slice'" class="row q-col-gutter-sm">
          <VariableInput
            :model-value="argvs.buffer"
            @update:model-value="(val) => updateArgvs('buffer', val)"
            label="Buffer"
            icon="memory"
            class="col"
          />
          <NumberInput
            :model-value="argvs.start"
            @update:model-value="(val) => updateArgvs('start', val)"
            label="起始位置"
            class="col"
          />
          <NumberInput
            :model-value="argvs.end"
            @update:model-value="(val) => updateArgvs('end', val)"
            label="结束位置"
            class="col"
          />
        </div>

        <!-- 交换字节序 -->
        <div v-if="argvs.operation === 'swap'" class="row q-col-gutter-sm">
          <VariableInput
            :model-value="argvs.buffer"
            @update:model-value="(val) => updateArgvs('buffer', val)"
            label="Buffer"
            class="col"
            icon="memory"
          />
          <q-select
            :model-value="argvs.size"
            @update:model-value="(val) => updateArgvs('size', val)"
            :options="swapSizes"
            label="字节大小"
            class="col-3"
            dense
            filled
            emit-value
            map-options
            options-dense
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyArgv, parseFunction } from "js/composer/formatString";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import OperationCard from "components/composer/common/OperationCard.vue";

export default defineComponent({
  name: "BufferEditor",
  components: {
    VariableInput,
    NumberInput,
    ArrayEditor,
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
        { value: "from", label: "创建Buffer", icon: "add_box" },
        { value: "toString", label: "转换字符串", icon: "text_fields" },
        { value: "write", label: "写入数据", icon: "edit" },
        { value: "fill", label: "填充数据", icon: "format_color_fill" },
        { value: "copy", label: "复制数据", icon: "content_copy" },
        { value: "compare", label: "比较数据", icon: "compare" },
        { value: "concat", label: "连接Buffer", icon: "merge" },
        { value: "indexOf", label: "查找数据", icon: "search" },
        { value: "slice", label: "切片数据", icon: "content_cut" },
        { value: "swap", label: "交换字节序", icon: "swap_horiz" },
      ],
      encodings: [
        { label: "UTF-8", value: "utf8" },
        { label: "UTF-16LE", value: "utf16le" },
        { label: "Latin1", value: "latin1" },
        { label: "Base64", value: "base64" },
        { label: "Hex", value: "hex" },
        { label: "ASCII", value: "ascii" },
        { label: "Binary", value: "binary" },
        { label: "UCS-2", value: "ucs2" },
      ],
      swapSizes: [
        { label: "16位", value: 16 },
        { label: "32位", value: 32 },
        { label: "64位", value: 64 },
      ],
      defaultArgvs: {
        operation: "from",
        data: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        buffer: {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
        encoding: "utf8",
        start: 0,
        end: 0,
        string: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        offset: 0,
        length: 0,
        value: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        source: {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
        target: {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
        targetStart: 0,
        sourceStart: 0,
        sourceEnd: 0,
        buf1: {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
        buf2: {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
        buffers: [
          {
            value: "",
            isString: false,
            __varInputVal__: true,
          },
        ],
        totalLength: undefined,
        byteOffset: 0,
        size: 16,
      },
    };
  },
  computed: {
    argvs: {
      get() {
        return (
          this.modelValue.argvs ||
          this.parseCodeToArgvs(this.modelValue.code) || {
            ...this.defaultArgvs,
          }
        );
      },
      set(value) {
        this.updateModelValue(value);
      },
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      switch (argvs.operation) {
        case "from":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.data
          )}, "${argvs.encoding}")`;

        case "toString":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, "${argvs.encoding}", ${argvs.start}, ${argvs.end})`;

        case "write":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, ${stringifyArgv(argvs.string)}, ${argvs.offset}, ${
            argvs.length
          }, "${argvs.encoding}")`;

        case "fill":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, ${stringifyArgv(argvs.value)}, ${argvs.offset}, ${argvs.end}, "${
            argvs.encoding
          }")`;

        case "copy":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.source
          )}, ${stringifyArgv(argvs.target)}, ${argvs.targetStart}, ${
            argvs.sourceStart
          }, ${argvs.sourceEnd})`;

        case "compare":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buf1
          )}, ${stringifyArgv(argvs.buf2)})`;

        case "concat":
          const buffersStr = argvs.buffers
            .map((buf) => stringifyArgv(buf))
            .join(", ");
          return `${this.modelValue.value}.${argvs.operation}([${buffersStr}]${
            argvs.totalLength !== undefined ? `, ${argvs.totalLength}` : ""
          })`;

        case "indexOf":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, ${stringifyArgv(argvs.value)}, ${argvs.byteOffset}, "${
            argvs.encoding
          }")`;

        case "slice":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, ${argvs.start}, ${argvs.end})`;

        case "swap":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.buffer
          )}, ${argvs.size})`;

        default:
          return `${this.modelValue.value}.${argvs.operation}()`;
      }
    },
    parseCodeToArgvs(code) {
      if (!code) return null;

      try {
        // 定义需要使用variable格式的路径
        const variableFormatPaths = ["arg0", "arg0[*]"];

        const subFunc = code.match(/buffer\.(\w+)\((.*)\)/);

        switch (subFunc[1]) {
          case "write":
          case "fill":
          case "copy":
          case "compare":
          case "indexOf":
            variableFormatPaths.push("arg1");
            break;
        }

        // 使用 parseFunction 解析代码
        const result = parseFunction(code, { variableFormatPaths });
        if (!result) return this.defaultArgvs;

        const operation = result.name.split(".").pop();
        const args = result.argvs;

        const newArgvs = {
          ...this.defaultArgvs,
          operation,
        };

        switch (operation) {
          case "from":
            newArgvs.data = args[0];
            newArgvs.encoding = args[1]?.value || "utf8";
            break;

          case "toString":
            newArgvs.buffer = args[0];
            newArgvs.encoding = args[1]?.value || "utf8";
            newArgvs.start = args[2] ?? 0;
            newArgvs.end = args[3] ?? 0;
            break;

          case "write":
            newArgvs.buffer = args[0];
            newArgvs.string = args[1];
            newArgvs.offset = args[2] ?? 0;
            newArgvs.length = args[3] ?? 0;
            newArgvs.encoding = args[4]?.value || "utf8";
            break;

          case "fill":
            newArgvs.buffer = args[0];
            newArgvs.value = args[1];
            newArgvs.offset = args[2] ?? 0;
            newArgvs.end = args[3] ?? 0;
            newArgvs.encoding = args[4]?.value || "utf8";
            break;

          case "copy":
            newArgvs.source = args[0];
            newArgvs.target = args[1];
            newArgvs.targetStart = args[2] ?? 0;
            newArgvs.sourceStart = args[3] ?? 0;
            newArgvs.sourceEnd = args[4] ?? 0;
            break;

          case "compare":
            newArgvs.buf1 = args[0];
            newArgvs.buf2 = args[1];
            break;

          case "concat":
            if (Array.isArray(args[0])) {
              newArgvs.buffers = args[0];
            }
            newArgvs.totalLength = args[1];
            break;

          case "indexOf":
            newArgvs.buffer = args[0];
            newArgvs.value = args[1];
            newArgvs.byteOffset = args[2] ?? 0;
            newArgvs.encoding = args[3]?.value || "utf8";
            break;

          case "slice":
            newArgvs.buffer = args[0];
            newArgvs.start = args[1] ?? 0;
            newArgvs.end = args[2] ?? 0;
            break;

          case "swap":
            newArgvs.buffer = args[0];
            newArgvs.size = args[1] ?? 16;
            break;
        }

        return newArgvs;
      } catch (e) {
        console.error("解析Buffer参数失败:", e);
        return this.defaultArgvs;
      }
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
      return op;
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
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.defaultArgvs);
    }
  },
});
</script>

<style scoped>
.buffer-editor {
  display: flex;
  flex-direction: column;
}

.options-container {
  min-height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
