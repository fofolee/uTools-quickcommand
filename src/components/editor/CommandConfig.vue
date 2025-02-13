<template>
  <q-expansion-item
    v-model="isExpanded"
    class="command-config"
    @dragover="isExpanded = false"
  >
    <template v-slot:header>
      <div class="row q-col-gutter-sm basic-config">
        <div class="col-auto">
          <q-avatar size="36px" square class="featureIco">
            <q-img
              @click.stop="showIconPicker = true"
              :src="currentCommand.features.icon"
            />
          </q-avatar>
        </div>
        <div class="col">
          <q-input
            :model-value="currentCommand.features.explain"
            filled
            dense
            @update:model-value="updateCommand('features.explain', $event)"
            placeholder="名称"
            @click.stop
          >
            <template v-slot:append>
              <q-icon name="drive_file_rename_outline" />
            </template>
          </q-input>
        </div>
      </div>
    </template>

    <!-- 展开的配置项 -->
    <div class="expanded-config">
      <!-- 匹配规则 -->
      <div class="config-section">
        <div class="section-title">
          <q-icon name="rule" size="16px" />
          <span class="q-ml-sm">匹配规则</span>
          <q-icon
            name="help"
            size="16px"
            class="q-ml-sm cursor-pointer"
            @click="showMatchRuleHelp"
          >
            <q-tooltip>查看帮助</q-tooltip>
          </q-icon>
          <q-icon
            name="data_object"
            size="16px"
            class="q-ml-sm cursor-pointer"
            :color="showMatchRuleJson ? 'primary' : 'grey'"
            @click="showMatchRuleJson = !showMatchRuleJson"
          >
            <q-tooltip>编辑JSON配置</q-tooltip>
          </q-icon>
        </div>
        <MatchRuleEditor
          :showJson="showMatchRuleJson"
          :model-value="currentCommand.features.cmds"
          @update:model-value="updateCommand('features.cmds', $event)"
        />
      </div>

      <!-- 标签 -->
      <div class="config-section">
        <div class="section-title">
          <q-icon name="label" size="16px" />
          <span class="q-ml-sm">标签</span>
        </div>
        <q-select
          :model-value="currentCommand.tags"
          @update:model-value="updateCommand('tags', $event)"
          :options="allQuickCommandTags"
          dense
          options-dense
          filled
          use-input
          use-chips
          multiple
          hide-dropdown-icon
          new-value-mode="add-unique"
          placeholder="回车添加，最多3个"
          max-values="3"
          @new-value="tagVerify"
          input-debounce="0"
          ref="commandTagRef"
          @blur="(e) => autoAddInputVal(e, $refs.commandTagRef)"
        />
      </div>

      <!-- 输出 -->
      <div class="config-section">
        <div class="section-title">
          <q-icon name="output" size="16px" />
          <span class="q-ml-sm">输出</span>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <ButtonGroup
              :model-value="currentCommand.output"
              :options="outputTypesOptionsDy"
              @update:model-value="updateCommand('output', $event)"
              height="26px"
            />
          </div>
          <div class="col-12">
            <div class="section-title">
              <q-icon name="search" size="16px" />
              <span class="q-ml-sm"
                >搜索面板推送
                <q-btn
                  flat
                  round
                  size="xs"
                  icon="help"
                  @click="showMainPushHelp"
                />
              </span>
            </div>
            <ButtonGroup
              :model-value="currentCommand.features.mainPush"
              :options="searchPushOptions"
              @update:model-value="handleMainPushChange"
              height="30px"
            />
          </div>
        </div>
      </div>

      <!-- 平台 -->
      <div class="config-section">
        <div class="section-title">
          <q-icon name="devices" size="16px" />
          <span class="q-ml-sm">平台</span>
        </div>
        <CheckGroup
          :model-value="currentCommand.features.platform"
          :options="Object.values(platformTypes)"
          @update:model-value="updateCommand('features.platform', $event)"
          height="30px"
        />
      </div>
    </div>

    <!-- 图标选择对话框 -->
    <q-dialog v-model="showIconPicker" position="left">
      <iconPicker
        @iconChanged="(dataUrl) => updateCommand('features.icon', dataUrl)"
        ref="icon"
      />
    </q-dialog>
  </q-expansion-item>
