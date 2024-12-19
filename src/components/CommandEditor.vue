<template>
  <div class="absolute-full container" style="overflow: hidden">
    <!-- 命令设置栏 -->
    <CommandSideBar
      ref="sidebar"
      :canCommandSave="canCommandSave"
      :quickcommandInfo="quickcommandInfo"
      class="absolute-left shadow-10"
      :style="{
        width: sideBarWidth + 'px',
        zIndex: 1,
        transform: isFullscreen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
      :sideBarWidth="sideBarWidth"
      v-if="showSidebar"
    ></CommandSideBar>

    <!-- 编程语言栏 -->
    <div
      class="absolute-top"
      :style="{
        left: showSidebar ? sideBarWidth + 'px' : 65,
        zIndex: 1,
        transform: isFullscreen ? 'translateY(-100%)' : 'translateY(0)',
        opacity: isFullscreen ? 0 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
    >
      <div class="row" v-show="!!languageBarHeight">
        <!-- 去掉收起侧栏功能，处理侧栏宽度变化时，Monaco调整大小导致ResizeObserver loop limit exceeded错误 -->
        <!-- <div class="col-auto flex">
          <q-btn v-if="!isRunCodePage" flat dense color="primary" class="menuBtn" icon="menu"
            @click="toggleSideBarWidth"><q-tooltip>{{ !!sideBarWidth ? "收起" : "展开" }}侧栏</q-tooltip></q-btn>
        </div> -->
        <div class="col">
          <div>
            <q-select
              dense
              standout="bg-primary text-white"
              square
              hide-bottom-space
              color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              @update:model-value="programChanged"
              v-model="quickcommandInfo.program"
              :options="programLanguages"
              label="环境"
            >
              <template v-slot:append>
                <q-avatar size="lg" square>
                  <img :src="$root.programs[quickcommandInfo.program].icon" />
                </q-avatar>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <img width="32" :src="$root.programs[scope.opt].icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <q-separator vertical />
        <div class="col-auto justify-end flex">
          <q-btn-group unelevated>
            <q-btn-dropdown
              v-show="quickcommandInfo.program !== 'html'"
              style="padding: 0 10px"
              dense
              flat
              ref="settings"
              color="primary"
              :icon="
                quickcommandInfo.program === 'quickcommand'
                  ? 'insights'
                  : 'settings'
              "
            >
              <q-list>
                <!-- quickcommand系列按键 -->
                <q-item
                  clickable
                  v-for="(item, index) in ['keyboard', 'ads_click', 'help']"
                  :key="index"
                  @click="
                    [
                      () => (showRecorder = true),
                      () => (showActions = true),
                      showHelp,
                    ][index]
                  "
                  v-show="quickcommandInfo.program === 'quickcommand'"
                >
                  <q-item-section avatar>
                    <q-icon :name="item" />
                  </q-item-section>
                  <q-item-section>{{
                    ["录制按键", "快捷动作", "查看文档"][index]
                  }}</q-item-section>
                </q-item>
                <!-- 自定义解释器 -->
                <q-item
                  v-for="(item, index) in Object.keys(
                    quickcommandInfo.customOptions
                  )"
                  :key="index"
                  v-show="quickcommandInfo.program === 'custom'"
                >
                  <q-input
                    stack-label
                    autofocus
                    dense
                    outlined
                    class="full-width"
                    @blur="matchLanguage"
                    :label="
                      [
                        '解释器路径，如：/opt/python',
                        '运行参数，如：-u',
                        '脚本后缀，不含点，如：py',
                      ][index]
                    "
                    v-model="quickcommandInfo.customOptions[item]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="code" />
                    </template>
                  </q-input>
                </q-item>
                <!-- 脚本参数 -->
                <q-item v-show="quickcommandInfo.program !== 'quickcommand'">
                  <q-input
                    dense
                    stack-label
                    outlined
                    label="脚本参数"
                    class="full-width"
                    v-model="quickcommandInfo.scptarg"
                  >
                    <template v-slot:prepend>
                      <q-icon name="input" />
                    </template>
                  </q-input>
                </q-item>
                <!-- 编码设置 -->
                <q-item
                  v-for="(item, index) in Object.keys(quickcommandInfo.charset)"
                  :key="index"
                  v-show="quickcommandInfo.program !== 'quickcommand'"
                >
                  <q-select
                    dense
                    outlined
                    stack-label
                    clearable
                    class="full-width"
                    :label="['脚本编码', '输出编码'][index]"
                    v-model="quickcommandInfo.charset[item]"
                    :options="['GBK', 'utf8', 'Big5']"
                    type="text"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="['format_size', 'output'][index]" />
                    </template>
                  </q-select>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-separator vertical inset />
            <q-btn
              style="padding: 0 10px"
              dense
              flat
              color="primary"
              icon="play_arrow"
              label="运行"
              @click="runCurrentCommand()"
            ></q-btn>
            <q-btn
              flat
              style="padding: 0 10px"
              dense
              v-if="!isRunCodePage"
              :disable="!canCommandSave"
              :color="canCommandSave ? 'primary' : 'grey'"
              icon="save"
              label="保存"
              @click="saveCurrentCommand()"
            ></q-btn>
          </q-btn-group>
        </div>
        <q-dialog v-model="showActions">
          <QuickAction @addAction="insertText" />
        </q-dialog>
        <q-dialog v-model="showRecorder" position="bottom">
          <KeyRecorder @sendKeys="insertText" />
        </q-dialog>
      </div>
    </div>

    <!-- 编辑器 -->
    <MonacoEditor
      class="editor-transition"
      :placeholder="true"
      ref="editor"
      @loaded="monacoInit"
      @typing="(val) => monacoTyping(val)"
      @keyStroke="monacoKeyStroke"
      :style="{
        position: 'absolute',
        top: isFullscreen ? 0 : languageBarHeight + 'px',
        left: isFullscreen
          ? 0
          : action.type === 'run'
          ? 0
          : sideBarWidth + 'px',
        right: 0,
        bottom: 0,
      }"
    />

    <!-- 编辑器工具按钮组 -->
    <div class="editor-tools">
      <!-- 历史记录组件 -->
      <EditorHistory
        ref="history"
        :commandCode="quickcommandInfo?.features?.code || 'temp'"
        @restore="restoreHistory"
      />

      <!-- 全屏按钮 -->
      <q-btn
        round
        dense
        :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="toggleFullscreen"
        class="fullscreen-btn"
        :class="{ 'btn-fullscreen': isFullscreen }"
      >
        <q-tooltip>{{
          isFullscreen ? "退出全屏 (F11)" : "全屏编辑 (F11)"
        }}</q-tooltip>
      </q-btn>
    </div>

    <!-- 运行结果 -->
    <CommandRunResult :action="action" ref="result"></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import CommandSideBar from "components/CommandSideBar";
