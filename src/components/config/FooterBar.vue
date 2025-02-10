<template>
  <div
    class="absolute-bottom footer-bar"
    :style="{ height: height, left: left }"
  >
    <div class="row">
      <!-- 搜索栏 -->
      <div class="col">
        <q-input
          :model-value="searchKeyword"
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
        <q-btn-group>
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
            @click="$emit('add-new', 'CommandEditor')"
            color="primary"
            class="new-btn"
          >
            <q-icon name="code" class="icon-with-badge" />
            <q-tooltip>新建命令（直接编写脚本）</q-tooltip>
          </q-btn>
          <q-btn
            split
            flat
            @click="$emit('add-new', 'ComposerEditor')"
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
            <ConfigurationMenu
              :isTagStared="isTagStared"
              :currentTag="currentTag"
            />
          </q-btn>
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<script>
import ConfigurationMenu from "components/menu";

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
    isTagStared: {
      type: Boolean,
      required: true,
    },
    currentTag: {
      type: String,
      required: true,
    },
    searchKeyword: {
      type: String,
      default: "",
    },
  },
  emits: ["update:search", "add-new"],
  data() {
    return {
      isDarkMode: this.$q.dark.isActive,
      isDev: utools.isDev(),
    };
  },
  methods: {
    updateSearch(value) {
      this.$emit("update:search", value);
    },
    toggleDarkMode() {
      this.$q.dark.toggle();
      this.isDarkMode = this.$q.dark.isActive;
    },
    goShareCenter() {
      utools.shellOpenExternal("https://qc.qaz.ink/");
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

/* 搜索框动画 */
@keyframes searchIconShake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.q-field--focused .q-field__prepend .q-icon {
  animation: searchIconShake 0.8s ease;
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
</style>
