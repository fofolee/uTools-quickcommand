<template>
  <div class="composer-buttons">
    <div class="right-buttons">
      <q-btn
        icon="close"
        dense
        flat
        @click="$emit('action', 'close')"
        v-if="!disabledButtons.includes('close')"
      >
        <q-tooltip>退出可视化编排</q-tooltip>
      </q-btn>
      <q-btn
        :icon="isAllCollapsed ? 'unfold_more' : 'unfold_less'"
        dense
        flat
        @click="$emit('action', isAllCollapsed ? 'expandAll' : 'collapseAll')"
        v-if="!disabledButtons.includes('expand')"
      >
        <q-tooltip>{{ isAllCollapsed ? "展开所有" : "折叠所有" }}</q-tooltip>
      </q-btn>
      <q-btn
        icon="settings"
        dense
        flat
        @click="$emit('action', 'toggleFlowManager')"
        v-if="!disabledButtons.includes('manager')"
      >
        <q-tooltip>流程管理</q-tooltip>
      </q-btn>
      <q-btn
        @click="$q.dark.toggle()"
        :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
        flat
        dense
        v-if="isDev"
      >
      </q-btn>
      <q-btn flat dense icon="help" @click="showHelp">
        <q-tooltip>帮助</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        icon="done_all"
        @click="handleApply"
        v-if="!disabledButtons.includes('apply')"
      >
        <q-tooltip>清空编辑器内容并插入</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        icon="save"
        @click="$emit('action', 'save')"
        v-if="!disabledButtons.includes('save')"
      >
        <q-tooltip>保存</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        icon="delete_sweep"
        @click="handleClear"
        v-if="!disabledButtons.includes('clear')"
      >
        <q-tooltip>清空所有流程</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="preview"
        @click="handlePreviewCode"
        v-if="!disabledButtons.includes('preview')"
      >
        <q-tooltip>预览代码</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        icon="play_circle"
        @click="$emit('action', 'run')"
        v-if="!disabledButtons.includes('run')"
      >
        <q-tooltip>运行</q-tooltip>
      </q-btn>
    </div>

    <q-dialog v-model="isVisible">
      <q-card style="width: 550px">
        <q-card-section class="row items-center q-py-xs q-px-md">
          <div>
            <q-icon name="code" size="16px" class="q-mr-sm" />
            预览代码
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-separator />
          <q-scroll-area style="height: 400px">
            <pre class="preview-code"><code>{{ code }}</code></pre>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { generateFlowsCode } from "js/composer/generateCode";

export default defineComponent({
  name: "ComposerButtons",

  props: {
    isAllCollapsed: {
      type: Boolean,
      default: false,
    },
    disabledButtons: {
      type: Array,
      default: () => [],
    },
    flows: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["action"],

  data() {
    return {
      isVisible: false,
      code: "",
      isDev: window.utools.isDev(),
    };
  },

  methods: {
    handlePreviewCode() {
      this.code = generateFlowsCode(this.flows);
      this.isVisible = true;
    },
    // 清空编辑器内容并插入
    handleApply() {
      const code = generateFlowsCode(this.flows);
      this.$emit("action", "apply", code);
    },
    handleClear() {
      quickcommand
        .showConfirmBox("确定要清空所有流程吗？", "FBI WARNING")
        .then((isConfirm) => {
          if (!isConfirm) return;
          this.$emit("action", "clear");
        });
    },
    showHelp() {
      window.showUb.help("#TMtYg");
    },
  },
});
</script>

<style scoped>
.composer-buttons {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
}

.right-buttons {
  display: flex;
  align-items: center;
  height: 100%;
}

.right-buttons .q-btn {
  height: 28px;
  min-height: 28px;
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
}

.right-buttons .q-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
  color: var(--q-primary);
}

.preview-code {
  margin: 0;
  padding: 14px;
  font-family: consolas, monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.preview-code::-webkit-scrollbar {
  width: 5px;
}
</style>
