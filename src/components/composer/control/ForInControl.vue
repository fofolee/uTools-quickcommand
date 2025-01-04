<template>
  <div class="loop-control-wrapper" v-bind="$attrs">
    <div class="loop-control row items-center no-wrap">
      <!-- 类型标签和按钮区域 -->
      <div class="control-type-label">
        <template v-if="type === 'forIn'">开始</template>
        <template v-else-if="type === 'continue'">继续</template>
        <template v-else-if="type === 'break'">终止</template>
        <template v-else>结束</template>
      </div>

      <!-- 遍历设置区域 -->
      <div v-if="type === 'forIn'" class="loop-settings">
        <ControlInput
          :model-value="argvs.keyVar"
          @update:model-value="updateArgvs('keyVar', $event)"
          label="键名"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.valueVar"
          @update:model-value="updateArgvs('valueVar', $event)"
          label="值"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.objectVar"
          @update:model-value="updateArgvs('objectVar', $event)"
          label="对象"
          class="loop-input object-input"
        />
      </div>

      <!-- 只在循环开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'forIn'"
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
  name: "ForInControl",
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
        keyVar: "key",
        valueVar: "value",
        objectVar: "obj",
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
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
    generateCode(argvs = this.argvs) {
      switch (this.type) {
        case "forIn":
          const key = argvs.keyVar || "key";
          const value = argvs.valueVar || "value";
          const obj = argvs.objectVar || "obj";
          return `for(const ${key} in ${obj}){const ${value}=${obj}[${key}];`;
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

      if (this.type === "forIn") {
        const match = code.match(/^for\(const\s+(\w+)\s+in\s+(\w+)\)\{$/);
        if (match) {
          argvs.keyVar = match[1];
          argvs.objectVar = match[2];
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

.object-input {
  width: 120px;
}

/* 暗色模式适配 */
.body--dark .control-btn {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .control-btn:hover {
  color: var(--q-primary);
}
</style>
