<template>
  <div class="loop-control-wrapper" v-bind="$attrs">
    <div class="loop-control row">
      <!-- 类型标签和按钮区域 -->
      <div class="control-type-label">
        <template v-if="type === 'loop'">循环</template>
        <template v-else-if="type === 'continue'">继续循环</template>
        <template v-else-if="type === 'break'">终止循环</template>
        <template v-else>结束循环</template>
      </div>

      <!-- 只在循环开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'loop'"
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

      <!-- 循环设置区域 -->
      <div v-if="type === 'loop'" class="loop-settings">
        <q-input
          dense
          borderless
          v-model="indexVar"
          :is-variable="true"
          class="loop-input"
        >
          <template v-slot:prepend>
            <q-badge class="loop-input-prepend">变量</q-badge>
          </template>
        </q-input>
        <q-input dense borderless v-model="startValue" class="loop-input">
          <template v-slot:prepend>
            <q-badge class="loop-input-prepend">从</q-badge>
          </template>
        </q-input>
        <q-input dense borderless v-model="endValue" class="loop-input">
          <template v-slot:prepend>
            <q-badge class="loop-input-prepend">到</q-badge>
          </template>
        </q-input>
        <q-input dense borderless v-model="stepValue" class="loop-input">
          <template v-slot:prepend>
            <q-badge class="loop-input-prepend">步进</q-badge>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoopControl",
  inheritAttrs: false,
  props: {
    modelValue: String,
    command: Object,
    type: {
      type: String,
      required: true,
      validator: (value) =>
        ["loop", "continue", "break", "end"].includes(value),
    },
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      indexVar: "i",
      startValue: 0,
      endValue: 10,
      stepValue: 1,
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
        case "loop":
          const index = this.indexVar || "i";
          const start = this.startValue || 0;
          const end = this.endValue || 10;
          const step = this.stepValue || 1;
          return `for(let ${index}=${start};${index}<${end};${index}+=${step}){`;
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
    indexVar() {
      this.updateValue();
    },
    startValue() {
      this.updateValue();
    },
    endValue() {
      this.updateValue();
    },
    stepValue() {
      this.updateValue();
    },
  },
  methods: {
    updateValue() {
      this.$emit("update:modelValue", this.generatedCode);
    },
    parseCodeString(val) {
      try {
        if (this.type === "loop") {
          const match = val.match(
            /^for\(let\s+(\w+)=(\d+);(\w+)<(\d+);(\w+)\+=(\d+)\){$/
          );
          if (match) {
            this.indexVar = match[1];
            this.startValue = parseInt(match[2]);
            this.endValue = parseInt(match[4]);
            this.stepValue = parseInt(match[6]);
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
}

.loop-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-type-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
  user-select: none;
}

.control-btn {
  width: 21px;
  height: 21px;
  opacity: 0.7;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.loop-settings {
  display: flex;
  gap: 4px;
}

.loop-input :deep(.q-field__control),
.loop-input :deep(.q-field__native),
.loop-input :deep(.q-field__marginal) {
  padding: 0 5px;
  height: 21px !important;
  min-height: 21px;
  font-size: 13px;
  max-width: 80px;
}

/* 暗色模式适配 */
.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
