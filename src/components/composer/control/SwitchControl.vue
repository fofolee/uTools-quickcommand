<template>
  <div class="switch-control-wrapper">
    <div class="switch-control">
      <!-- 类型标签 -->
      <div class="control-type-label">
        <template v-if="type === 'switch'">选择</template>
        <template v-else-if="type === 'case'">匹配</template>
        <template v-else-if="type === 'default'">默认</template>
        <template v-else>结束</template>
      </div>

      <!-- 条件输入区域 -->
      <div class="switch-settings">
        <template v-if="type === 'switch'">
          <ControlInput
            :model-value="argvs.expression"
            @update:model-value="updateArgvs('expression', $event)"
            label="变量"
            placeholder="变量或表达式"
            class="switch-input"
          />
        </template>
        <template v-else-if="type === 'case'">
          <ControlInput
            :model-value="argvs.value"
            @update:model-value="updateArgvs('value', $event)"
            label="值"
            placeholder="匹配值"
            class="switch-input"
          />
        </template>
      </div>

      <!-- 只在switch开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'switch'"
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
                commandType: 'case',
                value: this.modelValue.value,
              })
            "
          >
            <q-item-section>
              <q-item-label>添加匹配分支</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="
              $emit('addBranch', {
                chainId: this.modelValue.chainId,
                commandType: 'default',
                value: this.modelValue.value,
              })
            "
          >
            <q-item-section>
              <q-item-label>添加默认分支</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ControlInput from "../ui/ControlInput.vue";

export default defineComponent({
  name: "SwitchControl",
  components: {
    ControlInput,
  },
  inheritAttrs: false,
  props: {
    modelValue: Object,
  },
  data() {
    return {
      defaultArgvs: {
        expression: "",
        value: "",
      },
    };
  },
  emits: ["update:modelValue", "addBranch"],
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
        case "switch":
          return `switch(${argvs.expression || "value"}){`;
        case "case":
          return `case ${argvs.value}:`;
        case "default":
          return "default:";
        case "end":
          return "}";
      }
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      switch (this.type) {
        case "switch":
          const switchMatch = code.match(/^switch\((.*?)\)\{$/);
          if (switchMatch) {
            argvs.expression = switchMatch[1] === "value" ? "" : switchMatch[1];
          }
          break;
        case "case":
          const caseMatch = code.match(/^case\s+(.*?):$/);
          if (caseMatch) {
            argvs.value = caseMatch[1];
          }
          break;
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
.switch-control-wrapper {
  width: 100%;
  display: flex;
}

.switch-control {
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

.switch-settings {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.switch-input {
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
