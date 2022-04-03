<template>
  <div>
    <!-- 标签栏 -->
    <!-- 面板视图不显示标签栏 -->
    <div v-show="commandCardStyle !== 'mini'">
      <q-tabs
        v-model="currentTag"
        vertical
        outside-arrows
        :shrink="false"
        class="text-teal fixed-left"
        :style="{
          width: tabBarWidth,
          boxShadow: barShadow,
          zIndex: 1,
        }"
      >
        <!-- 所有标签 -->
        <q-tab
          :alert="activatedQuickPanels.includes(tag)"
          alert-icon="star"
          v-for="tag in allQuickCommandTags"
          :key="tag"
          :name="tag"
          :content-class="
            tag === '搜索结果' ? 'text-primary text-weight-bold' : ''
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
      class="fixed-right"
      :style="{
        bottom: footerBarHeight,
        left: tabBarWidth,
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
      class="fixed-bottom"
      :style="{
        height: footerBarHeight,
        left: tabBarWidth,
        boxShadow: barShadow,
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
              toggle-color="teal"
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
            <q-btn split flat label="新建" color="teal" icon="add"></q-btn>
            <q-separator vertical />
            <!-- 下拉菜单 -->
            <q-btn color="teal" flat icon="menu" size="xs">
              <q-menu transition-show="jump-up" transition-hide="jump-down">
                <q-list>
                  <!-- 导入 -->
                  <q-item clickable>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_left" />
                    </q-item-section>
                    <q-item-section>导入</q-item-section>
                    <q-menu anchor="top end" self="top start">
                      <q-list>
                        <q-item
                          clickable
                          v-close-popup
                          @click="importCommandAndLocate"
                        >
                          <q-item-section side>
                            <q-icon name="text_snippet" />
                          </q-item-section>
                          <q-item-section>从文件导入</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="importCommandAndLocate(false)"
                        >
                          <q-item-section side>
                            <q-icon name="content_paste" />
                          </q-item-section>
                          <q-item-section>从剪贴板导入</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item>
                  <!-- 导出 -->
                  <q-item clickable v-close-popup @click="exportAllCommands">
                    <q-item-section side>
                      <q-icon name="file_upload" />
                    </q-item-section>
                    <q-item-section>全部导出</q-item-section>
                  </q-item>
                  <!-- 批量启用禁用 -->
                  <q-item clickable>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_left" />
                    </q-item-section>
                    <q-item-section>批处理</q-item-section>
                    <q-menu anchor="top end" self="top start">
                      <q-list>
                        <q-item
                          clickable
                          v-close-popup
                          @click="enableAllCommands"
                        >
                          <q-item-section side>
                            <q-icon name="checklist_rtl" />
                          </q-item-section>
                          <q-item-section>启用本页所有命令</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="disableAllCommands"
                        >
                          <q-item-section side>
                            <q-icon name="remove_done" />
                          </q-item-section>
                          <q-item-section>禁用本页所有命令</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item>
                  <!-- 收藏 -->
                  <q-item
                    v-if="activatedQuickPanels.includes(currentTag)"
                    clickable
                    v-close-popup
                  >
                    <q-item-section side>
                      <q-icon name="star_border" />
                    </q-item-section>
                    <q-item-section>取消收藏</q-item-section>
                  </q-item>
                  <q-item v-else clickable v-close-popup>
                    <q-item-section side>
                      <q-icon name="star" />
                    </q-item-section>
                    <q-item-section>收藏标签</q-item-section>
                    <q-tooltip
                      >收藏后，会将当前标签名作为全局关键字，可在 uTools
                      的主输入框进行搜索 <br />
                      搜索进入后，默认进入当前标签的面板视图 <br />
                      类似于旧版本的「快捷面板」</q-tooltip
                    >
                  </q-item>
                  <!-- 帮助 -->
                  <q-item clickable v-close-popup>
                    <q-item-section side>
                      <q-icon name="help" />
                    </q-item-section>
                    <q-item-section>帮助</q-item-section></q-item
                  >
                  <!-- 清空 -->
                  <q-item
                    style="color: red"
                    clickable
                    v-close-popup
                    @click="clearAllCommands"
                  >
                    <q-item-section side>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>清空数据</q-item-section>
                  </q-item>
                </q-list></q-menu
              >
            </q-btn>
          </q-btn-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import quickcommandParser from "../js/quickcommandParser.js";
import CommandCard from "components/CommandCard";

