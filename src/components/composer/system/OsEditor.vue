<template>
  <div class="os-editor">
    <!-- 操作类型选择 -->
    <OperationCard
      :model-value="argvs.operation"
      @update:model-value="(val) => updateArgvs('operation', val)"
      :options="operations"
    />

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
import { stringifyArgv, parseFunction } from "js/composer/formatString";
import OperationCard from "components/composer/common/OperationCard.vue";
export default defineComponent({
  name: "OsEditor",
  components: {
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
        { value: "arch", label: "系统架构", icon: "memory" },
        { value: "cpus", label: "CPU信息", icon: "developer_board" },
        { value: "memory", label: "内存信息", icon: "storage" },
        { value: "network", label: "网络信息", icon: "wifi" },
        { value: "platform", label: "平台信息", icon: "computer" },
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

        this.updateModelValue(newValue);
      },
    },
    hasOptions() {
      return ["cpus", "memory", "network", "platform"].includes(
        this.argvs.operation
      );
    },
    pointerStyle() {
      const activeIndex = this.operations.findIndex(
        (op) => op.value === this.argvs.operation
      );
      if (activeIndex === -1) return {};

      // 获取操作卡片容器的宽度
      const container = document.querySelector(".operation-cards");
      if (!container) return {};

      const containerWidth = container.offsetWidth;
      const cardCount = this.operations.length;

      // 计算每个卡片的位置
      const cardWidth = 100; // 卡片宽度
      const pointerWidth = 12; // 尖角宽度

      // 计算卡片之间的间距
      const totalGapWidth = containerWidth - cardWidth * cardCount;
      const gapWidth = totalGapWidth / (cardCount - 1);

      // 计算当前选中卡片的中心位置
      const leftOffset =
        (cardWidth + gapWidth) * activeIndex + cardWidth / 2 - pointerWidth / 2;

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

      return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
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
        const [params = {}] = result.argvs;

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
    getSummary(argvs) {
      return this.operations.find((op) => op.value === argvs.operation).label;
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
.os-editor {
  display: flex;
  flex-direction: column;
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

/* 覆盖command-composer的样式 */
.command-composer .operation-cards {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.command-composer .operation-card {
  width: 100px;
}
</style>
