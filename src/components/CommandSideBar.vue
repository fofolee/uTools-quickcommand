<template>
  <q-scroll-area
    :thumb-style="{
      width: '3px',
    }"
    :horizontal-thumb-style="{
      height: '5px',
    }"
  >
    <div class="row q-pa-md q-gutter-md">
      <q-btn
        dense
        flat
        color="grey"
        style="margin-right: 29px"
        icon="arrow_back_ios_new"
        v-close-popup
      />
      <q-avatar size="64" square class="commandLogo">
        <q-img
          @click="showIconPicker = true"
          :src="currentCommand.features.icon"
        />
      </q-avatar>
      <div class="row">
        <div>
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
              <q-icon color="primary" name="drive_file_rename_outline" />
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
            @update:model-value="
              (val) =>
                (cmdMatch =
                  val.name === 'professional'
                    ? JSON.stringify(val.jsonSample, null, 4)
                    : null)
            "
            :options="commandTypesOptions"
            v-model="cmdType"
            type="text"
            label="匹配类型"
          >
            <template v-slot:prepend>
              <q-icon color="primary" :name="cmdType.icon" />
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
            :disable="!canCommandSave"
            hide-dropdown-icon
            stack-label
            label-color="primary"
            transition-show="jump-down"
            transition-hide="jump-up"
            v-if="cmdType.valueType === 'array'"
            borderless
            square
            v-model="cmdMatch"
            max-values="3"
            type="text"
            placeholder="回车添加多个"
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
              <q-icon color="primary" name="square_foot" />
            </template>
          </q-select>
          <q-input
            :disable="!canCommandSave"
            v-else
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
              <q-icon color="primary" name="square_foot" />
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
            placeholder="回车添加多个"
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
              <q-icon color="primary" name="label" />
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
              <q-icon color="primary" name="attach_money" />
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
                color="primary"
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
          <q-field
            :disable="!canCommandSave"
            stack-label
            label-color="primary"
            borderless
            square
            type="text"
            label="搜索面板推送"
          >
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="0">
                {{
                  currentCommand.features.mainPush
                    ? "主搜索框执行"
                    : "进插件后执行"
                }}
                <q-btn
                  flat
                  round
                  icon="help_outline"
                  size="xs"
                  dense
                  @click="showMainPushHelp"
                ></q-btn>
              </div>
            </template>
            <template v-slot:prepend>
              <q-icon color="primary" name="search" />
            </template>
            <template v-slot:append>
              <q-toggle
                v-model="currentCommand.features.mainPush"
                color="primary"
                size="md"
                dense
              />
            </template>
          </q-field>
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
              <q-icon color="primary" name="window" />
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
import commandTypes from "../js/options/commandTypes.js";
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import platformTypes from "../js/options/platformTypes.js";
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
    };
  },
  props: {
    quickcommandInfo: Object,
    canCommandSave: Boolean,
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
        let { type, match } = cmds[0];
        data.type = type ? type : "key";
        data.match =
          data.type === "key" ? cmds : match?.app ? match.app : match;
      } else {
        data.type = cmds.filter((x) => !x.length).length
          ? "professional"
          : "key";
        data.match = data.type === "key" ? cmds : JSON.stringify(cmds, null, 4);
      }
      return data;
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
      updateData.features.cmds = this.cmdType.matchToCmds(
        this.cmdMatch,
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
