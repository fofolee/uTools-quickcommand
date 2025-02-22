<template>
  <q-expansion-item
    v-model="isExpanded"
    class="command-config"
    expand-icon-toggle
  >
    <template v-slot:header>
      <div class="row basic-config q-col-gutter-sm">
        <q-avatar size="36px" square class="featureIco">
          <q-img
            @click.stop="showIconPicker = true"
            :src="currentCommand.features.icon"
          />
        </q-avatar>
        <q-input
          ref="explainInput"
          :model-value="currentCommand.features.explain"
          filled
          dense
          @update:model-value="updateModelValue('features.explain', $event)"
          @click.stop
          placeholder="请输入名称"
          @focus="expandOnFocus && updateExpanded(true)"
          class="col"
        >
        </q-input>
        <q-select
          class="col-6 tag-select"
          :model-value="currentCommand.tags"
          @update:model-value="updateModelValue('tags', $event)"
          :options="allQuickCommandTags"
          dense
          options-dense
          filled
          use-input
          use-chips
          multiple
          hide-dropdown-icon
          new-value-mode="add-unique"
          popup-content-class="command-tag-popup"
          placeholder="标签，回车添加，最多3个"
          max-values="3"
          @new-value="tagVerify"
          input-debounce="0"
          ref="commandTagRef"
          @blur="(e) => autoAddInputVal(e, $refs.commandTagRef)"
        />
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
            class="q-ml-xs cursor-pointer"
            @click.stop="showHelp('#fa11f8c0')"
          />
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
          @update:model-value="updateModelValue('features.cmds', $event)"
        />
      </div>

      <!-- 输出和搜索面板推送 -->
      <div class="config-section">
        <div class="row q-col-gutter-sm">
          <div
            :class="{
              'col-12': from === 'quickcomposer',
              'col-8': from === 'quickcommand',
            }"
          >
            <div class="section-title">
              <q-icon name="output" size="16px" />
              <span class="q-ml-sm">输出</span>
              <q-icon
                name="help"
                class="q-ml-xs cursor-pointer"
                @click.stop="showHelp('#aT67a')"
              />
            </div>
            <ButtonGroup
              :model-value="currentCommand.output"
              :options="outputTypesOptionsDy"
              @update:model-value="updateModelValue('output', $event)"
              height="26px"
            />
          </div>
          <div
            :class="{
              'col-12': from === 'quickcomposer',
              'col-4': from === 'quickcommand',
            }"
            :style="{
              'margin-top': from === 'quickcomposer' ? '-4px' : '0',
            }"
          >
            <div class="section-title">
              <q-icon name="search" size="16px" />
              <span class="q-ml-sm q-mr-xs"> 搜索面板推送 </span>
              <q-icon
                name="help"
                class="cursor-pointer"
                @click.stop="showHelp('#YYcxD')"
              />
            </div>
            <ButtonGroup
              :model-value="currentCommand.features.mainPush"
              :options="searchPushOptions"
              @update:model-value="handleMainPushChange"
              height="26px"
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
          @update:model-value="handlePlatformChange"
          height="30px"
        />
      </div>
    </div>

    <!-- 图标选择对话框 -->
    <q-dialog v-model="showIconPicker" position="left">
      <iconPicker
        @iconChanged="(dataUrl) => updateModelValue('features.icon', dataUrl)"
        ref="icon"
      />
    </q-dialog>
  </q-expansion-item>
</template>

<script>
import { defineComponent } from "vue";
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
    expandOnFocus: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: "quickcommand",
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
    outputTypesOptionsDy() {
      const options = Object.values(this.outputTypes);
      if (this.currentCommand.features.mainPush) {
        return this.setOutputOptionDisabled(options, "text", false);
      }
      if (this.currentCommand.program === "html") {
        return this.setOutputOptionDisabled(options, "html", false);
      }
      if (
        ["quickcommand", "quickcomposer"].includes(this.currentCommand.program)
      ) {
        return this.setOutputOptionDisabled(options, "terminal", true);
      }
      return options;
    },
  },
  mounted() {
    if (!this.modelValue.features.explain) {
      setTimeout(this.$refs.explainInput.focus);
    }
    // 添加全局点击事件监听器
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    // 组件销毁前移除监听器
    document.removeEventListener("click", this.handleOutsideClick);
  },
  methods: {
    setOutputOptionDisabled(options, option, disabled = true) {
      return options.map((opt) =>
        opt.name === option
          ? { ...opt, disabled }
          : { ...opt, disabled: !disabled }
      );
    },
    updateModelValue(path, value) {
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
    showHelp(id) {
      window.showUb.help(id);
    },
    handleOutsideClick(event) {
      // 如果面板已经折叠，不需要处理
      if (!this.isExpanded) return;

      // 检查点击是否在标签选择框或文件类型选择框的弹出菜单内
      const popupMenu = document.querySelector(
        ".command-tag-popup,.file-type-popup"
      );
      if (popupMenu?.contains(event.target)) return;

      // 检查点击是否在组件内部
      const componentEl = this.$el;
      if (componentEl.contains(event.target)) return;
      this.updateExpanded(false);
    },
    handleMainPushChange(newMainPush) {
      this.updateModelValue("features.mainPush", newMainPush);
      if (newMainPush) {
        this.updateModelValue("output", "text");
      }
    },
    handlePlatformChange(newPlatform) {
      if (newPlatform.length === 0) return;
      this.updateModelValue("features.platform", newPlatform);
    },
    updateExpanded(value) {
      this.isExpanded = value;
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

.tag-select :deep(.q-field__control) {
  overflow-x: auto;
}

.tag-select :deep(.q-field__native) {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tag-select :deep(.q-field__native::-webkit-scrollbar) {
  height: 1px;
}

.command-config :deep(.q-item) {
  padding: 0;
  min-height: unset;
  cursor: default;
}

.command-config :deep(.q-item__section--side) {
  padding-left: 8px;
  padding-right: 0;
}

.command-config :deep(.q-item__section--side .q-icon) {
  top: 13px;
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
  margin-right: 10px;
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
