<template>
  <q-dialog
    v-model="show"
    position="right"
    @hide="$emit('hide')"
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card class="history-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">编辑历史</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="delete_sweep"
          @click="clearHistory"
        >
          <q-tooltip>清空历史</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div class="history-list">
          <q-list separator>
            <q-item
              v-for="(item, index) in historyList"
              :key="index"
              clickable
              v-ripple
              @click="restoreHistory(item)"
              class="history-item"
            >
              <q-item-section>
                <q-item-label>{{ formatDate(item.timestamp) }}</q-item-label>
                <q-item-label caption>
                  {{ item.program }} · {{ truncateContent(item.content) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  @click.stop="deleteHistory(index)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </q-item-section>

              <!-- 预览弹窗 -->
              <q-tooltip
                anchor="center right"
                self="center left"
                :offset="[10, 0]"
                class="history-preview bg-dark"
                :delay="500"
              >
                <pre class="preview-content">{{ item.content }}</pre>
              </q-tooltip>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'EditorHistory',

  props: {
    commandCode: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      show: false,
      historyList: [],
      maxHistoryItems: 50,
      storagePrefix: 'editor_history_'
    }
  },

  methods: {
    getStorageKey(timestamp) {
      return `${this.storagePrefix}${this.commandCode}_${timestamp}`;
    },

    open() {
      this.loadHistory();
      this.show = true;
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
            console.error('Failed to parse history item:', e);
          }
        }
      }

      this.historyList.sort((a, b) => b.timestamp - a.timestamp);

      if (this.historyList.length > this.maxHistoryItems) {
        const toDelete = this.historyList.slice(this.maxHistoryItems);
        toDelete.forEach(item => {
          localStorage.removeItem(this.getStorageKey(item.timestamp));
        });
        this.historyList = this.historyList.slice(0, this.maxHistoryItems);
      }
    },

    saveHistory(content, program) {
      const timestamp = Date.now();
      const historyItem = {
        content,
        program,
        timestamp
      };

      try {
        localStorage.setItem(
          this.getStorageKey(timestamp),
          JSON.stringify(historyItem)
        );

        this.loadHistory();
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          if (this.historyList.length > 0) {
            const oldestItem = this.historyList[this.historyList.length - 1];
            localStorage.removeItem(this.getStorageKey(oldestItem.timestamp));
            this.saveHistory(content, program);
          }
        }
      }
    },

    deleteHistory(index) {
      const item = this.historyList[index];
      localStorage.removeItem(this.getStorageKey(item.timestamp));
      this.historyList.splice(index, 1);
    },

    clearHistory() {
      const prefix = `${this.storagePrefix}${this.commandCode}_`;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
      this.historyList = [];
    },

    restoreHistory(item) {
      this.$emit('restore', item);
      this.show = false;
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // 24小时内显示相对时间
      if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return '刚刚';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
        return `${Math.floor(diff / 3600000)}小时前`;
      }

      // 超过24小时显示具体日期时间
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    truncateContent(content) {
      return content.length > 50 ? content.slice(0, 50) + '...' : content;
    }
  }
}
</script>

<style scoped>
.history-card {
  width: 400px;
  max-width: 90vw;
  height: 100vh;
}

.history-list {
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.history-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-item:hover {
  background: rgba(var(--q-primary-rgb), 0.05);
}

.history-preview {
  max-width: 400px;
  padding: 12px;
}

.preview-content {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

/* 暗色模式适配 */
.body--dark .history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
