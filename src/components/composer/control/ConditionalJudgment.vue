<template>
  <div class="conditional-judgment-wrapper">
    <div class="conditional-judgment">
      <!-- 类型标签 -->
      <div class="control-type-label">
        <template v-if="type === 'if'">如果</template>
        <template v-else-if="type === 'else'"> 否则 </template>
        <template v-else>结束</template>
      </div>

      <!-- 条件输入区域 -->
      <div class="condition-settings">
        <template v-if="showCondition">
          <ControlInput
            v-model="conditionLocal"
            label="条件"
            placeholder="表达式"
            class="condition-input"
          />
        </template>
      </div>

      <!-- if类型显示添加按钮 -->
      <q-btn
        v-if="type === 'if'"
        flat
        dense
        icon="add"
        size="sm"
        class="control-btn"
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
        class="control-btn"
        @click="toggleCondition"
      >
        <q-tooltip>{{ showCondition ? "隐藏条件" : "显示条件" }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ControlInput from "../ui/ControlInput.vue";

export default defineComponent({
  name: "ConditionalJudgment",
  components: {
    ControlInput,
  },
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
.conditional-judgment-wrapper {
  width: 100%;
  display: flex;
}

.conditional-judgment {
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

.condition-settings {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.condition-input {
  flex: 1;
  min-width: 0;
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

.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
