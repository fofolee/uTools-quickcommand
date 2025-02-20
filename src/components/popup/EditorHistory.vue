<template>
  <div class="editor-history-container">
    <q-dialog
      v-model="show"
      position="right"
      @hide="$emit('hide')"
      transition-show="slide-left"
      transition-hide="slide-right"
      seamless
    >
      <q-card class="history-card q-pa-none">
        <div class="history-layout">
          <!-- 左侧预览区域 -->
          <div class="preview-container">
            <div class="preview-header text-h6">
              <q-icon name="code" size="16px" />
              <span class="q-ml-sm">代码预览</span>
            </div>
            <transition
              mode="out-in"
              enter-active-class="fade-in"
              leave-active-class="fade-out"
            >
              <div
                v-if="selectedIndex !== null"
                class="preview-content"
                :key="selectedIndex"
              >
                <pre>{{ historyList[selectedIndex]?.content || "" }}</pre>
              </div>
              <div v-else class="preview-placeholder" key="placeholder">
                <q-icon name="code" size="48px" color="grey-7" />
                <div class="text-grey-7 q-mt-sm text-subtitle1">
                  鼠标悬停查看代码预览
                </div>
              </div>
            </transition>
          </div>

          <!-- 右侧历史列表 -->
          <div class="history-list-container">
            <q-card-section class="header-section row items-center q-pb-none">
              <div class="text-h6">历史记录</div>
              <q-icon name="help_outline" class="q-ml-sm">
                <q-tooltip>
                  以下操作会自动保存历史记录：<br />
                  1.初次进入编辑器；<br />
                  2.点击运行、保存按钮；<br />
                  3.在此处进行恢复操作。<br />
                  4.AI助手自动提交代码后。<br />
                  注意：<br />
                  1.超过5k的内容不会保存；<br />
                  2.数据是临时保存的，且不会多端同步；<br />
                  3.数据会在uTools重启后清除；<br />
                  4.不要依赖此功能保存重要数据或者进行版本管理。
                </q-tooltip>
              </q-icon>
              <q-space />
              <q-btn flat round dense icon="delete_sweep" @click="confirmClear">
                <q-tooltip>清空历史</q-tooltip>
              </q-btn>
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pt-sm history-list">
              <q-list separator>
                <q-item
                  v-for="(item, index) in historyList"
                  :key="index"
                  clickable
                  v-ripple
                  @click="restoreHistory(item)"
                  class="history-item"
                  :class="{ selected: selectedIndex === index }"
                  @mouseenter="selectedIndex = index"
                >
                  <q-item-section>
                    <div class="row items-center">
                      <q-item-label class="text-weight-medium">{{
                        formatDate(item.timestamp)
                      }}</q-item-label>
                      <q-badge
                        class="q-ml-sm"
                        :color="
                          item.program === 'JavaScript' ? 'yellow-8' : 'blue-6'
                        "
                        text-color="white"
                      >
                        {{ item.program }}
                      </q-badge>
                    </div>
                    <q-item-label caption class="q-mt-xs text-grey-7">
                      {{ truncateContent(item.content) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete_outline"
                      class="delete-btn"
                      @click.stop="deleteHistory(index)"
                    >
                      <q-tooltip>删除</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { reactive } from "vue";

export default {
  name: "EditorHistory",

  props: {
    commandCode: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      show: false,
      historyList: [],
      maxHistoryItems: 50,
      storagePrefix: "editor_history_",
      selectedIndex: null,
      showClearConfirm: false,
    };
  },

  setup() {
    const previewStates = reactive({});
    return {
      previewStates,
    };
  },

  methods: {
    getStorageKey(timestamp) {
      return `${this.storagePrefix}${this.commandCode}_${timestamp}`;
    },

    open() {
      this.loadHistory();
      this.show = true;
    },

    tryToSave(content, program) {
      if (!content || !content.trim()) {
        return false;
      }

      if (new Blob([content]).size > 5120) {
        return false;
      }

      return this.saveHistory(content, program);
    },

    showHistory() {
      this.open();
    },

    loadHistory() {
      this.historyList = [];
      const prefix = `${this.storagePrefix}${this.commandCode}_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            this.historyList.push(item);
          } catch (e) {
            console.error("Failed to parse history item:", e);
          }
        }
      }

      this.historyList.sort((a, b) => b.timestamp - a.timestamp);

      if (this.historyList.length > this.maxHistoryItems) {
        const toDelete = this.historyList.slice(this.maxHistoryItems);
        toDelete.forEach((item) => {
          localStorage.removeItem(this.getStorageKey(item.timestamp));
        });
        this.historyList = this.historyList.slice(0, this.maxHistoryItems);
      }
    },

    saveHistory(content, program) {
      // 先加载最新的历史记录
      this.loadHistory();

      // 检查是否与最新的历史记录相同
      if (this.historyList.length > 0) {
        const latestHistory = this.historyList[0];
        if (
          latestHistory.content === content &&
          latestHistory.program === program
        ) {
          return false; // 如果内容程序类型都相同，则不保存
        }
      }

      const timestamp = Date.now();
      const historyItem = {
        content,
        program,
        timestamp,
      };

      try {
        localStorage.setItem(
          this.getStorageKey(timestamp),
          JSON.stringify(historyItem)
        );

        // 直接将新记录添加到列表开头
        this.historyList.unshift(historyItem);
        return true; // 表示成功保存
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          if (this.historyList.length > 0) {
            const oldestItem = this.historyList[this.historyList.length - 1];
            localStorage.removeItem(this.getStorageKey(oldestItem.timestamp));
            return this.saveHistory(content, program);
          }
        }
        return false;
      }
    },

    deleteHistory(index) {
      const item = this.historyList[index];
      localStorage.removeItem(this.getStorageKey(item.timestamp));
      this.historyList.splice(index, 1);
    },

    confirmClear() {
      quickcommand.showConfirmBox("确定要清空所有历史记录吗？").then((res) => {
        if (res) {
          this.doClearHistory();
        }
      });
    },

    doClearHistory() {
      const prefix = `${this.storagePrefix}${this.commandCode}_`;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
      this.historyList = [];
      this.selectedIndex = null;
    },

    restoreHistory(item) {
      this.$emit("restore", item);
      this.show = false;
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // 24小时内显示相对时间
      if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return "刚刚";
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
        return `${Math.floor(diff / 3600000)}小时前`;
      }

      // 超过24小时显示具体日期时间
      return `${
        date.getMonth() + 1
      }月${date.getDate()}日 ${date.getHours()}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    },

    truncateContent(content) {
      return content.length > 50 ? content.slice(0, 50) + "..." : content;
    },

    showPreview(index) {
      this.previewStates[index] = true;
    },

    hidePreview(index) {
      this.previewStates[index] = false;
    },
  },
};
</script>

<style scoped>
.history-card {
  width: 800px;
  max-width: 90vw;
  height: 100vh;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background-color: var(--utools-bg-color);
}

.history-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.history-list-container {
  width: 400px;
  border-left: 1px solid var(--q-separator-color);
  border-right: 1px solid var(--q-separator-color);
  display: flex;
  flex-direction: column;
  background: var(--q-card-background);
  position: relative;
  z-index: 1;
}

.header-section {
  padding: 16px 16px 8px;
  position: relative;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.preview-header {
  padding: 16px 16px 8px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.history-list {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 64px); /* Subtract header height */
}

.history-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px 16px;
  border-left: 3px solid transparent;
  position: relative;
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
}

.history-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-item:hover::before,
.history-item.selected::before {
  opacity: 1;
}

.history-item:hover,
.history-item.selected {
  border-left-color: var(--q-primary);
  transform: translateX(2px);
}

.preview-content,
.preview-placeholder {
  position: absolute;
  left: 0;
  right: 0;
  top: 48px;
  bottom: 0;
  margin: 0;
  font-size: 12px;
  overflow: hidden;
  line-height: 1.5;
  font-family: monospace;
  flex-direction: column;
  display: flex;
}

.preview-content pre {
  margin: 0;
  padding: 16px;
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  flex: 1;
  font-size: 13px;
  line-height: 1.6;
  background: transparent;
  transition: all 0.3s ease;
}

.preview-placeholder {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  padding: 20px;
}

.preview-placeholder .q-icon {
  margin-bottom: 12px;
}

.preview-placeholder .text-subtitle1 {
  font-size: 14px;
  opacity: 0.8;
}

/* 自定义滚动条 */
.preview-content pre::-webkit-scrollbar,
.history-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.preview-content pre::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.preview-content pre::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
}

.preview-content pre::-webkit-scrollbar-thumb:hover,
.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--q-primary);
  opacity: 0.3;
}

/* 确认对话框样式 */
.confirm-dialog {
  min-width: 300px;
  padding: 8px;
}

/* 自定义淡入淡出动画 */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.fade-out {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.history-item q-item-label {
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
