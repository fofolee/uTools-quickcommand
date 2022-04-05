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
      }"
    >
      <q-tabs v-model="currentTag" vertical outside-arrows class="text-primary">
        <!-- 所有标签 -->
        <q-tab
          :alert="activatedQuickPanels.includes(tag)"
          alert-icon="star"
          v-for="tag in allQuickCommandTags"
          :key="tag"
          :name="tag"
          :content-class="
            tag === '搜索结果' ? 'text-blue-9 text-weight-bold' : ''
          "
          v-show="!(tag === '搜索结果' && !commandSearchKeyword)"
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
          commandCardStyle === 'mini' && $profile.backgroundImg
            ? 'url(file:///' + $profile.backgroundImg + ')'
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
              :activated="
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
            clearable
            clear-icon="close"
            @update:model-value="updateSearch"
            placeholder="搜索"
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
              @click="$profile.commandCardStyle = commandCardStyle"
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
                  面板视图下只显示图标、描述和匹配类型,且不显示匹配类型为窗口的命令<br />
                  点击卡片时会直接运行命令而不是编辑命令</q-tooltip
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
                :allQuickcommandsLength="Object.keys(allQuickCommands).length"
                :allFeaturesLength="activatedQuickCommandFeatureCodes.length"
                :isTagStared="activatedQuickPanels.includes(currentTag)"
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
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <CommandEditor
          :action="commandEditorAction"
          @editorEvent="editorEvent"
        ></CommandEditor>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import quickcommandParser from "../js/quickcommandParser.js";
import CommandCard from "components/CommandCard";
import CommandEditor from "components/CommandEditor.vue";
import ConfigurationMenu from "components/ConfigurationMenu.vue";
import importAll from "../js/importAll.js";

// 默认命令
let defaultCommands = importAll(require.context("../json/", false, /\.json$/));

export default {
  components: { CommandCard, CommandEditor, ConfigurationMenu },
  data() {
    return {
      currentTag: "默认",
      lastTag: "",
      activatedQuickCommandFeatureCodes: [],
      activatedQuickPanels: [],
      allQuickCommands: [],
      commandSearchKeyword: "",
      isCommandEditorShow: false,
      maximizedToggle: true,
      commandEditorAction: {},
      footerBarHeight: "40px",
      commandCardStyle: this.$profile.commandCardStyle,
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
      let commands = Object.values(this.allQuickCommands);
      switch (this.currentTag) {
        case "未分类":
          return commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0);
        case "搜索结果":
          if (this.commandSearchKeyword)
            return commands.filter((cmd) =>
              cmd.features.explain.includes(this.commandSearchKeyword)
            );
        default:
          return commands.filter((cmd) => cmd.tags?.includes(this.currentTag));
      }
    },
    // 所有命令对应的标签
    allQuickCommandTags() {
      return [
        ...new Set(
          // 去重并确保默认在第一位
          Array.prototype.concat
            .apply(
              ["默认"],
              Object.values(this.allQuickCommands).map((x) => x.tags)
            )
            .concat(["未分类", "搜索结果"])
        ),
      ].filter((x) => x);
    },
    // 标签栏宽度
    tabBarWidth() {
      return this.commandCardStyle === "mini" ? "0" : "80px";
    },
  },
  mounted() {
    this.initPage();
  },
  methods: {
    // 初始化
    initPage() {
      window.configuration = this;
      // 已启用的 features
      let activatedFeatures = this.getActivatedFeatures();
      // 已启用的命令的 featureCode
      this.activatedQuickCommandFeatureCodes =
        activatedFeatures.quickcommand.map((f) => f.code);
      // 已启用的面板
      this.activatedQuickPanels = activatedFeatures.quickpanels;
      // 所有的快捷命令
      this.allQuickCommands = this.getAllQuickCommands();
      Object.assign(this.allQuickCommands, defaultCommands);
    },
    // 获取所有已启用的命令的 features 以及面板名称
    getActivatedFeatures() {
      let features = utools.getFeatures();
      let currentFts = [];
      let quickpanels = [];
      features.forEach((x) =>
        x.code.slice(0, 6) == "panel_"
          ? quickpanels.push(hexDecode(x.code.slice(6)))
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
      this.$utools
        .getDocs(this.$utools.DBPRE.QC)
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
        default:
          return;
      }
    },
    // 启用命令
    enableCommand(code) {
      this.$utools.whole.setFeature(
        JSON.parse(JSON.stringify(this.allQuickCommands[code].features))
      );
      this.activatedQuickCommandFeatureCodes.push(code);
    },
    // 禁用命令
    disableCommand(code) {
      this.$utools.whole.removeFeature(code);
      this.activatedQuickCommandFeatureCodes =
        this.activatedQuickCommandFeatureCodes.filter((x) => x !== code);
    },
    // 删除命令
    removeCommand(code) {
      utools.copyText(JSON.stringify(this.allQuickCommands[code], null, 4));
      delete this.allQuickCommands[code];
      this.$utools.delDB(this.$utools.DBPRE.QC + code);
      this.disableCommand(code);
      if (!this.allQuickCommandTags.includes(this.currentTag))
        this.currentTag = "默认";
      quickcommand.showMessageBox(
        "删除成功，为防止误操作，已将删除的命令复制到剪贴板"
      );
    },
    // 编辑命令
    editCommand(code) {
      this.commandEditorAction = {
        type: "edit",
        data: this.allQuickCommands[code],
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
        this.$utools.putDB(dataToPushed[code], this.$utools.DBPRE.QC + code);
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
        el.style.filter = "invert(1) drop-shadow(1px 1px 5px #0000008e)";
        el.style.transform = "translateY(-5px)";
        setTimeout(() => {
          el.style.filter = "";
          el.style.transform = "";
        }, 500);
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
      let commandsToExport = JSON.parse(JSON.stringify(this.allQuickCommands));
      // 不导出默认命令
      if (!utools.isDev())
        Object.keys(commandsToExport).forEach((code) => {
          if (code.includes("default_")) delete commandsToExport[code];
        });
      let stringifyCommands = JSON.stringify(commandsToExport);
      if (saveAsFile) {
        window.saveFile(stringifyCommands, options);
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
          this.$utools
            .getDocs(this.$utools.DBPRE.QC)
            .map((x) => x._id)
            .forEach((y) => this.$utools.delDB(y));
          Object.assign(this.allQuickCommands, defaultCommands);
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
        this.$utools.whole.removeFeature(feature.code);
      }
    },
    // 搜索
    updateSearch() {
      // 记录当前标签页
      if (this.currentTag !== "搜索结果") this.lastTag = this.currentTag;
      if (this.commandSearchKeyword) {
        // 搜索时跳转到搜索结果标签
        this.$nextTick(() => {
          this.currentTag = "搜索结果";
        });
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
    editorEvent(event) {
      switch (event.type) {
        case "close":
          this.isCommandEditorShow = false;
          return;
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
