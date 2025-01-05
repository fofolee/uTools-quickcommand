<template>
  <div class="os-editor">
    <!-- 操作类型选择 -->
    <div class="operation-cards">
      <div
        v-for="op in operations"
        :key="op.name"
        :class="['operation-card', { active: argvs.operation === op.name }]"
        @click="updateArgvs('operation', op.name)"
      >
        <div
          class="row items-center justify-center q-gutter-x-xs q-px-sm q-py-xs"
        >
          <q-icon
            :name="op.icon"
            size="16px"
            :color="argvs.operation === op.name ? 'primary' : 'grey'"
          />
          <div class="text-caption">{{ op.label }}</div>
        </div>
      </div>
    </div>

    <!-- 操作配置 -->
    <div class="operation-options q-mt-sm" v-if="hasOptions">
      <div class="bubble-pointer" :style="pointerStyle"></div>
      <!-- CPU信息配置 -->
      <div v-if="argvs.operation === 'cpus'" class="options-container">
        <div class="row items-center q-gutter-x-sm">
          <div
            v-for="opt in formatOptions"
            :key="opt.value"
            :class="['custom-btn', { active: argvs.format === opt.value }]"
            @click="updateArgvs('format', opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>

      <!-- 内存信息配置 -->
      <div v-if="argvs.operation === 'memory'" class="options-container">
        <div class="row items-center q-gutter-x-sm">
          <div
            v-for="opt in memoryOptions"
            :key="opt.value"
            :class="['custom-btn', { active: argvs.type === opt.value }]"
            @click="updateArgvs('type', opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>

      <!-- 网络信息配置 -->
      <div v-if="argvs.operation === 'network'" class="options-container">
        <div class="row items-center q-gutter-x-sm">
          <div
            v-for="opt in networkOptions"
            :key="opt.value"
            :class="['custom-btn', { active: argvs.type === opt.value }]"
            @click="updateArgvs('type', opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
        <div class="q-mt-xs" v-if="argvs.type === 'networkInterfaces'">
          <q-checkbox
            :model-value="argvs.internal"
            @update:model-value="(val) => updateArgvs('internal', val)"
            label="包含内部接口"
            dense
            class="text-caption"
          />
        </div>
      </div>

      <!-- 平台信息配置 -->
      <div v-if="argvs.operation === 'platform'" class="options-container">
        <div class="row items-center q-gutter-x-sm wrap">
          <div
            v-for="opt in platformOptions"
            :key="opt.value"
            :class="['custom-btn', { active: argvs.type === opt.value }]"
            @click="updateArgvs('type', opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyObject, parseFunction } from "js/composer/formatString";

