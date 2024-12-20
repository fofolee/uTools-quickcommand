<template>
  <!-- mini 模式下如果命令未启用或者不可直接运行则隐藏卡片面板 -->
  <div
    :class="{
      'card-wrapper': 1,
      'card-wrapper-hover': isWarpperHover,
    }"
    v-show="!cardStyleVars.hideCard"
    :id="commandInfo.features.code"
    @mouseenter="isWarpperHover = true"
    @mouseleave="if (!$refs.controlButtons?.isMenuOpen) isWarpperHover = false;"
  >
    <!-- mini 模式下不显示各类按钮 -->
    <ControlButtons
      ref="controlButtons"
      v-model:isVisible="isWarpperHover"
      v-show="cardStyleVars.showButtons"
      :isActivated="isCommandActivated"
      :isRunButtonVisible="canRunInConfigurationPage"
      :commandInfo="commandInfo"
      @commandChanged="$emit('commandChanged', $event)"
    />
    <CommandCardContent
      :commandInfo="commandInfo"
      :isActivated="isCommandActivated"
      :isPlatformSupported="isPlatformSupported"
      :cardStyleVars="cardStyleVars"
      :isHovered="isWarpperHover"
      @click="handleCardClick"
    />
  </div>
</template>

<script>
import ControlButtons from "components/card/ControlButtons.vue";
import CommandCardContent from "components/card/CommandCardContent.vue";

export default {
  components: {
    ControlButtons,
    CommandCardContent,
  },
  data() {
    return {
      isWarpperHover: false,
    };
  },
  computed: {
    // 控制卡片样式的具体参数
    cardStyleVars() {
      return {
        showButtons: this.cardStyle.code > 1,
        showPlatforms: this.cardStyle.code > 2,
        showLanguages: this.cardStyle.code > 1,
        showBiggerTitle: this.cardStyle.code > 2,
        logoPosition:
          this.cardStyle.code > 1 ? "justify-start" : "justify-center",
        fontPosition:
          this.cardStyle.code > 1 ? "justify-end" : "justify-center",
        hideCard: this.cardStyle.code === 1 && !this.canRunInConfigurationPage,
      };
    },
    isPlatformSupported() {
      let { platform } = this.commandInfo.features;
      return !_.isEmpty(platform) && !platform.includes(window.processPlatform)
        ? false
        : true;
    },
    canRunInConfigurationPage() {
      // 未启用
      if (!this.isCommandActivated) return false;
      // 平台不支持
      if (!this.isPlatformSupported) return false;
      let { cmds } = this.commandInfo.features;
      // 窗口模式
      if (cmds[0].type && cmds[0].type === "window") return false;
      return true;
    },
  },
  props: {
    commandInfo: Object,
    isCommandActivated: Boolean,
    cardStyle: Object,
  },
  methods: {
    // 命令卡片点击事件
    handleCardClick() {
      // 视图模式直接运行命令
      if (this.cardStyle.code === 1) {
        return this.$refs.controlButtons.runCommand();
      }
      this.editCommand();
    },
    // 编辑命令
    editCommand() {
      let event = {
        type: "edit",
        data: this.commandInfo.features.code,
      };
      this.$emit("commandChanged", event);
    },
  },
};
</script>

<style scoped>
.q-card.command {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(calc(var(--glass-effect-strength) * 1px)) !important;
  -webkit-backdrop-filter: blur(
    calc(var(--glass-effect-strength) * 1px)
  ) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.07);
}

.body--dark .q-card.command {
  background: rgba(57, 57, 57, 0.09) !important;
  border: 1px solid rgb(59 58 58 / 5%);
  box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%),
    0 3px 1px -2px rgb(69 67 67 / 12%);
}

.card-wrapper {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.card-wrapper-hover {
  transform: scale(1.02);
}
</style>
