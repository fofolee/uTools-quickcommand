<template>
  <div
    class="absolute-full"
    :style="{
      background: $q.dark.isActive ? 'var(--q-dark-page)' : '#ffffff',
      overflow: 'hidden',
    }"
  >
    <!-- 命令设置栏 -->
    <CommandSideBar
      ref="sidebar"
      :canCommandSave="canCommandSave"
      :quickcommandInfo="quickcommandInfo"
      class="absolute-left shadow-10"
      :style="{
        width: sideBarWidth + 'px',
        zIndex: 1,
        transition: '0.3s',
      }"
      v-if="showSidebar"
    ></CommandSideBar>
    <!-- 编程语言栏 -->
    <div
      class="absolute-top"
      :style="{
        left: showSidebar ? sideBarWidth + 'px' : 65,
        zIndex: 1,
      }"
    >
      <div class="row" v-show="languageBarHeight">
        <div class="col-auto flex">
          <q-btn
            v-if="!isRunCodePage"
            flat
            dense
            color="primary"
            :style="{
              background: $q.dark.isActive
                ? 'rgba(255, 255, 255, 0.07)'
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '0',
            }"
            icon="menu"
            @click="toggleSideBarWidth"
            ><q-tooltip
              >{{ sideBarWidth ? "收起" : "展开" }}侧栏</q-tooltip
            ></q-btn
          >
        </div>
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
              label="编程语言"
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
                  :class="{
                    'text-negative': !!recording && index === 0,
                  }"
                  clickable
                  v-for="(item, index) in [
                    !!recording ? 'stop' : 'play_arrow',
                    'ads_click',
                    'help',
                  ]"
                  :key="index"
                  @click="
                    [
                      !!recording ? stopRecord : recordKeys,
                      showActions,
                      showHelp,
                    ][index]
                  "
                  v-show="quickcommandInfo.program === 'quickcommand'"
                >
                  <q-item-section avatar>
                    <q-icon :name="item" />
                  </q-item-section>
                  <q-item-section>{{
                    [
                      !!recording ? "停止录制" : "录制按键",
                      "快捷动作",
                      "查看文档",
                    ][index]
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
        <q-dialog v-model="isActionsShow"
          ><QuickAction @addAction="addAction" />
        </q-dialog>
      </div>
    </div>
    <MonacoEditor
      class="absolute-bottom"
      :placeholder="true"
      ref="editor"
      @typing="(val) => (quickcommandInfo.cmd = val)"
      :style="{
        top: languageBarHeight + 'px',
        left: this.action.type === 'run' ? 0 : this.sideBarWidth + 'px',
        transition: '0.3s',
      }"
    />
    <!-- 运行结果 -->
    <CommandRunResult :action="action" ref="result"></CommandRunResult>
  </div>
</template>

<script>
import MonacoEditor from "components/MonacoEditor";
import CommandSideBar from "components/CommandSideBar";
import CommandRunResult from "components/CommandRunResult";
import QuickAction from "components/popup/QuickAction";
const Mousetrap = require("mousetrap-record")(require("mousetrap"));

export default {
  components: { MonacoEditor, CommandSideBar, CommandRunResult, QuickAction },
  data() {
    return {
      programLanguages: Object.keys(this.$root.programs),
      sideBarWidth: 250,
      languageBarHeight: 40,
      canCommandSave: this.action.type === "code" ? false : true,
      isActionsShow: false,
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
      recording: null,
    };
  },
  props: {
    action: Object,
  },
  mounted() {
    this.init();
    this.$refs.sidebar?.init();
  },
  beforeUnmount() {
    !!this.recording && document.removeEventListener("keyup", this.recording);
    if (this.action.type !== "run") return;
    let command = _.cloneDeep(this.quickcommandInfo);
    command.cursorPosition = this.$refs.editor.getCursorPosition();
    this.$root.utools.putDB(
      command,
      this.$root.utools.DBPRE.CFG + "codeHistory"
    );
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
      );
    },
  },
  methods: {
    init() {
      let quickCommandInfo =
        this.action.type === "run"
          ? this.$root.utools.getDB(this.$root.utools.DBPRE.CFG + "codeHistory")
          : this.action.data;
      quickCommandInfo?.program &&
        Object.assign(this.quickcommandInfo, _.cloneDeep(quickCommandInfo));
      // monaco 相关
      this.$refs.editor.setEditorValue(this.quickcommandInfo.cmd);
      this.setLanguage(this.quickcommandInfo.program);
      this.$refs.editor.setCursorPosition(this.quickcommandInfo.cursorPosition);
      // 默认命令不可编辑
      if (this.quickcommandInfo.tags?.includes("默认") && !utools.isDev()) {
        this.canCommandSave = false;
      }
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
    recordKeys() {
      let keys = [];
      this.recording = (event) => {
        event.preventDefault();
        keys.push(
          event.code.includes("Key") ? event.code.slice(-1) : event.key
        );
        setTimeout(() => {
          this.$refs.editor.repacleEditorSelection(
            this.generatedKeyTapCode(this.keyAnalysis(keys.slice(0, 2)))
          );
          keys = [];
        }, 200);
      };
      document.addEventListener("keyup", this.recording);
    },
    stopRecord() {
      document.removeEventListener("keyup", this.recording);
      this.recording = null;
    },
    keyAnalysis(keys) {
      if (keys.length === 1) return keys;
      keys = keys.sort((x, y) => x.length - y.length);
      if (keys[1].length === 1) keys.pop();
      return keys;
    },
    generatedKeyTapCode(keys) {
      return `keyTap("${keys
        .join(", ")
        .replace("Meta", "command")
        .toLowerCase()}")\n`;
    },
    showActions() {
      this.isActionsShow = true;
    },
    addAction(payload) {
      this.$refs.editor.repacleEditorSelection(payload);
    },
    // 打开文档
    showHelp() {
      utools.createBrowserWindow("./helps/quickcommand.html", {
        width: 1280,
        height: 920,
      });
    },
    // 展开收起侧栏
    toggleSideBarWidth() {
      if (this.sideBarWidth) {
        this.lastSideBarWidth = this.sideBarWidth;
        this.sideBarWidth = 0;
      } else {
        this.sideBarWidth = this.lastSideBarWidth;
        this.lastSideBarWidth = 0;
      }
    },
    // 保存
    saveCurrentCommand() {
      let updatedData = this.$refs.sidebar?.SaveMenuData();
      if (!updatedData) return;
      Object.assign(this.quickcommandInfo, _.cloneDeep(updatedData));
      let newQuickcommandInfo = _.cloneDeep(this.quickcommandInfo);
      this.$root.utools.putDB(
        newQuickcommandInfo,
        this.$root.utools.DBPRE.QC + this.quickcommandInfo.features.code
      );
      this.$emit("editorEvent", {
        type: "save",
        data: newQuickcommandInfo,
      });
    },
    // 运行
    runCurrentCommand() {
      let command = _.cloneDeep(this.quickcommandInfo);
      command.output = this.$refs.sidebar?.currentCommand.output || "text";
      command.cmdType = this.$refs.sidebar?.cmdType.name;
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