import CommandRunResult from "components/CommandRunResult";
import QuickAction from "components/popup/QuickAction";
import KeyRecorder from "components/popup/KeyRecorder";
import EditorHistory from "components/popup/EditorHistory.vue";
// Performance Scripting > 500ms
const MonacoEditor = defineAsyncComponent(() =>
  import("components/MonacoEditor")
);

const defaultSideBarWidth = 200;
const defaultlanguageBarHeight = 40;

export default {
  components: {
    MonacoEditor,
    CommandSideBar,
    CommandRunResult,
    QuickAction,
    KeyRecorder,
    EditorHistory,
  },
  data() {
    return {
      programLanguages: Object.keys(this.$root.programs),
      sideBarWidth: defaultSideBarWidth,
      languageBarHeight: defaultlanguageBarHeight,
      canCommandSave: this.action.type === "code" ? false : true,
      showActions: false,
      showRecorder: false,
      quickcommandInfo: {
        program: "quickcommand",
        cmd: "",
        scptarg: "",
        charset: {
          scriptCode: "",
          outputCode: "",
        },
        customOptions: {
          bin: "",
          argv: "",
          ext: "",
        },
      },
      resultMaxLength: 10000,
      showSidebar: this.action.type !== "run",
      isRunCodePage: this.action.type === "run",
      listener: null,
      isFullscreen: false,
    };
  },
  props: {
    action: Object,
  },
  created() {
    this.commandInit();
  },
  mounted() {
    this.sidebarInit();
  },
  computed: {
    configurationPage() {
      return this.$root.$refs.view;
    },
    allQuickCommandTags() {
      return _.without(
        this.configurationPage.allQuickCommandTags,
        "默认",
        "未分类",
        "搜索结果"
        // "来自分享"
      );
    },
  },
  methods: {
    // 命令初始化
    commandInit() {
      let quickCommandInfo =
        this.action.type === "run"
          ? this.$root.utools.getDB("cfg_codeHistory")
          : this.action.data;
      quickCommandInfo?.program &&
        Object.assign(this.quickcommandInfo, _.cloneDeep(quickCommandInfo));
      // 默认命令编辑
      if (this.quickcommandInfo.tags?.includes("默认") && !utools.isDev()) {
        this.canCommandSave = false;
      }
    },
    // 侧边栏初始化
    sidebarInit() {
      this.$refs.sidebar?.init();
    },
    // Monaco编辑器初始化，Monaco异步加载完执行
    monacoInit() {
      this.$refs.editor.setEditorValue(this.quickcommandInfo.cmd);
      this.setLanguage(this.quickcommandInfo.program);
      this.$refs.editor.setCursorPosition(this.quickcommandInfo.cursorPosition);

      // 等待编辑器内容加载完成后再保存
      setTimeout(() => {
        this.saveToHistory();
      }, 1000); // 给予足够的时间让编辑器载完成
    },
    programChanged(value) {
      this.setLanguage(value);
      if (value === "custom") this.$refs.settings.show();
      this.$refs.sidebar?.setIcon(value);
    },
    // 匹配编程语言
    matchLanguage() {
      if (!this.quickcommandInfo.customOptions.ext) return;
      let language = Object.values(this.$root.programs).filter(
        (program) => program.ext === this.quickcommandInfo.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    // 设置编程语言
    setLanguage(language) {
      let highlight = this.$root.programs[language].highlight;
      this.$refs.editor.setEditorLanguage(highlight ? highlight : language);
    },
    insertText(text) {
      this.$refs.editor.repacleEditorSelection(text);
    },
    // 打开文档
    showHelp() {
      window.showUb.docs();
    },
    // 展开收起栏
    toggleSideBarWidth() {
      this.sideBarWidth = !!this.sideBarWidth ? 0 : defaultSideBarWidth;
    },
    // 保存
    saveCurrentCommand(config = { silent: false }) {
      let updatedData = this.$refs.sidebar?.SaveMenuData();
      if (!updatedData) return;
      Object.assign(this.quickcommandInfo, _.cloneDeep(updatedData));
      let newQuickcommandInfo = _.cloneDeep(this.quickcommandInfo);
      this.$root.utools.putDB(
        newQuickcommandInfo,
        "qc_" + this.quickcommandInfo.features.code
      );
      this.$emit("editorEvent", {
        type: "save",
        data: newQuickcommandInfo,
      });
      if (!config.silent) {
        this.saveToHistory(); // 保存时记录历史
      }
    },
    // 运行
    runCurrentCommand(cmd) {
      this.saveToHistory(); // 运行时保存
      let command = _.cloneDeep(this.quickcommandInfo);
      if (cmd) command.cmd = cmd;
      command.output =
        this.$refs.sidebar?.currentCommand.output ||
        (command.program === "html" ? "html" : "text");
      command.cmdType = this.$refs.sidebar?.cmdType.name;
      this.$refs.result.runCurrentCommand(command);
    },
    saveCodeHistory() {
      if (this.action.type !== "run") return;
      let command = _.cloneDeep(this.quickcommandInfo);
      command.cursorPosition = this.$refs.editor.getCursorPosition();
      this.$root.utools.putDB(command, "cfg_codeHistory");
    },
    monacoTyping(val) {
      this.quickcommandInfo.cmd = val;
    },
    monacoKeyStroke(event, data) {
      switch (event) {
        case "run":
          this.runCurrentCommand();
          break;
        case "save":
          this.saveCurrentCommand();
          break;
        case "log":
          if (this.quickcommandInfo.program !== "quickcommand") return;
          this.runCurrentCommand(`console.log(${data})`);
          break;
        case "fullscreen":
          this.toggleFullscreen();
          break;
        default:
          break;
      }
    },
    getFullscreenScale() {
      const currentWidth = window.innerWidth - this.sideBarWidth;
      const currentHeight = window.innerHeight - this.languageBarHeight;
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;

      const scaleX = fullWidth / currentWidth;
      const scaleY = fullHeight / currentHeight;

      return Math.max(scaleX, scaleY);
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;

      // 重新布局编辑器
      setTimeout(() => {
        this.$refs.editor.resizeEditor();
      }, 300);
    },
    showHistory() {
      this.$refs.history.open();
    },
    saveToHistory() {
      this.$refs.history.tryToSave(
        this.$refs.editor.getEditorValue(),
        this.quickcommandInfo.program
      );
    },
    restoreHistory(item) {
      // 保存当前内容
      this.saveToHistory();

      // 恢复历史内容
      this.$refs.editor.setEditorValue(item.content);
    },
  },
};
</script>

<style scoped>
.menuBtn {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0;
}

.body--dark .menuBtn {
  background: rgba(255, 255, 255, 0.07);
}

.fullscreen-btn {
  z-index: 1000;
  transform-origin: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fullscreen-btn:hover {
  transform: scale(1.1) translateY(-2px);
}

.fullscreen-btn:active {
  transform: scale(0.95);
  transition-duration: 0.1s;
}

.btn-fullscreen {
  transform: rotate(180deg);
}

.btn-fullscreen:hover {
  transform: rotate(180deg) scale(1.1);
}

.body--dark .fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #bbb;
}

.body--dark .fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 统一过渡效果 */
.sidebar-transition,
.language-bar-transition,
.editor-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, left, top, opacity;
}

.editor-container {
  position: relative;
  overflow: hidden;
}

.editor-wrapper {
  position: absolute;
  right: 0;
  bottom: 0;
  height: auto;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}

.editor-fullscreen {
  left: 0 !important;
  top: 0 !important;
  z-index: 2;
}

.editor-transition {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, left, top, opacity;
}

.editor-tools {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.isFullscreen .editor-tools {
  right: 32px;
  bottom: 32px;
}
</style>
