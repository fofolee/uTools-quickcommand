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
          :model-value="argvs.indexVar"
          @update:model-value="updateArgvs('indexVar', $event)"
          label="变量"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.startValue"
          @update:model-value="updateArgvs('startValue', $event)"
          label="从"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.endValue"
          @update:model-value="updateArgvs('endValue', $event)"
          label="到"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.stepValue"
          @update:model-value="updateArgvs('stepValue', $event)"
          label="步进"
          class="loop-input"
        />
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
                chainId: this.modelValue.chainId,
                commandType: 'continue',
                value: this.modelValue.value,
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
                chainId: this.modelValue.chainId,
                commandType: 'break',
                value: this.modelValue.value,
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
    modelValue: Object,
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      defaultArgvs: {
        indexVar: "i",
        startValue: 0,
        endValue: 10,
        stepValue: 1,
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
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
    generateCode(argvs = this.argvs) {
      switch (this.type) {
        case "loop":
          const index = argvs.indexVar || "i";
          const start = argvs.startValue || 0;
          const end = argvs.endValue || 10;
          const step = argvs.stepValue || 1;
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
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      if (this.type === "loop") {
        const match = code.match(
          /^for\(let\s+(\w+)=(\d+);.*?<(\d+);.*?\+=(\d+)\)\{$/
        );
        if (match) {
          argvs.indexVar = match[1];
          argvs.startValue = parseInt(match[2]);
          argvs.endValue = parseInt(match[3]);
          argvs.stepValue = parseInt(match[4]);
        }
      }
      return argvs;
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs: this.defaultArgvs,
        code: this.generateCode(this.defaultArgvs),
      });
    }
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
