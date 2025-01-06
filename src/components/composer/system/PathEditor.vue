<template>
  <div class="path-editor">
    <!-- 操作类型选择 -->
    <div class="operation-cards">
      <div
        v-for="op in operations"
        :key="op.name"
        :class="['operation-card', { active: argvs.operation === op.name }]"
        @click="updateArgvs('operation', op.name)"
        :data-value="op.name"
      >
        <q-icon
          :name="op.icon"
          size="16px"
          :color="argvs.operation === op.name ? 'primary' : 'grey'"
        />
        <div class="text-caption">{{ op.label }}</div>
      </div>
    </div>

    <!-- 操作配置 -->
    <div class="operation-options q-mt-sm">
      <!-- 通用路径输入 -->
      <div class="options-container">
        <template
          v-if="
            [
              'normalize',
              'parse',
              'dirname',
              'basename',
              'extname',
              'isAbsolute',
            ].includes(argvs.operation)
          "
        >
          <VariableInput
            :model-value="argvs.path"
            @update:model-value="(val) => updateArgvs('path', val)"
            label="路径"
            icon="folder"
          />
          <!-- basename 的扩展名参数 -->
          <div v-if="argvs.operation === 'basename'" class="q-mt-sm">
            <VariableInput
              :model-value="argvs.ext"
              @update:model-value="(val) => updateArgvs('ext', val)"
              label="要移除的扩展名（可选）"
              icon="extension"
            />
          </div>
        </template>

        <!-- join 和 resolve 的多路径输入 -->
        <template v-if="['join', 'resolve'].includes(argvs.operation)">
          <div
            v-for="(path, index) in argvs.paths"
            :key="index"
            class="q-mb-sm"
          >
            <div class="row items-center q-gutter-sm">
              <div class="col">
                <VariableInput
                  :model-value="path"
                  @update:model-value="(val) => updatePathAtIndex(index, val)"
                  :label="'路径片段 ' + (index + 1)"
                  icon="folder"
                />
              </div>
              <q-btn
                v-if="index === argvs.paths.length - 1"
                flat
                round
                dense
                icon="add"
                size="sm"
                color="primary"
                @click="addPath"
              />
              <q-btn
                v-if="argvs.paths.length > 1"
                flat
                round
                dense
                icon="remove"
                color="negative"
                size="sm"
                @click="removePath(index)"
              />
            </div>
          </div>
        </template>

        <!-- relative 的起始和目标路径 -->
        <template v-if="argvs.operation === 'relative'">
          <VariableInput
            :model-value="argvs.from"
            @update:model-value="(val) => updateArgvs('from', val)"
            label="起始路径"
            icon="folder"
          />
          <div class="q-mt-sm">
            <VariableInput
              :model-value="argvs.to"
              @update:model-value="(val) => updateArgvs('to', val)"
              label="目标路径"
              icon="folder"
            />
          </div>
        </template>

        <!-- format 的路径对象 -->
        <template v-if="argvs.operation === 'format'">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.pathObject.root"
                @update:model-value="(val) => updatePathObject('root', val)"
                label="根路径"
                icon="folder"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.pathObject.dir"
                @update:model-value="(val) => updatePathObject('dir', val)"
                label="目录"
                icon="folder"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.pathObject.base"
                @update:model-value="(val) => updatePathObject('base', val)"
                label="基本名称"
                icon="description"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.pathObject.name"
                @update:model-value="(val) => updatePathObject('name', val)"
                label="文件名"
                icon="insert_drive_file"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.pathObject.ext"
                @update:model-value="(val) => updatePathObject('ext', val)"
                label="扩展名"
                icon="extension"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyArgv, parseFunction } from "js/composer/formatString";
import VariableInput from "components/composer/common/VariableInput.vue";

