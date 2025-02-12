<template>
  <div class="matchTypesBox" :style="{ '--max-tag-width': maxTagWidth + 'px' }">
    <!-- 遍历显示可见的标签 -->
    <template v-for="(cmd, index) in visibleCommands" :key="index">
      <CommandBadge
        :cmd="cmd"
        :isGrayColor="isGrayColor"
        :showTooltip="needTooltip(cmd)"
      >
        <!-- 窗口类型标签的额外应用列表提示 -->
        <template
          v-if="cmd.type === 'window' && cmd.match.app.length > 1"
          #tooltip
        >
          <div
            class="text-subtitle2 row items-center"
            v-for="app in cmd.match.app.slice(1)"
            :key="app"
          >
            <q-icon class="q-mr-xs" :name="commandTypes.window.icon" />
            <span>{{ app }}</span>
          </div>
        </template>
      </CommandBadge>

      <!-- 窗口类型的额外应用数量标签 -->
      <CommandBadge
        v-if="cmd.type === 'window' && cmd.match.app.length > 1"
        :cmd="{ type: 'add', count: cmd.match.app.length - 1 }"
        :isGrayColor="isGrayColor"
        :iconStyle="{ width: '8px' }"
        :showTooltip="true"
        :inheritColor="commandTypes[cmd.type].color"
      >
        <!-- 显示额外的应用列表 -->
        <template #tooltip>
          <template v-for="(app, i) in cmd.match.app.slice(1)" :key="i">
            <div class="row items-center">
              <q-icon class="q-mr-xs" :name="commandTypes.window.icon" />
              <div>{{ app }}</div>
            </div>
          </template>
        </template>
      </CommandBadge>
    </template>

    <!-- 溢出标签（当标签数量超过显示限制时显示） -->
    <CommandBadge
      v-if="hasOverflow"
      :cmd="{ type: 'add', count: cmds.length - maxTagNums }"
      :isGrayColor="isGrayColor"
      :iconStyle="{ width: '7px' }"
      :showTooltip="true"
      :inheritColor="
        commandTypes[visibleCommands[visibleCommands.length - 1].type || 'key']
          .color
      "
    >
      <!-- tooltip 显示所有溢出的标签 -->
      <template #tooltip>
        <template v-for="(cmd, i) in overflowCommands" :key="i">
          <div class="row items-center">
            <q-icon class="q-mr-xs" :name="getIconName(cmd)" />
            <div>{{ getDisplayText(cmd) }}</div>
          </div>
        </template>
      </template>
    </CommandBadge>
  </div>
</template>

<script>
import CommandBadge from "./CommandBadge.vue";
import commandTypes from "js/options/commandTypes.js";
import { textDisplayRules } from "js/options/textDisplayRules.js";

export default {
  name: "CommandTypeTag",
  components: { CommandBadge },
  data() {
    return {
      commandTypes,
      textDisplayRules,
    };
  },
  props: {
    cmds: Array,
    isGrayColor: Boolean,
    // 卡片样式代码：1-mini, 2-dense, 3-normal
    cardStyleCode: Number,
  },
  computed: {
    // 根据卡片样式确定最大显示标签数
    maxTagNums() {
      return { 1: 2, 2: 3, 3: 3 }[this.cardStyleCode];
    },
    // 根据卡片样式确定容器最大宽度
    maxContainerWidth() {
      return { 1: 120, 2: 180, 3: 260 }[this.cardStyleCode];
    },
    // 计算单个标签的最大宽度
    maxTagWidth() {
      // 计算所有额外标签（溢出标记和window类型的额外应用数量标签）的总宽度
      let extraBadgesWidth = 0;

      // 先确定实际显示的标签数量
      const visibleTagCount = Math.min(this.cmds.length, this.maxTagNums);

      // 溢出标记的宽度
      if (this.hasOverflow) {
        extraBadgesWidth += 31;
      }

      // window类型的额外应用数量标签的宽度
      for (let i = 0; i < visibleTagCount; i++) {
        const cmd = this.cmds[i];
        if (cmd.type === "window" && cmd.match.app.length > 1) {
          extraBadgesWidth += 31; // 额外应用数量标签的宽度
        }
      }

      // 计算每个标签的可用宽度：(总宽度 - 额外标签总宽度 - 间距) / 标签数量
      return (
        (this.maxContainerWidth -
          extraBadgesWidth -
          (visibleTagCount - 1) * 3) /
        visibleTagCount
      );
    },
    // 是否有标签溢出（标签总数超过最大显示数量）
    hasOverflow() {
      return this.cmds.length > this.maxTagNums;
    },
    // 获取可见的标签列表
    visibleCommands() {
      return this.cmds.slice(0, this.maxTagNums);
    },
    // 获取溢出的标签列表
    overflowCommands() {
      return this.cmds.slice(this.maxTagNums);
    },
  },
  methods: {
    // 获取标签的图标名称
    getIconName(cmd) {
      return typeof cmd === "string"
        ? this.commandTypes.key.icon
        : this.commandTypes[cmd.type].icon;
    },
    // 获取标签的显示文本
    getDisplayText(cmd, isTooltip = true) {
      const type = typeof cmd === "string" ? "string" : cmd.type;
      return this.textDisplayRules[type]?.(cmd, isTooltip) ?? "";
    },
    // 计算文本宽度（考虑中英文字符宽度差异）
    getTextWidth(text) {
      let width = 0;
      for (let i = 0; i < text.length; i++) {
        // 中文字符和点占两个字符宽度
        if (/[\u4e00-\u9fa5]|[\u3000-\u303f\uff00-\uff60]/.test(text[i])) {
          width += 2;
        } else {
          width += 1;
        }
      }
      return width * 6; // 假设每个英文字符宽度为6px
    },
    // 判断是否需要显示tooltip（文本是否溢出）
    needTooltip(cmd) {
      let text;
      // 获取需要显示的文本
      if (typeof cmd === "string") {
        text = cmd;
      } else if (cmd.type === "window") {
        text = cmd.match.app[0];
      } else if (cmd.type === "regex") {
        text = cmd.match;
      } else if (cmd.type === "files") {
        text = this.getDisplayText(cmd, false);
      } else {
        return false;
      }

      // 计算文本是否超出可用宽度
      const iconWidth = 20; // 图标宽度
      const paddingWidth = 16; // 内边距宽度
      const availableWidth = this.maxTagWidth - iconWidth - paddingWidth;

      return this.getTextWidth(text) > availableWidth;
    },
  },
};
</script>

<style scoped>
.matchTypesBox {
  height: 23px;
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 3px;
}
</style>
