<template>
  <div class="control-command-wrapper">
    <div class="control-command">
      <!-- 类型标签 -->
      <div class="control-type-label drag-handle">
        {{ currentFunction?.label || modelValue.commandType }}
      </div>

      <!-- 输入区域 -->
      <div v-if="currentFunction?.config" class="control-settings">
        <ParamInput
          :configs="currentFunction.config"
          :values="values"
          @update="handleInputUpdate"
        />
      </div>

      <!-- 操作按钮 -->
      <q-btn-dropdown
        v-if="showBranchButton"
        flat
        dense
        dropdown-icon="add"
        size="sm"
        no-icon-animation
        class="control-btn"
      >
        <q-list dense>
          <q-item
            v-for="func in branchOptions"
            :key="func.value"
            v-close-popup
            clickable
            @click="addBranch(func.value)"
            class="row items-center no-wrap q-py-none"
          >
            <q-icon :name="func.icon" class="q-mr-md" />
            <q-item-label>{{ func.label }}</q-item-label>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ParamInput from "components/composer/param/ParamInput.vue";

export default defineComponent({
  name: "ControlCommand",
  components: {
    ParamInput,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      defaultArgvs: {},
    };
  },
  computed: {
    currentFunction() {
      return this.modelValue.subCommands?.find(
        (f) => f.value === this.modelValue.commandType
      );
    },
    values() {
      if (!this.currentFunction?.config) return [];
      return this.currentFunction.config.map(
        (input) => this.argvs[input.name] || ""
      );
    },
    showBranchButton() {
      return (
        this.modelValue.subCommands?.length > 2 &&
        this.modelValue.subCommands?.[0]?.value === this.modelValue.commandType
      );
    },
    branchOptions() {
      return this.modelValue.subCommands?.slice(1, -1);
    },
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
  },
  methods: {
    handleInputUpdate(index, value) {
      const input = this.currentFunction.config[index];
      this.updateArgvs(input.name, value);
    },
    updateArgvs(key, value) {
      const argvs = {
        ...this.argvs,
        [key]: value,
      };
      this.updateModelValue(argvs);
    },
    addBranch(type) {
      this.$emit("addBranch", {
        chainId: this.modelValue.chainId,
        commandType: type,
        value: this.modelValue.value,
      });
      this.updateModelValue(this.argvs || {});
    },
    generateCode(argvs) {
      if (!this.currentFunction?.codeTemplate) return "";

      let code = this.currentFunction.codeTemplate;

      const variablePattern = /\${(\w+)}/g;
      code = code.replace(variablePattern, (_, key) => {
        return argvs[key] || "";
      });

      return code;
    },

    updateModelValue(argvs) {
      const code = this.generateCode(argvs);

      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code,
      });
    },
  },
  created() {
    // 初始化默认值
    if (this.currentFunction?.config) {
      this.currentFunction.config.forEach((config) => {
        this.defaultArgvs[config.name] = config.defaultValue || "";
      });
    }
  },
  mounted() {
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.control-command-wrapper {
  width: 100%;
  display: flex;
}

.control-command {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-type-label {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
  user-select: none;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.control-type-label:hover {
  color: var(--q-primary) !important;
  transition: all 0.3s ease;
}

.control-settings {
  display: flex;
  flex: 1;
  min-width: 0;
  margin-right: auto;
}

/* ParamInput 容器样式 */
.control-settings :deep(.param-grid) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
  width: 100%;
  --grid-gap: 8px;
}

/* 输入项容器样式 */
.control-settings :deep(.grid-item) {
  min-width: 50px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 输入框样式 */
.control-settings :deep(.grid-item > *) {
  flex: 1;
  min-width: 0;
}

.control-btn {
  opacity: 0.7;
  flex-shrink: 0;
  margin-left: auto;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 暗色模式适配 */
.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
