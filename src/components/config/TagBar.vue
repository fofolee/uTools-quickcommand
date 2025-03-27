<template>
  <q-scroll-area
    v-show="$root.profile.commandCardStyle !== 'mini'"
    class="absolute-left tag-bar"
    :thumb-style="{
      width: '2px',
    }"
    :style="{
      width: tabBarWidth,
      zIndex: 1,
    }"
  >
    <q-tabs
      v-model="currentTag"
      vertical
      switch-indicator
      :dense="$root.profile.denseTagBar"
    >
      <!-- 可拖拽标签 -->
      <draggable
        v-model="sortableTags"
        :animation="200"
        ghost-class="ghost"
        tag="div"
        item-key="tag"
        class="draggable-container"
        handle=".q-tab"
        @change="handleTagsChange"
      >
        <template #item="{ element }">
          <q-tab
            :name="element"
            :data-active-panel="isTagStared(element)"
            class="draggable-tag"
          >
            {{ element }}
          </q-tab>
        </template>
      </draggable>
      <!-- 固定标签（不可拖拽） -->
      <q-tab
        v-for="tag in fixedTags"
        :key="tag"
        :name="tag"
        :data-search-result="tag === '搜索结果'"
        :data-active-panel="isTagStared(tag)"
        class="fixed-tag"
      >
        {{ tag }}
        <q-tooltip v-if="tag === '未分类'">
          所有没有添加标签的命令都会归在未分类 <br />
          可以在新建命令时在标签一栏选择或直接键入标签名来添加标签
        </q-tooltip>
      </q-tab>
    </q-tabs>
  </q-scroll-area>
</template>

<script>
import draggable from "vuedraggable";
import { dbManager } from "js/utools.js";
import { useCommandManager } from "js/commandManager.js";

const FIXED_TAGS = ["未分类", "默认", "搜索结果"];
const TAG_ORDER_KEY = "cfg_tagOrder";

export default {
  name: "TagBar",
  components: {
    draggable,
  },
  props: {
    tabBarWidth: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      commandManager: useCommandManager(),
      savedTagOrder: [], // 缓存标签顺序
    };
  },
  mounted() {
    this.$nextTick(() => {
      // 初始化时读取一次数据库
      const savedTagOrder = dbManager.getDB(TAG_ORDER_KEY);
      if (savedTagOrder.length) {
        this.savedTagOrder = savedTagOrder;
      }
      if (!this.commandManager.state.currentTag) {
        this.commandManager.changeCurrentTag(
          this.savedTagOrder[0] || this.allQuickCommandTags[0]
        );
      }
    });
  },
  computed: {
    currentTag: {
      get() {
        return this.commandManager.state.currentTag;
      },
      set(value) {
        this.commandManager.state.currentTag = value;
      },
    },
    allQuickCommandTags() {
      return this.commandManager.state.allQuickCommandTags;
    },
    // 固定标签（不可拖拽）
    fixedTags() {
      return FIXED_TAGS.filter((tag) => this.allQuickCommandTags.includes(tag));
    },
    // 可拖拽标签
    sortableTags: {
      get() {
        const draggableTags = this.allQuickCommandTags.filter(
          (tag) => !FIXED_TAGS.includes(tag)
        );

        // 根据保存的顺序排序
        const orderedTags = [];
        // 先添加有序的标签
        this.savedTagOrder.forEach((tag) => {
          if (draggableTags.includes(tag)) {
            orderedTags.push(tag);
          }
        });
        // 再添加新标签
        draggableTags.forEach((tag) => {
          if (!orderedTags.includes(tag)) {
            orderedTags.push(tag);
          }
        });

        return orderedTags;
      },
      set(value) {
        // 更新内部缓存
        this.savedTagOrder = value;
        // 保存到数据库
        dbManager.putDB(value, TAG_ORDER_KEY);
      },
    },
  },
  methods: {
    handleTagsChange(evt) {
      if (evt.moved) {
        const newOrder = [...this.sortableTags];
        // 更新内部缓存
        this.savedTagOrder = newOrder;
        // 保存到数据库
        dbManager.putDB(newOrder, TAG_ORDER_KEY);
      }
    },
    isTagStared(tag) {
      return this.commandManager.state.activatedQuickPanels.includes(tag);
    },
  },
};
</script>

<style scoped>
/* 标签栏容器样式 */
.q-tabs {
  height: auto !important;
  min-height: 100vh !important;
  background: transparent !important;
}

.q-scroll-area {
  height: 100vh;
}

/* 标签栏和底栏内的按钮悬浮效果 */
.q-tabs .q-tab:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .q-tabs .q-tab:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.q-tab {
  word-break: break-all;
  white-space: normal;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--q-blue-grey) !important;
  opacity: 0.7;
  transition: all 0.3s ease;
}

/* 激活标签样式 */
.q-tab--active {
  color: var(--q-primary) !important;
  font-weight: 600 !important;
  opacity: 1;
}

.q-tab:hover::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: var(--q-primary);
  opacity: 0.1;
  border-radius: 4px;
  transition: opacity 0.3s;
}

/* 特殊标签样式（搜索结果和激活面板） */
.q-tab[data-search-result="true"],
.q-tab[data-active-panel="true"] {
  color: #4286de !important;
  font-weight: 600 !important;
}

/* 标签悬浮效果 */
.q-tab:hover {
  opacity: 0.9;
  transform: translateX(4px);
}

/* 标签内容过渡效果 */
.q-tab__content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 标签栏过渡动画 */
.tag-bar {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width, opacity;
  opacity: 1;
  background: transparent;
}

/* 标签栏隐藏时的样式 */
.tag-bar[style*="display: none"] {
  opacity: 0;
  width: 0 !important;
}

/* 拖拽相关样式 */
.draggable-container {
  width: 100%;
}

.draggable-tag {
  cursor: move;
  touch-action: none;
}

.ghost {
  opacity: 0.15;
}

.fixed-tag {
  cursor: default;
}
</style>
