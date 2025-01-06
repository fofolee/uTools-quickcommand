<template>
  <div class="try-catch-wrapper">
    <div class="try-catch">
      <!-- 类型标签 -->
      <div class="control-type-label">
        <template v-if="type === 'try'">尝试</template>
        <template v-else-if="type === 'catch'">捕获</template>
        <template v-else-if="type === 'finally'">最后</template>
        <template v-else>结束</template>
      </div>

      <!-- 错误变量输入区域 -->
      <div class="try-catch-settings">
        <template v-if="type === 'catch'">
          <ControlInput
            :model-value="argvs.errorVar"
            @update:model-value="updateArgvs('errorVar', $event)"
            label="错误"
            placeholder="错误变量名"
            class="error-input"
          />
        </template>
      </div>

      <!-- 只在try开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'try'"
        flat
        dense
        dropdown-icon="add"
        no-icon-animation
        size="sm"
        class="control-btn"
      >
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="
              $emit('addBranch', {
                chainId: this.modelValue.chainId,
                commandType: 'catch',
                value: this.modelValue.value,
              })
            "
          >
            <q-item-section>
              <q-item-label>添加捕获分支</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="
              $emit('addBranch', {
                chainId: this.modelValue.chainId,
                commandType: 'finally',
                value: this.modelValue.value,
              })
            "
          >
            <q-item-section>
              <q-item-label>添加最后分支</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ControlInput from "components/composer/common/ControlInput.vue";

export default defineComponent({
  name: "TryCatchControl",
  components: {
    ControlInput,
  },
  inheritAttrs: false,
  props: {
    modelValue: Object,
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      defaultArgvs: {
        errorVar: "error",
      },
    };
  },
  computed: {
    type() {
      return this.modelValue.commandType;
    },
    argvs() {
      return (
        this.modelValue.argvs || this.parseCodeToArgvs(this.modelValue.code)
      );
    },
  },
  methods: {
    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };
      this.updateModelValue(argvs);
    },
    generateCode(argvs = this.argvs) {
      switch (this.type) {
        case "try":
          return "try{";
        case "catch":
          return `}catch(${argvs.errorVar || "error"}){`;
        case "finally":
          return "}finally{";
        case "end":
          return "}";
        default:
          return "";
      }
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      if (this.type === "catch") {
        const match = code.match(/^\}catch\((\w+)\)\{$/);
        if (match) {
          argvs.errorVar = match[1];
        }
      }
      return argvs;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
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
.try-catch-wrapper {
  width: 100%;
  display: flex;
}

.try-catch {
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
}

.control-btn {
  width: 21px;
  height: 21px;
  opacity: 0.7;
  flex-shrink: 0;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.try-catch-settings {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.error-input {
  flex: 1;
  min-width: 0;
}

/* 暗色模式适配 */
.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
