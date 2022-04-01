<template>
  <div>
    <q-tabs
      v-model="currentTag"
      vertical
      class="text-teal fixed-left"
      style="width: 80px; border-right: 1px solid #0000001f"
    >
      <q-tab
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :label="tag"
        :name="tag"
      />
    </q-tabs>

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
          <div
            v-for="quickcommand in currentTagQuickCommands"
            :key="quickcommand.features.code"
            style="width: 50%"
            class="relative-position q-pa-sm"
          >
            <!-- 选项按钮 -->
            <div class="absolute" style="z-index: 1; right: 16px; top: 16px">
              <q-btn
                flat
                round
                :color="quickcommand.activated ? 'orange-6' : 'grey'"
                :icon="quickcommand.activated ? 'flash_on' : 'flash_off'"
                ><q-tooltip anchor="top middle" self="center middle">
                  启用/停用
                </q-tooltip></q-btn
              >
              <q-btn flat round color="primary" icon="menu">
                <q-tooltip anchor="top middle" self="center middle">
                  选项菜单
                </q-tooltip>
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item clickable v-close-popup>
                      <q-item-section>导出</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section>复制到剪贴板</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn flat round color="red" icon="close"
                ><q-tooltip anchor="top middle" self="center middle">
                  删除
                </q-tooltip></q-btn
              >
            </div>
            <q-card v-ripple>
              <q-card-section>
                <!-- logo -->
                <div class="row">
                  <q-img width="48px" :src="quickcommand.features.icon" />
                </div>
                <!-- 名称 -->
                <div class="row justify-end">
                  <div class="text-h6 ellipsis">
                    {{ quickcommand.features.explain }}
                  </div>
                </div>
                <!-- 匹配模式 -->
                <div class="row justify-end q-gutter-xs">
                  <span v-for="cmd in quickcommand.features.cmds" :key="cmd">
                    <q-badge rounded color="grey" :label="cmd" />
                  </span>
                </div>
                <!-- 语言类型及适配系统 -->
                <div class="row justify-end items-center q-gutter-xs">
                  <span
                    :style="
                      'color:' + allProgrammings[quickcommand.program].color
                    "
                    >●</span
                  >
                  <span class="text-subtitle2">{{ quickcommand.program }}</span
                  ><span>|</span>
                  <img
                    width="16"
                    v-for="platform in quickcommand.features.platform"
                    :key="platform"
                    :src="'/img/' + platform + '.svg'"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import UTOOLS from "../js/utools.js";
import allProgrammings from "../js/programs.js";

export default {
  data() {
    return {
      currentTag: "默认",
      splitterModel: 10,
      activatedQuickCommandFeatures: [],
      activatedQuickPanels: [],
      allQuickCommands: [],
      allQuickCommandTags: [],
      allProgrammings: allProgrammings,
    };
  },
  computed: {
    // 当前标签下的所有快捷命令
    currentTagQuickCommands() {
      let commands = Object.values(this.allQuickCommands);
      if (this.currentTag === "未分类")
        commands = commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0);
      else
        commands = commands.filter(
          (cmd) => cmd.tags && cmd.tags.includes(this.currentTag)
        );
      return commands.map((item) => {
        item.activated = this.activatedQuickCommandFeatureCodes.includes(
          item.features.code
        )
          ? true
          : false;
        return item;
      });
    },
    activatedQuickCommandFeatureCodes() {
      return this.activatedQuickCommandFeatures.map((f) => f.code);
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
      // 已启用的命令的 features
      this.activatedQuickCommandFeatures = activatedFeatures.quickcommand;
      // 已启用的面板
      this.activatedQuickPanels = activatedFeatures.quickpanels;
      // 所有的快捷命令
      this.allQuickCommands = this.getAllQuickCommands();
      // 所有的 tags
      this.allQuickCommandTags = [
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
  },
};
</script>

<style scoped>
.q-card {
  cursor: pointer;
  user-select: none;
}
.q-card:hover {
  box-shadow: 0 1px 5px 5px rgb(0 0 0 / 20%);
  transition: 0.5s;
  transform: translateY(-2px);
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
