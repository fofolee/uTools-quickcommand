<template>
  <q-scroll-area
    :thumb-style="{
      width: '3px',
    }"
    :horizontal-thumb-style="{
      height: '5px',
    }"
    class="command-side-bar"
  >
    <div class="row" :style="{ padding: sideBarPadding + 'px' }">
      <div class="col-12">
        <div class="row items-center relative-position q-pb-md">
          <q-btn
            dense
            flat
            color="grey"
            icon="arrow_back_ios_new"
            v-close-popup
            class="absolute-left"
            style="height: 48px; width: 22px"
          />
          <div class="col-12 flex justify-center">
            <q-avatar size="64" square class="commandLogo">
              <q-img
                @click="showIconPicker = true"
                :src="currentCommand.features.icon"
              />
            </q-avatar>
          </div>
        </div>

        <div class="row">
          <div
            class="command-side-bar-content"
            :style="{ width: sideBarWidth - sideBarPadding * 2 + 'px' }"
          >
            <!-- 说明 -->
            <q-input
              :disable="!canCommandSave"
              stack-label
              label-color="primary"
              borderless
              square
              v-model="currentCommand.features.explain"
              type="text"
              placeholder="请输入说明"
              label="说明"
            >
              <template v-slot:prepend>
                <q-icon
                  class="command-side-bar-icon"
                  name="drive_file_rename_outline"
                />
              </template>
            </q-input>
            <!-- 匹配类型 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              @update:model-value="(val) => handleCmdTypeChange(val)"
              :options="commandTypesOptions"
              v-model="cmdType"
              type="text"
              label="匹配类型"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" :name="cmdType.icon" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt.name" />
                    <q-item-label caption>{{ scope.opt.desc }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- 匹配规则 -->
            <q-select
              v-if="cmdType.valueType === 'array'"
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              v-model="cmdMatch"
              max-values="3"
              type="text"
              placeholder="回车添加"
              use-input
              use-chips
              multiple
              new-value-mode="add-unique"
              input-debounce="0"
              :label="cmdType.matchLabel"
              ref="cmdMatchRef"
              @blur="(e) => autoAddInputVal(e, $refs.cmdMatchRef)"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="square_foot" />
              </template>
            </q-select>
            <q-input
              v-else
              :disable="!canCommandSave"
              autogrow
              borderless
              square
              v-model="cmdMatch"
              hide-bottom-space
              @blur="regexVerify"
              :readonly="!cmdType.valueType"
              type="text"
              :label="cmdType.matchLabel"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="square_foot" />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="cmdType.name === 'files'"
                  name="folder"
                  size="xs"
                  :color="isFileTypeDirectory ? 'primary' : ''"
                  @click="isFileTypeDirectory = !isFileTypeDirectory"
                  style="cursor: pointer"
                >
                  <q-tooltip>
                    切换匹配类型，当前：{{
                      isFileTypeDirectory ? "文件夹" : "文件"
                    }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
            <!-- 标签 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              v-model="currentCommand.tags"
              max-values="3"
              type="text"
              label="标签"
              placeholder="回车添加"
              use-input
              use-chips
              multiple
              new-value-mode="add-unique"
              @new-value="tagVerify"
              input-debounce="0"
              :options="allQuickCommandTags"
              ref="commandTagRef"
              @blur="(e) => autoAddInputVal(e, $refs.commandTagRef)"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="label" />
              </template>
            </q-select>
            <!-- 特殊变量 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              @popup-hide="
                () => {
                  if (specialVar.label === '{{usr:}}') showUserData = true;
                  else insertSpecialVar(specialVar.label);
                }
              "
              square
              :options="specialVarsOptions"
              v-model="specialVar"
              input-debounce="0"
              type="text"
              label="特殊变量"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="attach_money" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label v-html="scope.opt.label" />
                    <q-tooltip v-if="scope.opt.tooltip">
                      {{ scope.opt.tooltip }}
                    </q-tooltip>
                    <q-item-label caption>{{ scope.opt.desc }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template></q-select
            >
            <!-- 输出 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              color="primary"
              v-model="currentCommand.output"
              :display-value="outputTypes[currentCommand.output].label"
              :options="outputTypesOptionsDy"
              label="输出"
            >
              <template v-slot:prepend>
                <q-icon
                  class="command-side-bar-icon"
                  :name="outputTypes[currentCommand.output].icon"
                />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="outputTypes[scope.opt].icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="outputTypes[scope.opt].label" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- 搜索面板推送 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              v-model="searchPushValue"
              :options="searchPushOptions"
              label="搜索面板推送"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="search" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.desc }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="scope.opt.value">
                    <q-btn
                      flat
                      round
                      icon="help_outline"
                      size="xs"
                      dense
                      @click.stop="showMainPushHelp"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- 平台 -->
            <q-select
              :disable="!canCommandSave"
              hide-dropdown-icon
              stack-label
              label-color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              borderless
              square
              :options="Object.keys(platformTypes)"
              use-chips
              @blur="platformVerify()"
              v-model="currentCommand.features.platform"
              multiple
              label="平台"
            >
              <template v-slot:prepend>
                <q-icon class="command-side-bar-icon" name="window" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  dense
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                >
                  {{ platformTypes[scope.opt].label }}
                </q-chip>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <span
                      :class="`iconfont icon-${platformTypes[scope.opt].icon}`"
                    ></span>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="platformTypes[scope.opt].label" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>
    <q-dialog v-model="showIconPicker" position="left">
      <iconPicker
        @iconChanged="(dataUrl) => (currentCommand.features.icon = dataUrl)"
        ref="icon"
      />
    </q-dialog>
    <q-dialog v-model="showUserData">
      <UserData @insertText="insertSpecialVar" :showInsertBtn="true" />
    </q-dialog>
  </q-scroll-area>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";
import outputTypes from "js/options/outputTypes.js";
import specialVars from "js/options/specialVars.js";
import platformTypes from "js/options/platformTypes.js";
import iconPicker from "components/popup/IconPicker.vue";
import UserData from "components/popup/UserData.vue";

export default {
  components: { iconPicker, UserData },
  data() {
    return {
      currentCommand: {
        tags: [],
        output: "text",
        features: {
          explain: "",
          platform: ["win32", "linux", "darwin"],
          icon: "",
          mainPush: false,
        },
      },
      searchPushOptions: [
        { value: false, label: "禁用", desc: "需要进入插件才能执行命令" },
        {
          value: true,
          label: "启用",
          desc: "可以在uTools主搜索框直接执行命令",
        },
      ],
      commandTypes: commandTypes,
      platformTypes: platformTypes,
      currentMatchType: "关键字",
      cmdType: {},
      cmdMatch: "",
      outputTypes: outputTypes,
      outputTypesOptions: Object.keys(outputTypes),
      specialVar: "{{}}",
      allQuickCommandTags: this.$parent.allQuickCommandTags,
      showIconPicker: false,
      showUserData: false,
      sideBarPadding: 20,
      isFileTypeDirectory: false,
    };
  },
  props: {
    quickcommandInfo: Object,
    canCommandSave: Boolean,
    sideBarWidth: Number,
  },
  computed: {
    commandTypesOptions() {
      return this.currentCommand.features.mainPush
        ? Object.values(commandTypes).filter((x) =>
            ["regex", "over", "key"].includes(x.name)
          )
        : Object.values(commandTypes);
    },
    specialVarsOptions() {
      if (this.currentCommand.features.mainPush) return [specialVars.input];
      let x = Object.values(specialVars).filter(
        (x) => !x.label.match(this.cmdType.disabledSpecialVars)
      );
      return x;
    },
    outputTypesOptionsDy() {
      if (this.currentCommand.features.mainPush) return ["text"];
      switch (this.$parent.quickcommandInfo.program) {
        case "quickcommand":
          return _.without(this.outputTypesOptions, "terminal");
        case "html":
          return ["html"];
        default:
          return this.outputTypesOptions;
      }
    },
    searchPushValue: {
      get() {
        return (
          this.searchPushOptions.find(
            (opt) => opt.value === this.currentCommand.features.mainPush
          ) || this.searchPushOptions[0]
        );
      },
      set(option) {
        this.currentCommand.features.mainPush = option.value;
      },
    },
  },
  watch: {
    outputTypesOptionsDy(val) {
      if (!val.includes(this.currentCommand.output)) {
        this.currentCommand.output = val[0];
      }
    },
    commandTypesOptions(val) {
      if (!val.map((x) => x.name).includes(this.cmdType.name)) {
        this.cmdType = val[0];
      }
    },
  },
  methods: {
    init() {
      let currentQuickCommandCmds = this.getCommandType();
      this.cmdType = this.commandTypes[currentQuickCommandCmds.type];
      this.cmdMatch = currentQuickCommandCmds.match;
      Object.assign(
        this.currentCommand,
        _.cloneDeep(_.pick(this.quickcommandInfo, "tags", "output", "features"))
      );
      this.setIcon(this.quickcommandInfo.program);
      this.platformVerify();
    },
    setIcon(language) {
      this.currentCommand.features.icon?.slice(0, 10) === "data:image" ||
        (this.currentCommand.features.icon =
          this.$root.programs[language].icon);
    },
    getCommandType() {
      let data = { type: "key", match: [] };
      let cmds = this.quickcommandInfo.features?.cmds;
      if (!cmds) return data;
      if (cmds.length === 1) {
        let { type, match, fileType } = cmds[0];
        data.type = type ? type : "key";
        data.match =
          data.type === "key" ? cmds : match?.app ? match.app : match;
        this.isFileTypeDirectory = fileType === "directory";
      } else {
        data.type = cmds.filter((x) => !x.length).length
          ? "professional"
          : "key";
        data.match = data.type === "key" ? cmds : JSON.stringify(cmds, null, 4);
      }
      return data;
    },
    handleCmdTypeChange(val) {
      this.cmdMatch =
        val.name === "professional"
          ? JSON.stringify(val.jsonSample, null, 4)
          : null;
    },
    tagVerify(val, done) {
      if (
        [
          "默认",
          "未分类",
          "搜索结果",
          // "来自分享"
        ].includes(val)
      ) {
        return done(`_${val}_`);
      }
      done(val);
    },
    // 平台为空自动补充
    platformVerify() {
      this.currentCommand.features.platform?.length > 0 ||
        (this.currentCommand.features.platform = [window.processPlatform]);
    },
    // 正则不和规则自动加斜杠
    regexVerify() {
      if (
        this.cmdType.valueType === "regex" &&
        !/^\/.*?\/[igm]*$/.test(this.cmdMatch)
      )
        this.cmdMatch = `/${this.cmdMatch}/`;
    },
    autoAddInputVal(e, ref) {
      let inputValue = e.target.value;
      if (!inputValue) return;
      ref.add(inputValue, true);
    },
    insertSpecialVar(text) {
      if (!text) return;
      this.$parent.$refs.editor.repacleEditorSelection(`"${text}"`);
    },
    showMainPushHelp() {
      window.showUb.help("#u0e9f1430");
    },
    // 保存各类数据
    SaveMenuData() {
      let updateData = {
        features: this.currentCommand.features,
        output: this.currentCommand.output,
        tags: this.currentCommand.tags,
        cmd: "",
      };

      // 说明为空填充一个空格
      updateData.features.explain || (updateData.features.explain = " ");

      if (!updateData.features.code) {
        // 生成唯一code
        let uid = Number(
          Math.random().toString().substr(3, 3) + Date.now()
        ).toString(36);
        updateData.features.code = `${this.cmdType.name}_${uid}`;
      }
      let verify = this.cmdType.verify(this.cmdMatch);
      if (verify !== true) {
        return quickcommand.showMessageBox(verify, "error");
      }
      // 匹配文件时，额外添加文件类型
      let rules = this.cmdMatch;
      if (this.cmdType.name === "files") {
        rules = {
          fileType: this.isFileTypeDirectory ? "directory" : "file",
          match: this.cmdMatch,
        };
      }
      updateData.features.cmds = this.cmdType.matchToCmds(
        rules,
        updateData.features.explain
      );

      updateData.cmd = this.$parent.$refs.editor.getEditorValue();

      let blackLisk = updateData.cmd.match(this.cmdType.disabledSpecialVars);
      if (blackLisk) {
        return quickcommand.showMessageBox(
          `当前模式无法使用${[...new Set(blackLisk)].join("、")}`,
          "error"
        );
      }

      // 子输入框
      if (updateData.cmd.includes("{{subinput")) {
        updateData.hasSubInput = true;
      } else {
        updateData.hasSubInput = false;
      }
      return updateData;
    },
  },
};
</script>
<style scoped>
.command-side-bar {
  height: 100%;
  background: #f4f4f4;
}

.body--dark .command-side-bar {
  background: #303133;
}

.commandLogo {
  cursor: pointer;
  transition: 0.2s;
  filter: drop-shadow(2px 1px 1px grey);
}

.commandLogo:hover {
  transition: 0.5s;
  transform: translateY(-1px);
  filter: drop-shadow(2px 1px 5px grey);
}

/* 输入框图标基础样式 */
.command-side-bar-icon {
  background: var(--q-primary);
  border-radius: 8px;
  padding: 4px;
  color: #f4f4f4;
  font-size: 14px;
  /* 分开设置不同属性的过渡效果 */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  -webkit-font-smoothing: subpixel-antialiased;
  /* 添加初始transform状态 */
  transform: translateZ(0);
}

/* 输入框容器悬浮效果 */
.q-field:hover .command-side-bar-icon {
  transform: scale(1.05) translateY(-1px) translateZ(0);
  background: var(--q-primary);
  opacity: 0.9;
}

/* 输入框得焦点时的图标效果 */
.q-field--focused .command-side-bar-icon {
  transform: scale(1.1) translateY(-1px) translateZ(0);
  background: var(--q-primary);
  opacity: 0.85;
}
</style>
