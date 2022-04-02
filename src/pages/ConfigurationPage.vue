<template>
  <div>
    <q-tabs
      v-model="currentTag"
      vertical
      class="text-teal fixed-left"
      style="width: 80px; border-right: 1px solid #0000001f"
    >
      <!-- 所有标签 -->
      <q-tab
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :name="tag"
        :label="tag"
      >
        <div>
          <q-badge
            v-if="activatedQuickPanels.includes(tag)"
            floating
            rounded
            color="teal"
            ><q-icon name="near_me"
          /></q-badge>
        </div>
      </q-tab>
    </q-tabs>
    <!-- 标签对应的面板 -->
    <q-tab-panels
      animated
      class="fixed-right"
      style="left: 80px"
      v-model="currentTag"
      transition-prev="slide-down"
      transition-next="slide-up"
      swipeable
      vertical
    >
      <q-tab-panel
        style="padding: 8px"
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :name="tag"
      >
        <div class="row center">
          <CommandCard
            v-for="quickcommand in currentTagQuickCommands"
            :key="quickcommand.features.code"
            :quickcommand="quickcommand"
            :activated="
              activatedQuickCommandFeatureCodes.includes(
                quickcommand.features.code
              )
            "
            @commandChanged="commandChanged"
            style="width: 50%"
            class="relative-position q-pa-sm"
          ></CommandCard>
        </div>
      </q-tab-panel>
    </q-tab-panels>
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
      // 所有的 tags
      console.log(this);
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
