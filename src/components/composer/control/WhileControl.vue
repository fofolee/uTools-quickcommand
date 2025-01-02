<template>
  <div class="loop-control-wrapper">
    <div class="loop-control">
      <!-- 类型标签 -->
      <div class="control-type-label">
        <template v-if="type === 'while'">满足</template>
        <template v-else-if="type === 'continue'">继续</template>
        <template v-else-if="type === 'break'">终止</template>
        <template v-else>结束</template>
      </div>

      <!-- 循环条件区域 -->
      <div class="loop-settings">
        <template v-if="type === 'while'">
          <ControlInput
            v-model="condition"
            label="条件"
            placeholder="表达式"
            class="condition-input"
          />
        </template>
      </div>

      <!-- 只在循环开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'while'"
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
                commandType: 'continue',
              })
            "
          >
            <q-item-section>
              <q-item-label>添加继续循环</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="
              $emit('addBranch', {
                chainId: command.chainId,
                commandType: 'break',
              })
            "
          >
            <q-item-section>
              <q-item-label>添加终止循环</q-item-label>
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
  name: "WhileControl",
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
        ["while", "continue", "break", "end"].includes(value),
    },
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      condition: "true",
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
        case "while":
          return `while(${this.condition}){`;
        case "continue":
          return "continue;";
        case "break":
          return "break;";
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
    condition() {
      this.updateValue();
    },
  },
  methods: {
    updateValue() {
      this.$emit("update:modelValue", this.generatedCode);
    },
    parseCodeString(val) {
      try {
        if (this.type === "while") {
          const match = val.match(/^while\((.*)\){$/);
          if (match) {
            this.condition = match[1];
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
.loop-control-wrapper {
  width: 100%;
  display: flex;
}

.loop-control {
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

.loop-settings {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.condition-input {
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