export default defineComponent({
  name: "PathEditor",
  components: {
    VariableInput,
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
        { name: "normalize", label: "规范化路径", icon: "straighten" },
        { name: "join", label: "连接路径", icon: "add_link" },
        { name: "parse", label: "解析路径", icon: "account_tree" },
        { name: "dirname", label: "获取目录名", icon: "folder" },
        { name: "basename", label: "获取文件名", icon: "description" },
        { name: "extname", label: "获取扩展名", icon: "extension" },
        { name: "isAbsolute", label: "判断绝对路径", icon: "check_circle" },
        { name: "relative", label: "计算相对路径", icon: "compare_arrows" },
        { name: "resolve", label: "解析绝对路径", icon: "assistant_direction" },
        { name: "format", label: "格式化路径", icon: "format_shapes" },
      ],
      defaultArgvs: {
        operation: "normalize",
        path: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        paths: [
          {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
        ],
        from: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        to: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        ext: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        pathObject: {
          root: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          dir: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          base: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          name: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          ext: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
        },
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
    pointerStyle() {
      const activeIndex = this.operations.findIndex(
        (op) => op.name === this.argvs.operation
      );
      if (activeIndex === -1) return {};

      const cardWidth = 80;
      const gap = 4;
      const pointerWidth = 12;
      const leftOffset =
        (cardWidth + gap) * activeIndex + cardWidth / 2 - pointerWidth / 2;

      return {
        left: `${leftOffset}px`,
      };
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      switch (argvs.operation) {
        case "normalize":
        case "parse":
        case "dirname":
        case "extname":
        case "isAbsolute":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.path
          )})`;

        case "basename":
          if (argvs.ext && argvs.ext.value) {
            return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
              argvs.path
            )}, ${stringifyArgv(argvs.ext)})`;
          }
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.path
          )})`;

        case "join":
        case "resolve":
          return `${this.modelValue.value}.${argvs.operation}(${argvs.paths
            .map((p) => stringifyArgv(p))
            .join(", ")})`;

        case "relative":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.from
          )}, ${stringifyArgv(argvs.to)})`;

        case "format":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.pathObject
          )})`;

        default:
          return `${this.modelValue.value}.${argvs.operation}()`;
      }
    },
    parseCodeToArgvs(code) {
      if (!code) return null;

      try {
        // 定义需要使用variable格式的路径
        const variableFormatPaths = [
          "arg*", // 所有参数
          "arg*.**", // 所有参数的所有嵌套属性
        ];

        // 使用 parseFunction 解析代码
        const result = parseFunction(code, { variableFormatPaths });
        if (!result) return this.defaultArgvs;

        const operation = result.name.split(".").pop();
        const [firstArg, secondArg] = result.argvs;

        const newArgvs = {
          ...this.defaultArgvs,
          operation,
        };

        switch (operation) {
          case "normalize":
          case "parse":
          case "dirname":
          case "extname":
          case "isAbsolute":
            newArgvs.path = firstArg;
            break;

          case "basename":
            newArgvs.path = firstArg;
            if (secondArg) {
              newArgvs.ext = secondArg;
            }
            break;

          case "join":
          case "resolve":
            newArgvs.paths = result.argvs.map((arg) => arg);
            break;

          case "relative":
            newArgvs.from = firstArg;
            newArgvs.to = secondArg;
            break;

          case "format":
            newArgvs.pathObject = firstArg;
            break;
        }

        return newArgvs;
      } catch (e) {
        console.error("解析Path参数失败:", e);
        return this.defaultArgvs;
      }
    },
    updateArgvs(key, value) {
      this.argvs = {
        ...this.argvs,
        [key]: value,
      };
    },
    updatePathAtIndex(index, value) {
      const newPaths = [...this.argvs.paths];
      newPaths[index] = value;
      this.updateArgvs("paths", newPaths);
    },
    updatePathObject(key, value) {
      this.updateArgvs("pathObject", {
        ...this.argvs.pathObject,
        [key]: value,
      });
    },
    addPath() {
      this.updateArgvs("paths", [
        ...this.argvs.paths,
        {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
      ]);
    },
    removePath(index) {
      const newPaths = [...this.argvs.paths];
      newPaths.splice(index, 1);
      this.updateArgvs("paths", newPaths);
    },
    getSummary(argvs) {
      return this.operations.find((op) => op.name === argvs.operation)?.label;
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
  watch: {
    "argvs.operation": {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          document
            .querySelector(`.operation-card[data-value="${newVal}"]`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
        });
      },
    },
  },
});
</script>

<style scoped>
.path-editor {
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
