<template>
  <component :is="'style'" v-if="styles">{{ styles }}</component>
</template>

<script>
import { defineComponent, computed } from "vue";

// 样式常量
const STYLE_CONSTANTS = {
  hueStep: 360 * 0.618033988749895,
  indent: 5,
  lightSl: "70%, 60%",
  darkSl: "60%, 60%",
};

// 工具函数
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
};

const generateStyleString = (selector, rules) => {
  return `${selector} {
${Object.entries(rules)
  .map(
    ([prop, value]) =>
      `  ${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value} !important;`
  )
  .join("\n")}
}`;
};

const generateShadows = (parentChainIds, hue, indent, lightSl, darkSl) => {
  return parentChainIds.reduce(
    (acc, parentChainId, i) => {
      const parentHue =
        (Math.abs(hashString(parentChainId)) * STYLE_CONSTANTS.hueStep) % 360;
      const start = -((i + 2) * indent);
      acc.light.push(`${start}px 0 0 0 hsl(${parentHue}, ${lightSl})`);
      acc.dark.push(`${start}px 0 0 0 hsl(${parentHue}, ${darkSl})`);
      return acc;
    },
    {
      light: [`-${indent}px 0 0 0 hsl(${hue}, ${lightSl})`],
      dark: [`-${indent}px 0 0 0 hsl(${hue}, ${darkSl})`],
    }
  );
};

// 获取链组
const getChainGroups = (commands) => {
  const groups = [];
  const activeGroups = new Map();

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (!cmd.chainId) continue;

    if (cmd.commandType === cmd.commandChain?.[0]) {
      activeGroups.set(cmd.chainId, {
        chainId: cmd.chainId,
        startIndex: i,
      });
    } else if (
      cmd.commandType === cmd.commandChain?.[cmd.commandChain.length - 1]
    ) {
      const group = activeGroups.get(cmd.chainId);
      if (group) {
        group.endIndex = i;
        groups.push({ ...group });
        activeGroups.delete(cmd.chainId);
      }
    }
  }

  return groups;
};

export default defineComponent({
  name: "ChainStyles",
  props: {
    commands: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chainGroups = computed(() => getChainGroups(props.commands));

    // 根据 chainId 获取固定的色相值
    const getChainHue = (chainId) => {
      const hash = Math.abs(hashString(chainId));
      return (hash * STYLE_CONSTANTS.hueStep) % 360;
    };

    // 将样式生成逻辑移到 computed 中
    const styles = computed(() => {
      if (!props.commands?.length) {
        return "";
      }

      try {
        // 1. 获取唯一的链ID
        const uniqueChainIds = [
          ...new Set(
            props.commands
              .filter(
                (cmd) =>
                  cmd.chainId && cmd.commandType === cmd.commandChain?.[0]
              )
              .map((cmd) => cmd.chainId)
          ),
        ];

        // 2. 使用计算好的链组
        const groups = chainGroups.value;

        // 3. 生成样式
        const styleRules = {};
        const { indent, lightSl, darkSl } = STYLE_CONSTANTS;

        uniqueChainIds.forEach((chainId) => {
          // 使用固定的色相值
          const hue = getChainHue(chainId);
          const className = "chain-group-" + chainId;

          // 计算深度
          const currentGroup = groups.find((g) => g.chainId === chainId);
          if (!currentGroup) return;

          let depth = 1;
          const parents = [];

          for (const group of groups) {
            if (
              group.startIndex < currentGroup.startIndex &&
              group.endIndex > currentGroup.endIndex
            ) {
              depth++;
              parents.push(group.chainId);
            }
          }

          const shadows = generateShadows(
            parents,
            hue,
            indent,
            lightSl,
            darkSl
          );

          const commonStyle = {
            marginLeft: `calc(${indent}px * ${depth - 1})`,
          };

          styleRules["." + className] = {
            ...commonStyle,
            boxShadow: shadows.light.join(", "),
          };

          styleRules["." + className + " .control-type-label"] = {
            color: `hsl(${hue}, ${lightSl})`,
          };

          styleRules[".body--dark ." + className] = {
            ...commonStyle,
            boxShadow: shadows.dark.join(", "),
          };

          styleRules[".body--dark ." + className + " .control-type-label"] = {
            color: `hsl(${hue}, ${darkSl})`,
          };
        });

        // 4. 生成最终的样式字符串
        return Object.entries(styleRules)
          .map(([selector, rules]) => generateStyleString(selector, rules))
          .join("\n\n");
      } catch (error) {
        console.error("Error generating chain styles:", error);
        return "";
      }
    });

    return {
      styles,
      getChainGroupClass(index) {
        const classes = {};
        for (const group of chainGroups.value) {
          if (index >= group.startIndex && index <= group.endIndex) {
            classes[`chain-group-${group.chainId}`] = true;

            if (index === group.startIndex) {
              classes["chain-start"] = true;
            } else if (index === group.endIndex) {
              classes["chain-end"] = true;
            } else {
              classes["chain-middle"] = true;
              //清除嵌套控制流程的冲突样式
              classes["chain-start"] = false;
              classes["chain-end"] = false;
            }
          }
        }
        return classes;
      },
    };
  },
});
</script>
