<template>
  <div class="conditional-judgment">
    <div class="row items-end no-wrap">
      <!-- 类型标签 -->
      <div class="control-type-label">
        <template v-if="type === 'if'">如果</template>
        <template v-else-if="type === 'else'"> 否则 </template>
        <template v-else>结束</template>
      </div>

      <!-- if类型显示添加按钮 -->
      <q-btn
        v-if="type === 'if'"
        flat
        dense
        size="sm"
        icon="add"
        class="control-btn q-mx-xs"
        @click="
          $emit('addBranch', {
            chainId: command.chainId,
            commandType: 'else',
          })
        "
      >
        <q-tooltip>添加条件分支</q-tooltip>
      </q-btn>

      <!-- mid类型显示切换按钮 -->
      <q-btn
        v-if="type === 'else'"
        flat
        dense
        size="sm"
        :icon="showCondition ? 'remove' : 'add'"
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
      validator: (value) => ["if", "else", "end"].includes(value),
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
        this.type === "if" || (this.type === "else" && this.showMidCondition)
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
        case "if":
          return `if(${this.condition || "true"}){`;
        case "else":
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
        if (this.type === "if") {
          const match = val.match(/^if\((.*)\){$/);
          if (match) {
            this.condition = match[1] === "true" ? "" : match[1];
          }
        } else if (this.type === "else") {
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
.control-type-label {
  font-size: 13px;
  white-space: nowrap;
  opacity: 0.9;
  user-select: none;
}

.condition-input {
  flex: 1;
  transition: all 0.3s ease;
}

.condition-input :deep(.q-field__control),
.condition-input :deep(.q-field__native) {
  padding: 1px;
  height: 21px !important;
  min-height: 21px;
  border-radius: 4px;
  font-size: 13px;
}

.control-btn {
  width: 21px;
  height: 21px;
  min-height: 21px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
