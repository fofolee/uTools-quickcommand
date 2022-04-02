<template>
  <div>
    <!-- 标签栏 -->
    <q-tabs
      v-model="currentTag"
      vertical
      class="text-teal fixed-left"
      :style="{
        width: tabBarWidth,
        boxShadow: barShadow,
        zIndex: 1,
      }"
    >
      <!-- 所有标签 -->
      <q-tab v-for="tag in allQuickCommandTags" :key="tag" :name="tag">
        <div class="flex items-center">
          <q-icon
            v-if="activatedQuickPanels.includes(tag)"
            name="star"
            style="margin-right: 2px"
          />{{ tag }}
        </div>
      </q-tab>
    </q-tabs>
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
    ></div>
  </div>
</template>

<script>
import UTOOLS from "../js/utools.js";
import CommandCard from "components/CommandCard";

export default {
  components: { CommandCard },
  data() {
    return {
      currentTag: "默认",
      activatedQuickCommandFeatureCodes: [],
      activatedQuickPanels: [],
      allQuickCommands: [],
      tabBarWidth: "80px",
      footerBarHeight: "35px",
      barShadow: "2px 0 5px 2px #0000001f",
      commandCardStyle: "normal",
      commandCardStyleSheet: {
        mini: {
          width: "25%",
          code: 1,
        },
        small: {
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
      return this.currentTag === "未分类"
        ? commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0)
        : commands.filter(
            (cmd) => cmd.tags && cmd.tags.includes(this.currentTag)
          );
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
            .concat(["未分类"])
        ),
      ].filter((x) => x);
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
      console.log("ConfigurationPage", this);
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
      UTOOLS.getDocs(UTOOLS.DBPRE.QC).forEach(
        (x) => (allQcs[x.data.features.code] = x.data)
      );
      return allQcs;
    },
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
  },
};
</script>