export default {
  components: { CommandCard },
  data() {
    return {
      currentTag: "默认",
      lastTag: "",
      activatedQuickCommandFeatureCodes: [],
      activatedQuickPanels: [],
      allQuickCommands: [],
      commandSearchKeyword: "",
      footerBarHeight: "40px",
      barShadow: "2px 0 5px 2px #0000001f",
      commandCardStyle: "normal",
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
          return commands.filter(
            (cmd) => cmd.tags && cmd.tags.includes(this.currentTag)
          );
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
      // 已启用的 features
      let activatedFeatures = this.getActivatedFeatures();
      // 已启用的命令的 featureCode
      this.activatedQuickCommandFeatureCodes =
        activatedFeatures.quickcommand.map((f) => f.code);
      // 已启用的面板
      this.activatedQuickPanels = activatedFeatures.quickpanels;
      // 所有的快捷命令
      this.allQuickCommands = this.getAllQuickCommands();
      let userPreferences = this.$utools.getDB(
        this.$utools.DBPRE.CFG + "preferences"
      );
      this.commandCardStyle = userPreferences.commandCardStyle || "normal";
      console.log("ConfigurationPage", this);
      utools.onPluginOut(() => {
        userPreferences.commandCardStyle = this.commandCardStyle;
        this.$utools.putDB(
          userPreferences,
          this.$utools.DBPRE.CFG + "preferences"
        );
      });
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
    // 监听命令变更时间
    commandChanged(event) {
      switch (event.type) {
        case "remove":
          delete this.allQuickCommands[event.data];
          if (!this.allQuickCommandTags.includes(this.currentTag))
            this.currentTag = "默认";
          return;
        case "enable":
          this.activatedQuickCommandFeatureCodes.push(event.data);
          return;
        case "disable":
          this.activatedQuickCommandFeatureCodes =
            this.activatedQuickCommandFeatureCodes.filter(
              (x) => x !== event.data
            );
          return;
        default:
          return;
      }
    },
    // 从文件导入命令
    importCommandFromFile(file) {
      // 指定文件时直接读取否则弹出选择文件对话框
      let options = file
        ? {
            type: "file",
            argvs: file,
            readfile: true,
          }
        : {
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
    importCommand(fromFile = true, filePath = false) {
      let quickCommandInfo = fromFile
        ? this.importCommandFromFile(filePath)
        : this.importCommandFromClipboard();
      if (!quickCommandInfo)
        return {
          data: "导入未完成！",
          success: false,
        };
      let dataToPushed = quickcommandParser(quickCommandInfo);
      if (!dataToPushed)
        return {
          data: "格式错误",
          success: false,
        };
      // 单个命令导入
      if (dataToPushed.single) {
        this.$utools.putDB(
          dataToPushed.qc,
          this.$utools.DBPRE.QC + dataToPushed.qc.features.code
        );
        this.allQuickCommands[dataToPushed.qc.features.code] = dataToPushed.qc;
        // 多个命令导入
      } else {
        for (var code of Object.keys(dataToPushed.qc)) {
          this.$utools.putDB(
            dataToPushed.qc[code],
            this.$utools.DBPRE.QC + code
          );
        }
        Object.assign(this.allQuickCommands, dataToPushed.qc);
      }
      return {
        success: true,
        data: dataToPushed,
      };
    },
    // 导入命令且定位
    importCommandAndLocate(fromFile = true) {
      let result = this.importCommand(fromFile);
      if (!result.success)
        return quickcommand.showMessageBox(result.data, "warning");
      quickcommand.showMessageBox("导入成功！");
      if (result.data.single)
        this.locateToCommand(result.data.qc.tags, result.data.qc.features.code);
    },
    // 定位命令
    locateToCommand(tags, code) {
      this.currentTag = !tags || !tags.length ? "未分类" : tags[0];
      // 等待 dom 渲染
      this.$nextTick(() => {
        document.getElementById(code).scrollIntoViewIfNeeded();
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
          this.importDefaultCommands();
          this.clearAllFeatures();
          Object.keys(this.allQuickCommands).forEach((featureCode) => {
            if (!featureCode.includes("default_"))
              delete this.allQuickCommands[featureCode];
          });
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
    // 导入默认命令
    importDefaultCommands() {
      let defaultCommands = window.getDefaultCommands();
      Object.values(defaultCommands).forEach((commandFilePath) => {
        this.importCommand(true, commandFilePath);
      });
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
    // 启用全部
    enableAllCommands() {
      // dom 操作
      document
        .querySelectorAll(".q-toggle[aria-checked='false']")
        .forEach((x) => x.click());
    },
    // 禁用全部
    disableAllCommands() {
      // dom 操作
      document
        .querySelectorAll(".q-toggle[aria-checked='true']")
        .forEach((x) => x.click());
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
