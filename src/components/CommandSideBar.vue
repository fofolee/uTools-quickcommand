<template>
  <q-scroll-area
    :thumb-style="{
      width: '3px',
    }"
  >
    <div class="row q-pa-md q-gutter-md">
      <q-btn
        dense
        flat
        color="grey"
        style="margin-right: 29px"
        icon="arrow_back_ios_new"
        @click="$parent.closeEditor"
      />
      <q-img
        class="commandLogo"
        @click="showIconPicker"
        width="64px"
        :src="currentCommand.features.icon"
      />
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
            placeholder="键入后回车"
            use-input
            use-chips
            multiple
            new-value-mode="add-unique"
            input-debounce="0"
            :label="cmdType.matchLabel"
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
            placeholder="键入后回车"
            use-input
            use-chips
            multiple
            new-value-mode="add-unique"
            input-debounce="0"
            :options="allQuickCommandTags"
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
            @update:model-value="(val) => insertSpecialVar(val.label)"
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
    <iconPicker
      @iconChanged="(dataUrl) => (currentCommand.features.icon = dataUrl)"
      position="left"
      ref="icon"
    />
  </q-scroll-area>
</template>

<script>
import commandTypes from "../js/options/commandTypes.js";
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import platformTypes from "../js/options/platformTypes.js";
import iconPicker from "components/IconPicker.vue";
let commandTypesOptions = Object.values(commandTypes);

export default {
  components: { iconPicker },
  data() {
    return {
      currentCommand: {
        tags: [],
        output: "text",
        features: {
          explain: "",
          platform: ["win32", "linux", "darwin"],
          icon: "",
        },
      },
      commandTypes: commandTypes,
      platformTypes: platformTypes,
      commandTypesOptions: commandTypesOptions,
      currentMatchType: "关键字",
      cmdType: commandTypesOptions[0],
      cmdMatch: "",
      outputTypes: outputTypes,
      outputTypesOptions: Object.keys(outputTypes),
      specialVar: "{{}}",
      allQuickCommandTags: this.$parent.allQuickCommandTags,
    };
  },
  props: {
    quickcommandInfo: Object,
    canCommandSave: Boolean,
  },
  computed: {
    specialVarsOptions() {
      let x = Object.values(specialVars).filter(
        (x) => !x.label.match(this.cmdType.disabledSpecialVars)
      );
      return x;
    },
    outputTypesOptionsDy() {
      return this.$parent.quickcommandInfo.program === "quickcommand"
        ? _.without(this.outputTypesOptions, "terminal")
        : this.outputTypesOptions;
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
    // 没有图标，或者使用了语言图标
    setIcon(language) {
      this.currentCommand.features.icon?.slice(0, 5) === "data:" ||
        (this.currentCommand.features.icon =
          this.$parent.getLanguageIcon(language));
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
    // 平台为空自动补充
    platformVerify() {
      this.currentCommand.features.platform?.length > 0 ||
        (this.currentCommand.features.platform = [window.processPlatform]);
    },
    // 正则不和规则自动加斜杠
    regexVerify() {
      console.log(1);
      if (
        this.cmdType.valueType === "regex" &&
        !/^\/.*?\/[igm]*$/.test(this.cmdMatch)
      )
        this.cmdMatch = `/${this.cmdMatch}/`;
    },
    insertSpecialVar(text) {
      this.$parent.$refs.editor.repacleEditorSelection(`'${text}'`);
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

    showIconPicker() {
      this.$refs.icon.showIconPicker = true;
    },
  },
};
</script>