</template>

<script>
import { defineComponent, computed } from "vue";
import iconPicker from "components/popup/IconPicker.vue";
import outputTypes from "js/options/outputTypes.js";
import platformTypes from "js/options/platformTypes.js";
import CheckGroup from "components/composer/common/CheckGroup.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import commandTypes from "js/options/commandTypes.js";
import MatchRuleEditor from "components/editor/MatchRuleEditor.vue";
import { useCommandManager } from "js/commandManager.js";

export default defineComponent({
  name: "CommandConfig",
  components: {
    iconPicker,
    CheckGroup,
    ButtonGroup,
    MatchRuleEditor,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      commandManager: useCommandManager(),
      isExpanded: false,
      showIconPicker: false,
      showMatchRuleJson: false,
      commandTypes,
      outputTypes,
      platformTypes,
      isFileTypeDirectory: false,
      searchPushOptions: [
        { value: false, label: "禁用（进入插件后才执行命令）" },
        { value: true, label: "启用（在uTools主搜索框直接执行命令）" },
      ],
    };
  },
  computed: {
    allQuickCommandTags() {
      return this.commandManager.state.allQuickCommandTags.filter(
        (tag) => !["默认", "未分类", "搜索结果"].includes(tag)
      );
    },
    currentCommand() {
      return this.modelValue;
    },
    commandTypesOptions() {
      const options = Object.values(this.commandTypes);
      return this.currentCommand.features.mainPush
        ? options.map((cmdType) =>
            ["regex", "over", "key"].includes(cmdType.name)
              ? cmdType
              : { ...cmdType, disabled: true }
          )
        : options;
    },
    outputTypesOptionsDy() {
      const options = Object.values(this.outputTypes);
      return this.currentCommand.features.mainPush
        ? options.map((outputType) =>
            outputType.name !== "text"
              ? { ...outputType, disabled: true }
              : outputType
          )
        : options;
    },
  },
  methods: {
    updateCommand(path, value) {
      const newCommand = { ...this.currentCommand };
      const keys = path.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], newCommand);
      target[lastKey] = value;
      this.$emit("update:modelValue", newCommand);
    },
    tagVerify(val, done) {
      if (["默认", "未分类", "搜索结果"].includes(val)) {
        return done(`_${val}_`);
      }
      done(val);
    },
    autoAddInputVal(e, ref) {
      const inputValue = e.target.value;
      if (!inputValue) return;
      ref.add(inputValue, true);
    },
    handleMainPushChange(val) {
      this.updateCommand("features.mainPush", val);
      if (val) {
        this.updateCommand("output", "text");
      }
    },
    showMainPushHelp() {
      window.showUb.help("#u0e9f1430");
    },
    showMatchRuleHelp() {
      utools.ubrowser
        .goto(
          "https://www.u-tools.cn/docs/developer/information/plugin-json.html#%E5%8A%9F%E8%83%BD%E6%8C%87%E4%BB%A4"
        )
        .run();
    },
  },
});
</script>

<style scoped>
.command-config {
  border-radius: 8px;
  overflow: hidden;
}

.command-config :deep(.q-field__inner) {
  font-family: "Consolas", "Monaco", monospace;
}

.basic-config {
  width: 100%;
}

.command-config :deep(.q-item) {
  padding: 0;
  min-height: unset;
  cursor: default;
}

.command-config :deep(.q-item__section--side) {
  padding: 0;
}

.command-config :deep(.q-item:hover) {
  background: transparent;
}

.command-config :deep(.q-focus-helper) {
  display: none;
}

.config-section {
  margin-bottom: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--q-primary);
  padding: 4px 2px;
  user-select: none;
}

.featureIco {
  cursor: pointer;
  transition: 0.2s;
}

.featureIco:hover {
  transform: scale(1.02) translateY(-2px);
}

.expanded-config {
  overflow-y: auto;
  max-height: 450px;
  padding: 0 5px;
}

::-webkit-scrollbar {
  width: 1px;
}
</style>
