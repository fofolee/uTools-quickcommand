<template>
  <div class="loop-control-wrapper" v-bind="$attrs">
    <div class="loop-control row items-center no-wrap">
      <!-- 类型标签和按钮区域 -->
      <div class="control-type-label">
        <template v-if="type === 'forEach'">开始</template>
        <template v-else-if="type === 'continue'">继续</template>
        <template v-else-if="type === 'break'">终止</template>
        <template v-else>结束</template>
      </div>

      <!-- 遍历设置区域 -->
      <div v-if="type === 'forEach'" class="loop-settings">
        <ControlInput
          :model-value="argvs.itemVar"
          @update:model-value="updateArgvs('itemVar', $event)"
          label="元素"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.indexVar"
          @update:model-value="updateArgvs('indexVar', $event)"
          label="索引"
          :is-variable="true"
          class="loop-input"
        />
        <ControlInput
          :model-value="argvs.arrayVar"
          @update:model-value="updateArgvs('arrayVar', $event)"
          label="数组"
          class="loop-input array-input"
        />
      </div>

      <!-- 只在循环开始时显示添加按钮 -->
      <q-btn-dropdown
        v-if="type === 'forEach'"
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
import ControlInput from "components/composer/common/ControlInput.vue";

export default defineComponent({
  name: "ForEachControl",
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
        itemVar: "item",
        indexVar: "index",
        arrayVar: "array",
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
      this.updateModelValue(argvs);
    },
    generateCode(argvs = this.argvs) {
      switch (this.type) {
        case "forEach":
          const item = argvs.itemVar || "item";
          const index = argvs.indexVar || "index";
          const array = argvs.arrayVar || "array";
          return `for(let [${index}, ${item}] of ${array}.entries()){`;
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

      if (this.type === "forEach") {
        const match = code.match(
          /^(\w+)\.forEach\(\((\w+),\s*(\w+)\)\s*=>\s*\{$/
        );
        if (match) {
          argvs.arrayVar = match[1];
          argvs.itemVar = match[2];
          argvs.indexVar = match[3];
        }
      }
      return argvs;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.defaultArgvs);
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

.array-input {
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
