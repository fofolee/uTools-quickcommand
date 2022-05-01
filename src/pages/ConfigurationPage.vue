<template>
  <div class="relative">
    <!-- 标签栏 -->
    <!-- 面板视图不显示标签栏 -->
    <div
      v-show="commandCardStyle !== 'mini'"
      class="absolute-left"
      :style="{
        width: tabBarWidth,
        zIndex: 1,
        overflow: 'hidden',
      }"
    >
      <q-tabs
        v-model="currentTag"
        vertical
        outside-arrows
        class="text-primary"
        :key="$root.profile.denseTagBar"
        :dense="$root.profile.denseTagBar"
      >
        <!-- 所有标签 -->
        <q-tab
          v-for="tag in allQuickCommandTags"
          :key="tag"
          :name="tag"
          :content-class="
            tag === '搜索结果' || activatedQuickPanels.includes(tag)
              ? 'text-blue-7 text-weight-bolder'
              : ''
          "
        >
          {{ tag }}
          <q-tooltip v-if="tag === '未分类'">
            所有没有添加标签的命令都会归在未分类 <br />
            可以在新建命令时在标签一栏选择或直接键入标签名来添加标签
          </q-tooltip>
        </q-tab>
      </q-tabs>
    </div>
    <!-- 面板栏 -->
    <q-tab-panels
      animated
      class="absolute-right"
      :style="{
        bottom: footerBarHeight,
        left: tabBarWidth,
        background:
          commandCardStyle === 'mini' && $root.profile.backgroundImg
            ? `url('${$root.profile.backgroundImg}')`
            : 'none',
        backgroundSize: 'cover',
      }"
      v-model="currentTag"
      transition-prev="slide-down"
      transition-next="slide-up"
      swipeable
      vertical
    >
      <q-tab-panel
        style="padding: 0"
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :name="tag"
      >
        <q-scroll-area
          style="height: 100%"
          :thumb-style="{
            background: 'grey',
            width: '6px',
            opacity: 0.5,
          }"
        >
          <div class="row center q-pa-xs">
            <CommandCard
              v-for="commandInfo in currentTagQuickCommands"
              :key="commandInfo.features.code"
              :commandInfo="commandInfo"
              :isCommandActivated="
                activatedQuickCommandFeatureCodes.includes(
                  commandInfo.features.code
                )
              "
              :cardStyle="commandCardStyleSheet[commandCardStyle]"
              @commandChanged="commandChanged"
              :style="{
                width: commandCardStyleSheet[commandCardStyle].width,
              }"
              class="relative-position q-pa-sm"
            ></CommandCard>
          </div>
        </q-scroll-area>
      </q-tab-panel>
    </q-tab-panels>
    <!-- 底栏 -->
    <div
      class="absolute-bottom"
      :style="{
        height: footerBarHeight,
        left: tabBarWidth,
      }"
    >
      <div class="row">
        <!-- 搜索栏 -->
        <div class="col">
          <q-input
            v-model="commandSearchKeyword"
            debounce="200"
            filled
            dense
            :autofocus="$root.profile.autofocusSearch"
            @update:model-value="updateSearch"
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
            <!-- 切换视图 -->
            <q-btn-toggle
              v-model="commandCardStyle"
              @click="$root.profile.commandCardStyle = commandCardStyle"
              toggle-color="primary"
              flat
              :options="[
                { slot: 'normal', value: 'normal' },
                { slot: 'dense', value: 'dense' },
                { slot: 'mini', value: 'mini' },
              ]"
            >
              <template v-slot:normal>
                <q-icon name="dashboard" />普通
                <q-tooltip>按两列排列的基础视图</q-tooltip>
              </template>
              <template v-slot:dense>
                <q-icon name="apps" />紧凑
                <q-tooltip
                  >按三列排列的紧凑视图，但不会显示适用的操作系统</q-tooltip
                >
              </template>
              <template v-slot:mini>
                <q-icon name="view_comfy" />面板
                <q-tooltip
                  >按四列排列的面板视图<br />
                  老版本的「快捷面板」已被弃用，取而代之的是新版的「面板视图」<br />
                  注意：<br />
                  1.未启用、匹配类型为窗口的命令在此视图下不显示<br />
                  2.只显示图标、描述和匹配类型<br />
                  3.点击卡片时会直接运行命令而不是编辑命令</q-tooltip
                >
              </template>
            </q-btn-toggle>
            <q-separator vertical />
            <!-- 新建按钮 -->
            <q-btn
              split
              flat
              @click="addNewCommand"
              color="primary"
              label="新建"
              icon="add"
            />
            <q-separator vertical />
            <!-- 下拉菜单 -->
            <q-btn color="primary" flat size="xs"
              ><q-spinner-bars color="primary" size="1.5em" />
              <ConfigurationMenu
                :isTagStared="activatedQuickPanels.includes(currentTag)"
                :currentTag="currentTag"
              ></ConfigurationMenu>
            </q-btn>
          </q-btn-group>
        </div>
      </div>
    </div>
    <!-- 命令编辑界面 -->
    <q-dialog
      v-model="isCommandEditorShow"
      persistent
      maximized
      :transition-show="newCommandDirect ? '' : 'slide-up'"
      transition-hide="slide-down"
      style="overflow: hidden"
    >
      <CommandEditor
        ref="commandEditor"
        :action="commandEditorAction"
        @editorEvent="editorEvent"
      ></CommandEditor>
    </q-dialog>
    <CommandRunResult
      :action="{ type: 'config' }"
      ref="result"
    ></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import quickcommandParser from "../js/common/quickcommandParser.js";
