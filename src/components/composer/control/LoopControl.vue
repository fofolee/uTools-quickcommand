<template>
  <div class="loop-control-wrapper" v-bind="$attrs">
    <div class="loop-control row items-center no-wrap">
      <!-- 类型标签和按钮区域 -->
      <div class="control-type-label">
        <template v-if="type === 'loop'">开始</template>
        <template v-else-if="type === 'continue'">继续</template>
        <template v-else-if="type === 'break'">终止</template>
        <template v-else>结束</template>
      </div>

      <!-- 循环设置区域 -->
      <div v-if="type === 'loop'" class="loop-settings">
        <ControlInput
          v-model="indexVar"
          label="变量"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput v-model="startValue" label="从" class="loop-input" />
        <ControlInput v-model="endValue" label="到" class="loop-input" />
        <ControlInput v-model="stepValue" label="步进" class="loop-input" />
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
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ControlInput from "../ui/ControlInput.vue";

export default defineComponent({
  name: "LoopControl",
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

.loop-input {
  width: 80px;
}

/* 暗色模式适配 */
.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