export default defineComponent({
  name: "OsEditor",
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
        { name: "arch", label: "系统架构", icon: "memory" },
        { name: "cpus", label: "CPU信息", icon: "developer_board" },
        { name: "memory", label: "内存信息", icon: "storage" },
        { name: "network", label: "网络信息", icon: "wifi" },
        { name: "platform", label: "平台信息", icon: "computer" },
      ],
      formatOptions: [
        { label: "完整信息", value: "full" },
        { label: "仅型号和速度", value: "simple" },
      ],
      memoryOptions: [
        { label: "总内存", value: "totalmem" },
        { label: "空闲内存", value: "freemem" },
      ],
      networkOptions: [
        { label: "主机名", value: "hostname" },
        { label: "网络接口", value: "networkInterfaces" },
      ],
      platformOptions: [
        { label: "操作系统名称", value: "platform" },
        { label: "操作系统类型", value: "type" },
        { label: "操作系统版本", value: "release" },
        { label: "操作系统架构", value: "arch" },
        { label: "CPU字节序", value: "endianness" },
        { label: "系统临时目录", value: "tmpdir" },
        { label: "主目录", value: "homedir" },
        { label: "系统正常运行时间", value: "uptime" },
        { label: "用户信息", value: "userInfo" },
      ],
      defaultArgvs: {
        operation: "arch",
        format: "full",
        type: "platform",
        internal: false,
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
        // 根据操作类型重置相关参数
        const newValue = { ...value };
        if (value.operation !== this.argvs.operation) {
          switch (value.operation) {
            case "cpus":
              newValue.format = "full";
              delete newValue.type;
              delete newValue.internal;
              break;
            case "memory":
              newValue.type = "totalmem";
              delete newValue.format;
              delete newValue.internal;
              break;
            case "network":
              newValue.type = "hostname";
              delete newValue.format;
              break;
            case "platform":
              newValue.type = "platform";
              delete newValue.format;
              delete newValue.internal;
              break;
            default:
              delete newValue.format;
              delete newValue.type;
              delete newValue.internal;
          }
        }

        this.$emit("update:modelValue", {
          ...this.modelValue,
          code: this.generateCode(newValue),
          argvs: newValue,
        });
      },
    },
    hasOptions() {
      return ["cpus", "memory", "network", "platform"].includes(
        this.argvs.operation
      );
    },
    pointerStyle() {
      const activeIndex = this.operations.findIndex(
        (op) => op.name === this.argvs.operation
      );
      if (activeIndex === -1) return {};

      // 计算选项卡的宽度和间距
      const cardWidth = 80; // 卡片宽度
      const gap = 4; // 卡片间距
      const pointerWidth = 12; // 尖角宽度

      // 计算尖角的左偏移量：
      // 1. 计算到当前选中卡片的起始位置：(cardWidth + gap) * activeIndex
      // 2. 加上卡片的一半宽度：cardWidth / 2
      // 3. 减去尖角的一半宽度：pointerWidth / 2
      const leftOffset =
        (cardWidth + gap) * activeIndex + cardWidth / 2 - pointerWidth / 2;

      return {
        left: `${leftOffset}px`,
      };
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      const params = {};

      // 根据不同操作类型添加特定参数
      switch (argvs.operation) {
        case "cpus":
          params.format = argvs.format;
          break;
        case "memory":
          params.type = argvs.type;
          break;
        case "network":
          params.type = argvs.type;
          if (argvs.type === "networkInterfaces") {
            params.internal = argvs.internal;
          }
          break;
        case "platform":
          params.type = argvs.type;
          break;
      }

      // 如果没有参数，直接调用函数
      if (Object.keys(params).length === 0) {
        return `${this.modelValue.value}.${argvs.operation}()`;
      }

      return `${this.modelValue.value}.${argvs.operation}(${stringifyObject(
        params
      )})`;
    },
    parseCodeToArgvs(code) {
      if (!code) return null;

      try {
        // 使用 parseFunction 解析代码
        const result = parseFunction(code);
        if (!result) return this.defaultArgvs;

        // 获取操作名称（方法名）
        const operation = result.name.split(".").pop();
        const [params = {}] = result.args;

        return {
          ...this.defaultArgvs,
          operation,
          ...params,
        };
      } catch (e) {
        console.error("解析OS参数失败:", e);
        return this.defaultArgvs;
      }
    },
    updateArgvs(key, value) {
      this.argvs = {
        ...this.argvs,
        [key]: value,
      };
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        code: this.generateCode(this.defaultArgvs),
        argvs: { ...this.defaultArgvs },
      });
    }
  },
});
</script>

<style scoped>
.os-editor {
  display: flex;
  flex-direction: column;
}

.operation-cards {
  display: flex;
  justify-content: flex-start;
  gap: 4px;
}

.operation-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  border-radius: 4px;
  min-width: 80px;
}

.operation-card:hover {
  background: var(--q-primary-opacity-5);
}

.operation-card.active {
  border-color: var(--q-primary);
  background: var(--q-primary-opacity-5);
}

.operation-options {
  position: relative;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px !important;
  z-index: 0;
}

.options-container {
  min-height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bubble-pointer {
  position: absolute;
  top: -6px;
  width: 12px;
  height: 12px;
  background: #f8f8f8;
  transform: rotate(45deg);
  transition: left 0.3s ease;
  z-index: 1;
}

.body--dark .operation-options,
.body--dark .bubble-pointer {
  background: rgba(0, 0, 0, 0.1);
}

.custom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--q-primary);
  background: transparent;
  white-space: nowrap;
}

.custom-btn:hover {
  background: var(--q-primary-opacity-1);
}

.custom-btn.active {
  color: white;
  background: var(--q-primary);
}
</style>
