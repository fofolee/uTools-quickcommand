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
            <q-input
              dense
              standout="bg-primary text-white"
              square
              stack-label
              color="primary"
              input-style="width: 60px;"
              v-model="quickcommandInfo.scptarg"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              label="脚本参数"
            />
            <q-btn
              dense
              flat
              color="primary"
              icon="help"
              @click="showHelp"
              v-show="quickcommandInfo.program === 'quickcommand'"
              ><q-tooltip>查看文档</q-tooltip></q-btn
            >
            <q-btn
              flat
              dense
              color="primary"
              icon="code"
              @click="showCustomOptions"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              ><q-tooltip>自定义解释器路径</q-tooltip></q-btn
            >
            <q-btn
              flat
              dense
              color="primary"
              icon="format_size"
              @click="showCodingPage()"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              ><q-tooltip>脚本及输出编码设置</q-tooltip></q-btn
            >
            <q-separator vertical inset />
            <q-btn
              dense
              flat
              color="primary"
              icon="play_arrow"
              label="运行"
              @click="runCurrentCommand()"
            ></q-btn>
            <q-btn
              flat
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

export default {
  components: { MonacoEditor, CommandSideBar, CommandRunResult },
  data() {
    return {
      programLanguages: Object.keys(this.$root.programs),
      sideBarWidth: 250,
      languageBarHeight: 40,
      canCommandSave: this.action.type === "code" ? false : true,
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
      this.$refs.sidebar?.setIcon(value);
    },
    // 匹配编程语言
    matchLanguage() {
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
    // 打开文档
    showHelp() {
      utools.createBrowserWindow("./helps/quickcommand.html", {
        width: 1280,
        height: 920,
      });
    },
    // 编码设置页面
    showCodingPage() {
      quickcommand
        .showInputBox(
          {
            labels: ["文件编码", "输出编码"],
            hints: [
              "GBK/Big5/utf8，无乱码请留空",
              "GBK/Big5/utf8,无乱码请留空",
            ],
            values: [
              this.quickcommandInfo.charset?.scriptCode,
              this.quickcommandInfo.charset?.outputCode,
            ],
          },
          "编码设置"
        )
        .then((res) => {
          if (res)
            [
              this.quickcommandInfo.charset.scriptCode,
              this.quickcommandInfo.charset.outputCode,
            ] = res;
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
    // 自定义解释器路径界面
    showCustomOptions() {
      quickcommand
        .showInputBox(
          {
            labels: ["解释器路径", "解释器参数", "脚本后缀"],
            hints: [
              "绝对路径，如：/home/.bin/python",
              "运行参数，如：-u",
              "脚本的后缀，不含点，如：py",
            ],
            values: [
              this.quickcommandInfo.customOptions?.bin,
              this.quickcommandInfo.customOptions?.argv,
              this.quickcommandInfo.customOptions?.ext,
            ],
          },
          "自定义解释器路径"
        )
        .then((res) => {
          if (res)
            [
              this.quickcommandInfo.customOptions.bin,
              this.quickcommandInfo.customOptions.argv,
              this.quickcommandInfo.customOptions.ext,
            ] = res;
          this.matchLanguage(this.quickcommandInfo.customOptions.ext);
        });
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
