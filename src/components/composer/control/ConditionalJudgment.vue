<template>
  <div class="conditional-judgment">
    <div class="row items-center no-wrap">
      <!-- 类型标签 -->
      <div class="text-subtitle2 type-label">
        <template v-if="type === 'start'">如果满足</template>
        <template v-else-if="type === 'mid'">
          {{ showCondition ? "否则满足" : "否则" }}
        </template>
        <template v-else>结束条件判断</template>
      </div>

      <!-- start类型显示添加按钮 -->
      <q-btn
        v-if="type === 'start'"
        flat
        round
        dense
        size="sm"
        icon="add"
        class="control-btn q-mx-xs"
        @click="$emit('addBranch')"
      >
        <q-tooltip>添加条件分支</q-tooltip>
      </q-btn>

      <!-- mid类型显示切换按钮 -->
      <q-btn
        v-if="type === 'mid'"
        flat
        round
        dense
        size="sm"
        :icon="showCondition ? 'unfold_less' : 'unfold_more'"
        class="control-btn q-mx-xs"
        @click="toggleCondition"
      >
        <q-tooltip>{{ showCondition ? "隐藏条件" : "显示条件" }}</q-tooltip>
      </q-btn>

      <!-- 条件输入框 -->
      <q-input
        v-if="showCondition"
        v-model="conditionLocal"
        dense
        borderless
        :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-2'"
        placeholder="输入条件表达式"
        class="condition-input"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ConditionalJudgment",
  props: {
    modelValue: String,
    command: Object,
    type: {
      type: String,
      required: true,
      validator: (value) => ["start", "mid", "end"].includes(value),
    },
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      showMidCondition: false,
      condition: "",
    };
  },
  created() {
    // 组件创建时生成初始代码
    this.updateValue();
  },
  computed: {
    showCondition() {
      return (
        this.type === "start" || (this.type === "mid" && this.showMidCondition)
      );
    },
    conditionLocal: {
      get() {
        return this.condition;
      },
      set(value) {
        this.condition = value;
        this.updateValue();
      },
    },
    generatedCode() {
      switch (this.type) {
        case "start":
          return `if(${this.condition || "true"}){`;
        case "mid":
          return this.showMidCondition && this.condition
            ? `}else if(${this.condition}){`
            : "}else{";
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
  },
  methods: {
    toggleCondition() {
      this.showMidCondition = !this.showMidCondition;
      if (!this.showMidCondition) {
        this.condition = "";
        this.updateValue();
      }
    },
    updateValue() {
      this.$emit("update:modelValue", this.generatedCode);
    },
    parseCodeString(val) {
      try {
        if (this.type === "start") {
          const match = val.match(/^if\((.*)\){$/);
          if (match) {
            this.condition = match[1] === "true" ? "" : match[1];
          }
        } else if (this.type === "mid") {
          if (val === "}else{") {
            this.showMidCondition = false;
            this.condition = "";
          } else {
            const match = val.match(/^}else if\((.*)\){$/);
            if (match) {
              this.showMidCondition = true;
              this.condition = match[1];
            }
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
.conditional-judgment {
  padding: 4px 0;
}

.type-label {
  font-size: 14px;
  color: var(--q-primary);
  white-space: nowrap;
  opacity: 0.9;
}

.condition-input {
  flex: 1;
  transition: all 0.3s ease;
}

.condition-input :deep(.q-field__control) {
  padding: 0 16px;
  height: 24px !important;
  min-height: 24px;
  border-radius: 4px;
}

.control-btn {
  width: 24px;
  height: 24px;
  min-height: 24px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 暗色模式适配 */
.body--dark .condition-input {
  background: rgba(255, 255, 255, 0.05) !important;
}

.body--dark .type-label {
  color: var(--q-primary);
  opacity: 0.8;
}

.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
