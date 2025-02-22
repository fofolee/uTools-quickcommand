<template>
  <div
    class="absolute-bottom footer-bar"
    :style="{ height: height, left: left }"
  >
    <div class="row">
      <!-- 搜索栏 -->
      <div class="col search-input">
        <q-input
          :model-value="commandSearchKeyword"
          @update:model-value="updateSearch"
          debounce="200"
          filled
          dense
          :autofocus="$root.profile.autofocusSearch"
          placeholder="搜索，支持拼音首字母"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <!-- 按钮组 -->
      <div class="col-auto justify-end flex">
        <q-btn-group class="btn-group">
          <!-- 暗色模式切换按钮 -->
          <q-btn
            flat
            v-if="isDev"
            :color="isDarkMode ? 'amber' : 'blue-9'"
            :icon="isDarkMode ? 'dark_mode' : 'light_mode'"
            @click="toggleDarkMode"
          >
            <q-tooltip>
              {{ isDarkMode ? "切换到亮色模式" : "切换到暗色模式" }}
            </q-tooltip>
          </q-btn>
          <!-- 切换视图 -->
          <q-btn-toggle
            v-model="$root.profile.commandCardStyle"
            toggle-color="primary"
            flat
            :options="[
              { slot: 'normal', value: 'normal' },
              { slot: 'dense', value: 'dense' },
              { slot: 'mini', value: 'mini' },
            ]"
          >
            <template v-slot:normal>
              <q-icon name="dashboard" />
              <q-tooltip>双列视图</q-tooltip>
            </template>
            <template v-slot:dense>
              <q-icon name="apps" />
              <q-tooltip>三列视图</q-tooltip>
            </template>
            <template v-slot:mini>
              <q-icon name="view_comfy" />
              <q-tooltip>
                五列面板视图<br />
                未启用、匹配类型为窗口的命令在此视图下不显示
              </q-tooltip>
            </template>
          </q-btn-toggle>
          <!-- 分享中心按钮 -->
          <q-btn
            split
            flat
            @click="goShareCenter"
            color="primary"
            icon="groups"
            class="share-btn"
          >
            <q-tooltip>分享中心</q-tooltip>
          </q-btn>
          <!-- 新建按钮 -->
          <q-btn
            split
            flat
            @click="$emit('add-new', 'quickcommand')"
            color="primary"
            class="new-btn"
          >
            <q-icon name="code" class="icon-with-badge" />
            <q-tooltip>新建命令（直接编写脚本）</q-tooltip>
          </q-btn>
          <q-btn
            split
            flat
            @click="$emit('add-new', 'quickcomposer')"
            color="primary"
            class="new-btn"
          >
            <q-icon name="view_timeline" class="icon-with-badge" />
            <q-tooltip>新建命令（可视化编排）</q-tooltip>
          </q-btn>
          <!-- 菜单按钮 -->
          <q-btn
            stretch
            color="primary"
            flat
            id="menuBtn"
            icon="settings"
            :style="{ height: height }"
          >
            <ConfigurationMenu />
          </q-btn>
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<script>
import ConfigurationMenu from "components/menu";
import { useCommandManager } from "js/commandManager.js";

export default {
  name: "FooterBar",
  components: {
    ConfigurationMenu,
  },
  props: {
    height: {
      type: String,
      default: "40px",
    },
    left: {
      type: String,
      required: true,
    },
  },
  emits: ["add-new"],
  computed: {
    commandSearchKeyword() {
      return this.commandManager.state.commandSearchKeyword;
    },
    currentTag() {
      return this.commandManager.state.currentTag;
    },
    allQuickCommandTags: {
      get() {
        return this.commandManager.state.allQuickCommandTags;
      },
      set(value) {
        this.commandManager.state.allQuickCommandTags = value;
      },
    },
  },
  data() {
    return {
      commandManager: useCommandManager(),
      isDarkMode: this.$q.dark.isActive,
      isDev: utools.isDev(),
      lastTag: "",
    };
  },
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle();
      this.isDarkMode = this.$q.dark.isActive;
    },
    goShareCenter() {
      utools.shellOpenExternal("https://qc.qaz.ink/");
    },
    // 搜索方法
    updateSearch(value) {
      this.commandManager.state.commandSearchKeyword = value;
      // 记录当前标签页
      let searchTagName = "搜索结果";
      if (this.currentTag !== searchTagName) this.lastTag = this.currentTag;
      if (this.commandSearchKeyword?.length > 1) {
        if (!this.allQuickCommandTags.includes(searchTagName))
          this.allQuickCommandTags.push(searchTagName);
        // 搜索时跳转到搜索结果标签
        this.commandManager.changeCurrentTag(searchTagName);
      } else {
        // 清空搜索回跳到之前标签
        if (this.allQuickCommandTags.slice(-1)[0] === searchTagName)
          this.allQuickCommandTags.pop();
        if (this.currentTag !== this.lastTag)
          this.commandManager.changeCurrentTag(this.lastTag);
      }
    },
  },
};
</script>

<style scoped>
.footer-bar {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: left;
}

/* 底栏输入框样式 */
.q-field__control {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 4px;
}

:deep(.body--dark) .q-field__control {
  background: rgba(0, 0, 0, 0.2) !important;
}

/* 底栏毛玻璃效果 */
:deep(body.glass-effect-menu) .footer-bar {
  background: rgba(
    255,
    255,
    255,
    calc(0.15 + var(--glass-effect-strength) * 0.01)
  ) !important;
  backdrop-filter: blur(calc(var(--glass-effect-strength) * 1px)) !important;
  -webkit-backdrop-filter: blur(
    calc(var(--glass-effect-strength) * 1px)
  ) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(body.body--dark.glass-effect-menu) .footer-bar {
  background: rgba(
    0,
    0,
    0,
    calc(0.2 + var(--glass-effect-strength) * 0.02)
  ) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 按钮动画 */
.share-btn,
.new-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-btn:hover,
.new-btn:hover {
  transform: translateY(-2px);
  background: rgba(var(--q-primary-rgb), 0.1) !important;
}

.q-field--focused .q-field__prepend .q-icon {
  animation: shake 0.8s ease;
  color: var(--q-primary);
}

/* 图标角标样式 */
.icon-with-badge {
  position: relative;
}

.icon-with-badge::after {
  content: "+";
  position: absolute;
  right: 4px;
  transform: translate(50%, 50%);
  background-color: var(--q-primary);
  color: white;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: grid;
  place-items: center;
  font-family: monospace;
  line-height: 0;
}

.search-input {
  margin-left: 4px;
}

.search-input :deep(.q-field--filled .q-field__control),
.search-input :deep(.q-field--filled .q-field__control *) {
  border-radius: 5px 0 0 5px;
  min-height: 40px;
}

.btn-group {
  border-radius: 0;
}
</style>
