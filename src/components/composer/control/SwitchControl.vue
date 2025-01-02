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
            v-model="expression"
            label="变量"
            placeholder="变量或表达式"
            class="switch-input"
          />
        </template>
        <template v-else-if="type === 'case'">
          <ControlInput
            v-model="value"
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
                chainId: command.chainId,
                commandType: 'case',
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
                chainId: command.chainId,
                commandType: 'default',
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
    modelValue: String,
    command: Object,
    type: {
      type: String,
      required: true,
      validator: (value) =>
        ["switch", "case", "default", "end"].includes(value),
    },
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      expression: "",
      value: "",
    };
  },
  created() {
    if (!this.modelValue) {
      this.updateValue();
    }
  },
  computed: {
    generatedCode() {
      switch (this.type) {
        case "switch":
          return `switch(${this.expression || "value"}){`;
        case "case":
          return `case ${this.value}:`;
        case "default":
          return "default:";
        case "end":
          return "}";
        default:
          return "";
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.parseCodeString(val);
        }
      },
    },
    expression() {
      this.updateValue();
    },
    value() {
      this.updateValue();
    },
  },
  methods: {
    updateValue() {
      this.$emit("update:modelValue", this.generatedCode);
    },
    parseCodeString(val) {
      try {
        if (this.type === "switch") {
          const match = val.match(/^switch\((.*)\){$/);
          if (match) {
            this.expression = match[1];
          }
        } else if (this.type === "case") {
          const match = val.match(/^case\s+(.*):$/);
          if (match) {
            this.value = match[1];
          }
        }
      } catch (e) {
        console.error("Failed to parse code string:", e);
      }
    },
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
