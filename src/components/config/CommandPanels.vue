<template>
  <q-tab-panels
    animated
    class="absolute-right"
    :style="{
      bottom: footerBarHeight,
      left: tabBarWidth,
    }"
    v-model="currentTag"
    transition-duration="0"
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
        <draggable
          :model-value="currentTagQuickCommands"
          @update:model-value="handleCommandsReorder"
          :component-data="{
            type: 'div',
            class: 'row center command-items',
          }"
          item-key="features.code"
          handle=".q-card"
          :disabled="currentTag === '默认' || currentTag === '搜索结果'"
        >
          <template #item="{ element: commandInfo }">
            <div
              :key="commandInfo.features.code"
              :style="{
                width: cardStyleSheet[$root.profile.commandCardStyle].width,
              }"
              class="relative-position q-pa-sm command-item"
            >
              <CommandCard
                :commandInfo="commandInfo"
                :isCommandActivated="
                  activatedQuickCommandFeatureCodes.includes(
                    commandInfo.features.code
                  )
                "
                :cardStyle="cardStyleSheet[$root.profile.commandCardStyle]"
                @commandChanged="$emit('command-changed', $event)"
              ></CommandCard>
            </div>
          </template>
        </draggable>
      </q-scroll-area>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script>
import CommandCard from "components/CommandCard.vue";
import draggable from "vuedraggable";
import { useCommandManager } from "js/commandManager.js";
import { dbManager } from "js/utools.js";

export default {
  name: "CommandPanels",
  components: {
    CommandCard,
    draggable,
  },
  data() {
    return {
      commandManager: useCommandManager(),
      cardStyleSheet: {
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
  props: {
    footerBarHeight: {
      type: String,
      required: true,
    },
    tabBarWidth: {
      type: String,
      required: true,
    },
  },
  computed: {
    currentTag: {
      get() {
        return this.commandManager.state.currentTag;
      },
      set(value) {
        this.commandManager.state.currentTag = value;
      },
    },
    allQuickCommandTags() {
      return this.commandManager.state.allQuickCommandTags;
    },
    activatedQuickCommandFeatureCodes() {
      return this.commandManager.state.activatedQuickCommandFeatureCodes;
    },
    commandSearchKeyword() {
      return this.commandManager.state.commandSearchKeyword;
    },
    allQuickCommands() {
      return this.commandManager.state.allQuickCommands;
    },
    // 当前标签下的所有快捷命令
    currentTagQuickCommands() {
      let commands = Object.values(
        window.lodashM.cloneDeep(this.allQuickCommands)
      );

      // 根据 order 排序
      const sortByOrder = (cmds) => {
        return cmds.sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      };

      switch (this.currentTag) {
        case "未分类":
          return sortByOrder(
            commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0)
          );
        case "搜索结果":
          if (this.commandSearchKeyword?.length < 2) return;
          let searchResult = [];
          commands.forEach((cmd) => {
            // 拼音搜索
            let explain = cmd.features.explain;
            let matchedWordPositions = window.pinyinMatch.match(
              explain,
              this.commandSearchKeyword
            );
            if (!matchedWordPositions) return;
            let matchedWords = explain.slice(
              matchedWordPositions[0],
              matchedWordPositions[1] + 1
            );
            // 高亮
            cmd.features.explain = explain.replace(
              matchedWords,
              `<strong style="color:#ed6237">${matchedWords}</strong>`
            );
            searchResult.push(cmd);
          });
          return searchResult;
        case "默认":
          return commands.filter((cmd) => cmd.tags?.includes(this.currentTag));
        default:
          return sortByOrder(
            commands.filter((cmd) => cmd.tags?.includes(this.currentTag))
          );
      }
    },
  },
  methods: {
    handleCommandsReorder(commands) {
      // 更新当前tag下的命令顺序
      const tagCommands = {};
      commands.forEach((command, index) => {
        tagCommands[command.features.code] = {
          ...command,
          order: index, // 添加排序信息
        };
      });

      // 更新存储
      this.commandManager.state.allQuickCommands = {
        ...this.allQuickCommands,
        ...tagCommands,
      };

      // 只保存被修改的命令
      this.saveCurrentTagOrderedCommand(tagCommands);
    },
    saveCurrentTagOrderedCommand(tagCommands) {
      // 只保存被修改的命令
      Object.entries(tagCommands).forEach(([code, command]) => {
        if (!this.commandManager.isDefaultCommand(code)) {
          dbManager.putDB(window.lodashM.cloneDeep(command), "qc_" + code);
        }
      });
    },
  },
  emits: ["command-changed"],
};
</script>

<style scoped>
/* 面板过渡效果 */
.q-tab-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-items {
  padding-right: 4px;
  margin-left: -4px;
}

.command-item {
  transition: all 0.5s;
}
</style>