import CommandCard from "components/CommandCard";
import ConfigurationMenu from "components/ConfigurationMenu.vue";
import CommandRunResult from "components/CommandRunResult.vue";
import importAll from "../js/common/importAll.js";
import pinyinMatch from "pinyin-match";

const CommandEditor = defineAsyncComponent(() =>
  import("components/CommandEditor.vue")
);

// 默认命令
let defaultCommands = importAll(require.context("../json/", false, /\.json$/));

export default {
  components: {
    CommandCard,
    ConfigurationMenu,
    CommandEditor,
    CommandRunResult,
  },
  data() {
    return {
      currentTag: "默认",
      lastTag: "",
      activatedQuickCommandFeatureCodes: [],
      activatedQuickPanels: [],
      allQuickCommands: [],
      commandSearchKeyword: "",
      isCommandEditorShow: false,
      commandEditorAction: {},
      footerBarHeight: "40px",
      commandCardStyle: this.$root.profile.commandCardStyle,
      commandCardStyleSheet: {
        mini: {
          width: "20%",
          code: 1,
        },
        dense: {
          width: "33%",
          code: 2,
        },
        normal: {
          width: "50%",
          code: 3,
        },
        large: {
          width: "100%",
          code: 4,
        },
      },
    };
  },
  computed: {
    // 当前标签下的所有快捷命令
    currentTagQuickCommands() {
      let commands = Object.values(_.cloneDeep(this.allQuickCommands));
      switch (this.currentTag) {
        case "未分类":
          return commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0);
        case "来自分享":
          return commands.filter((cmd) => cmd.fromShare);
        case "搜索结果":
          if (this.commandSearchKeyword?.length < 2) return;
          let searchResult = [];
          commands.forEach((cmd) => {
            // 拼音搜索
            let explain = cmd.features.explain;
            let matchedWordPositions = pinyinMatch.match(
              explain,
              this.commandSearchKeyword
            );
            if (!matchedWordPositions) return;
            let matchedWords = explain.slice(
              matchedWordPositions[0],
              matchedWordPositions[1] + 1
            );
            // 高亮
            cmd.features.explain = explain.replace(
              matchedWords,
              `<strong style="color:#ed6237">${matchedWords}</strong>`
            );
            searchResult.push(cmd);
          });
          return searchResult;
        default:
          return commands.filter((cmd) => cmd.tags?.includes(this.currentTag));
      }
    },
    // 所有命令对应的标签
    allQuickCommandTags() {
      let allTags = _.union(
        ..._.concat(
          "默认",
          Object.values(this.allQuickCommands).map((x) => x.tags)
        )
      ).concat(["未分类", "来自分享"]);
      if (this.commandSearchKeyword?.length > 1) allTags.push("搜索结果");
      return allTags;
    },
    // 标签栏宽度
    tabBarWidth() {
      return this.commandCardStyle === "mini" ? "0" : "80px";
    },
    newCommandDirect() {
      return this.$route.name === "newcommand";
    },
  },
  mounted() {
    this.initPage();
  },
  methods: {
    // 初始化
    initPage() {
      // 如果从 newcommand 进入则直接新建命令
      if (this.newCommandDirect) {
        if (this.$root.enterData.type === "text") this.addNewCommand();
        else this.editCommand(JSON.parse(this.$root.enterData.payload));
        this.$router.push("/configuration");
      }
      // 已启用的 features
      let activatedFeatures = this.getActivatedFeatures();
      // 已启用的命令的 featureCode
      this.activatedQuickCommandFeatureCodes =
        activatedFeatures.quickcommand.map((f) => f.code);
      // 已启用的面板
      this.activatedQuickPanels = activatedFeatures.quickpanels;
      // 所有的快捷命令
      this.allQuickCommands = this.getAllQuickCommands();
      this.importDefaultCommands();
      if (this.$route.params.tags) {
        this.currentTag = window.hexDecode(this.$route.params.tags);
        this.commandCardStyle = "mini";
      }
    },
    importDefaultCommands() {
      for (var code of Object.keys(defaultCommands)) {
        this.$root.utools.putDB(
          defaultCommands[code],
          this.$root.utools.DBPRE.QC + code
        );
      }
      Object.assign(this.allQuickCommands, defaultCommands);
    },
    // 获取所有已启用的命令的 features 以及面板名称
    getActivatedFeatures() {
      let features = utools.getFeatures();
      let currentFts = [];
      let quickpanels = [];
      features.forEach((x) =>
        x.code.slice(0, 6) == "panel_"
          ? quickpanels.push(window.hexDecode(x.code.slice(6)))
          : currentFts.push(x)
      );
      return {
        quickcommand: currentFts,
        quickpanels: quickpanels,
      };
    },
    // 获取所有的快捷命令（导出的格式）
    getAllQuickCommands() {
      let allQcs = {};
      this.$root.utools
        .getDocs(this.$root.utools.DBPRE.QC)
        .forEach((x) => (allQcs[x.data.features.code] = x.data));
      return allQcs;
    },
    // 监听命令变更事件
    commandChanged(event) {
      switch (event.type) {
        case "remove":
          this.removeCommand(event.data);
          return;
        case "enable":
          this.enableCommand(event.data);
          return;
        case "disable":
          this.disableCommand(event.data);
          return;
        case "edit":
          this.editCommand(event.data);
          return;
        case "run":
          this.runCommand(event.data);
          return;
        default:
          return;
      }
    },
    runCommand(code) {
      this.$refs.result.runCurrentCommand(
        _.cloneDeep(this.allQuickCommands[code])
      );
    },
    // 启用命令
    enableCommand(code) {
      this.$root.utools.whole.setFeature(
        _.cloneDeep(this.allQuickCommands[code].features)
      );
      this.activatedQuickCommandFeatureCodes.push(code);
    },
    // 禁用命令
    disableCommand(code) {
      this.$root.utools.whole.removeFeature(code);
      this.activatedQuickCommandFeatureCodes =
        this.activatedQuickCommandFeatureCodes.filter((x) => x !== code);
    },
    // 删除命令
    removeCommand(code) {
      utools.copyText(JSON.stringify(this.allQuickCommands[code], null, 4));
      delete this.allQuickCommands[code];
      this.$root.utools.delDB(this.$root.utools.DBPRE.QC + code);
      this.disableCommand(code);
      if (!this.allQuickCommandTags.includes(this.currentTag))
        this.currentTag = "默认";
      quickcommand.showMessageBox(
        "删除成功，为防止误操作，已将删除的命令复制到剪贴板"
      );
    },
    // 编辑命令
    editCommand(command) {
      // 即可传入 code，也可直接传入 command
      if (typeof command === "string") command = this.allQuickCommands[command];
      this.commandEditorAction = {
        type: "edit",
        data: _.cloneDeep(command),
      };
      this.isCommandEditorShow = true;
    },
    // 从文件导入命令
    importCommandFromFile() {
      let options = {
        type: "dialog",
        argvs: { filters: [{ name: "json", extensions: ["json"] }] },
        readfile: true,
      };
      let fileContent = window.getFileInfo(options);
      return fileContent ? fileContent.data : false;
    },
    // 从剪贴板导入命令
    importCommandFromClipboard() {
      return window.clipboardReadText();
    },
    // 导入命令
    importCommand(fromFile = true) {
      let quickCommandInfo = fromFile
        ? this.importCommandFromFile()
        : this.importCommandFromClipboard();
      if (!quickCommandInfo)
        return quickcommand.showMessageBox("导入未完成！", "warning");
      let parsedData = quickcommandParser(quickCommandInfo);
      if (!parsedData) return quickcommand.showMessageBox("格式错误", "error");
      // 单个命令导入
      let dataToPushed = {};
      if (parsedData.single) {
        dataToPushed[parsedData.qc.features.code] = parsedData.qc;
        // 多个
      } else {
        dataToPushed = parsedData.qc;
      }
      for (var code of Object.keys(dataToPushed)) {
        this.$root.utools.putDB(
          dataToPushed[code],
          this.$root.utools.DBPRE.QC + code
        );
      }
      Object.assign(this.allQuickCommands, dataToPushed);
      quickcommand.showMessageBox("导入成功！");
      this.locateToCommand(parsedData.qc.tags, parsedData.qc.features?.code);
    },
    // 定位命令
    locateToCommand(tags = ["默认"], code) {
      this.currentTag = !tags || !tags.length ? "未分类" : tags[0];
      if (!code) return;
      // 等待 dom 渲染
      this.$nextTick(() => {
        let el = document.getElementById(code);
        el.scrollIntoViewIfNeeded();
        // 闪一下
        el.style.filter = "drop-shadow(2px 4px 6px black)";
        el.style.transform = "translateY(-5px)";
        setTimeout(() => {
          el.style.filter = "";
          el.style.transform = "";
        }, 800);
      });
    },
    // 全部导出
    exportAllCommands(saveAsFile = true) {
      let options = {
        title: "选择保存位置",
        defaultPath: "quickCommand",
        filters: [
          {
            name: "json",
            extensions: ["json"],
          },
        ],
      };
      let commandsToExport = _.cloneDeep(this.allQuickCommands);
      // 不导出默认命令
      if (!utools.isDev())
        Object.keys(commandsToExport).forEach((code) => {
          if (code.includes("default_")) delete commandsToExport[code];
        });
      let stringifyCommands = JSON.stringify(commandsToExport);
      if (saveAsFile) {
        window.saveFile(stringifyCommands, options) &&
          quickcommand.showMessageBox("导出成功！");
      } else {
        utools.copyText(stringifyCommands);
      }
    },
    // 清空
    clearAllCommands() {
      quickcommand
        .showConfirmBox("将会清空所有自定义命令，请确认！")
        .then((isConfirmed) => {
          if (!isConfirmed)
            return quickcommand.showMessageBox("取消操作", "info");
          this.exportAllCommands(false);
          this.$root.utools
            .getDocs(this.$root.utools.DBPRE.QC)
            .map((x) => x._id)
            .forEach((y) => this.$root.utools.delDB(y));
          this.importDefaultCommands();
          this.clearAllFeatures();
          Object.keys(this.allQuickCommands).forEach((featureCode) => {
            if (!featureCode.includes("default_"))
              delete this.allQuickCommands[featureCode];
          });
          this.currentTag = "默认";
          quickcommand.showMessageBox(
            "清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复"
          );
        });
    },
    // 删除所有 features
    clearAllFeatures() {
      for (var feature of utools.getFeatures()) {
        this.$root.utools.whole.removeFeature(feature.code);
      }
    },
    // 搜索
    updateSearch() {
      // 记录当前标签页
      if (this.currentTag !== "搜索结果") this.lastTag = this.currentTag;
      if (this.commandSearchKeyword?.length > 1) {
        // 搜索时跳转到搜索结果标签
        setTimeout(() => {
          this.currentTag = "搜索结果";
        }, 100);
      } else {
        // 清空搜索回跳到之前标签
        if (this.currentTag !== this.lastTag) this.currentTag = this.lastTag;
      }
    },
    // 新建命令
    addNewCommand() {
      this.commandEditorAction = {
        type: "new",
        data: {},
      };
      this.isCommandEditorShow = true;
    },
    saveCommand(command) {
      let code = command.features.code;
      this.allQuickCommands[code] = command;
      //无论禁用还是启用都启用
      if (!this.activatedQuickCommandFeatureCodes.includes(code))
        this.activatedQuickCommandFeatureCodes.push(code);
      // 先删除再添加，强制刷新
      this.$root.utools.whole.removeFeature(code);
      this.$root.utools.whole.setFeature(command.features);
      this.locateToCommand(command.tags, code);
    },
    editorEvent(event) {
      switch (event.type) {
        case "save":
          this.saveCommand(event.data);
          this.isCommandEditorShow = false;
        default:
          return;
      }
    },
  },
};
</script>

<style scoped>
.q-tab {
  word-break: break-all;
  white-space: normal;
}
</style>
