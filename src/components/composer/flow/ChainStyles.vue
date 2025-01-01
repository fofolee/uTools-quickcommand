<template>
  <component :is="'style'" v-if="chainStyles">{{ chainStyles }}</component>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChainStyles",
  props: {
    commands: {
      type: Array,
      required: true,
    },
  },
  computed: {
    uniqueChainIds() {
      return this.commands
        .filter(
          (cmd) => cmd.chainId && cmd.commandType === cmd.commandChain?.[0]
        )
        .map((cmd) => cmd.chainId)
        .filter((chainId, index, self) => self.indexOf(chainId) === index);
    },
    chainGroups() {
      const groups = [];
      const activeGroups = new Map(); // 用于跟踪活动的组

      this.commands.forEach((cmd, index) => {
        if (cmd.chainId) {
          if (cmd.commandType === cmd.commandChain?.[0]) {
            // 开始一个新的组
            activeGroups.set(cmd.chainId, {
              chainId: cmd.chainId,
              startIndex: index,
            });
          } else if (
            cmd.commandType === cmd.commandChain?.[cmd.commandChain.length - 1]
          ) {
            // 结束一个组
            const group = activeGroups.get(cmd.chainId);
            if (group) {
              group.endIndex = index;
              groups.push({ ...group });
              activeGroups.delete(cmd.chainId);
            }
          }
        }
      });

      return groups;
    },
    styleConstants() {
      return {
        goldenRatio: 0.618033988749895,
        hueStep: 360 * 0.618033988749895,
        indent: 5,
        lightSl: "60%, 60%",
        darkSl: "60%, 40%",
      };
    },
    chainStylesMap() {
      const styles = {};
      const { hueStep, indent, lightSl, darkSl } = this.styleConstants;

      // 先添加圆角样式规则
      styles[".chain-start"] = { borderRadius: "4px 4px 0 0" };
      styles[".chain-end"] = { borderRadius: "0 4px 0 4px" };
      styles[".chain-middle"] = { borderRadius: "0 4px 0 0" };

      this.uniqueChainIds.forEach((chainId, index) => {
        const hue = (index * hueStep) % 360;
        const className = "chain-group-" + chainId;
        const depth = this.getChainDepth(chainId);
        const parentChainIds = this.getParentChainIds(chainId);

        // 生成阴影
        const shadows = parentChainIds.reduce(
          (acc, parentChainId, i) => {
            const parentIndex = this.uniqueChainIds.indexOf(parentChainId);
            const parentHue = (parentIndex * hueStep) % 360;
            const start = -((i + 2) * indent);
            acc.light.push(
              start + "px 0 0 0 hsl(" + parentHue + ", " + lightSl + ")"
            );
            acc.dark.push(
              start + "px 0 0 0 hsl(" + parentHue + ", " + darkSl + ")"
            );
            return acc;
          },
          {
            light: [-indent + "px 0 0 0 hsl(" + hue + ", " + lightSl + ")"],
            dark: [-indent + "px 0 0 0 hsl(" + hue + ", " + darkSl + ")"],
          }
        );

        // 基础样式
        const commonStyle = {
          marginLeft: "calc(" + indent + "px * " + (depth - 1) + ")",
        };

        // 生成样式规则
        styles["." + className] = {
          ...commonStyle,
          background: "hsla(" + hue + ", " + lightSl + ", 0.15)",
          boxShadow: shadows.light.join(", "),
        };

        // 暗色模式样式
        styles[".body--dark ." + className] = {
          ...commonStyle,
          background: "hsla(" + hue + ", " + darkSl + ", 0.2)",
          boxShadow: shadows.dark.join(", "),
        };
      });

      return styles;
    },
    chainStyles() {
      return Object.entries(this.chainStylesMap)
        .map(
          ([selector, rules]) =>
            selector +
            " {\n" +
            Object.entries(rules)
              .map(
                ([prop, value]) =>
                  "  " +
                  prop.replace(/([A-Z])/g, "-$1").toLowerCase() +
                  ": " +
                  value +
                  " !important;"
              )
              .join("\n") +
            "\n}"
        )
        .join("\n\n");
    },
  },
  methods: {
    getChainDepth(chainId) {
      let depth = 1;
      let currentIndex = this.commands.findIndex(
        (cmd) =>
          cmd.chainId === chainId && cmd.commandType === cmd.commandChain?.[0]
      );

      if (currentIndex === -1) return depth;

      for (let i = 0; i < currentIndex; i++) {
        const cmd = this.commands[i];
        if (cmd.chainId && cmd.commandType === cmd.commandChain?.[0]) {
          const endIndex = this.commands.findIndex(
            (c, idx) =>
              idx > i &&
              c.chainId === cmd.chainId &&
              c.commandType === cmd.commandChain?.[cmd.commandChain.length - 1]
          );
          if (endIndex > currentIndex) {
            depth++;
          }
        }
      }
      return depth;
    },
    getParentChainIds(chainId) {
      const parents = [];
      let currentIndex = this.commands.findIndex(
        (cmd) =>
          cmd.chainId === chainId && cmd.commandType === cmd.commandChain?.[0]
      );

      if (currentIndex === -1) return parents;

      for (let i = currentIndex - 1; i >= 0; i--) {
        const cmd = this.commands[i];
        if (cmd.chainId && cmd.commandType === cmd.commandChain?.[0]) {
          const endIndex = this.commands.findIndex(
            (c, idx) =>
              idx > i &&
              c.chainId === cmd.chainId &&
              c.commandType === cmd.commandChain?.[cmd.commandChain.length - 1]
          );
          if (endIndex > currentIndex) {
            parents.push(cmd.chainId);
          }
        }
      }

      return parents;
    },
    getChainGroupClass(index) {
      // 找出所有包含当前索引的组
      const matchingGroups = this.chainGroups.filter(
        (g) => index >= g.startIndex && index <= g.endIndex
      );

      // 返回所有匹配组的类名
      const classes = {};
      matchingGroups.forEach((group) => {
        classes["chain-group-" + group.chainId] = true;
        if (index === group.startIndex) {
          classes["chain-start"] = true;
        }
        if (index === group.endIndex) {
          classes["chain-end"] = true;
        }
        if (index > group.startIndex && index < group.endIndex) {
          classes["chain-middle"] = true;
        }
      });
      return classes;
    },
  },
});
</script>
