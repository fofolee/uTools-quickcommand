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
            :model-value="argvs.condition"
            @update:model-value="updateArgvs('condition', $event)"
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
            chainId: this.modelValue.chainId,
            commandType: 'else',
            value: this.modelValue.value,
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
        :icon="argvs.showMidCondition ? 'remove' : 'add'"
        class="control-btn"
        @click="toggleCondition"
      >
        <q-tooltip>{{
          argvs.showMidCondition ? "隐藏条件" : "显示条件"
        }}</q-tooltip>
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
    modelValue: Object,
  },
  emits: ["update:modelValue", "addBranch"],
  data() {
    return {
      defaultArgvs: {
        condition: "",
        showMidCondition: false,
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
    showCondition() {
      return (
        this.type === "if" ||
        (this.type === "else" && this.argvs.showMidCondition)
      );
    },
  },
  methods: {
    toggleCondition() {
      this.argvs.showMidCondition = !this.argvs.showMidCondition;
      if (this.argvs.showMidCondition === false) this.argvs.condition = "";
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs: this.argvs,
        code: this.generateCode(this.argvs),
      });
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
    generateCode(argvs) {
      switch (this.type) {
        case "if":
          return `if(${argvs.condition || "true"}){`;
        case "else":
          return argvs.showMidCondition && argvs.condition
            ? `}else if(${argvs.condition}){`
            : "}else{";
        case "end":
          return "}";
        default:
          return "";
      }
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      switch (this.type) {
        case "if":
          const ifMatch = code.match(/^if\((.*?)\)\{$/);
          if (ifMatch) {
            argvs.condition = ifMatch[1] === "true" ? "" : ifMatch[1];
          }
          break;
        case "else":
          const elseIfMatch = code.match(/^}else if\((.*?)\)\{$/);
          if (elseIfMatch) {
            argvs.condition = elseIfMatch[1];
            argvs.showMidCondition = true;
          }
          break;
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
