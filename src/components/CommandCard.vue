<template>
  <!-- mini 模式下如果命令未启用或者不可直接运行则隐藏卡片面板 -->
  <div
    :class="{
      'card-wrapper': 1,
      'card-wrapper-hover': isWarpperHover,
    }"
    v-if="canRunInConfigurationPage || cardStyle.code > 1"
    :id="commandInfo.features.code"
    @mouseenter="isWarpperHover = true"
    @mouseleave="if (!$refs.controlButtons?.isMenuOpen) isWarpperHover = false;"
  >
    <!-- mini 模式下不显示各类按钮 -->
    <ControlButtons
      ref="controlButtons"
      v-model:isVisible="isWarpperHover"
      v-show="cardStyle.code > 1"
      :toggleBtnSize="cardStyle.code === 3 ? 'xs' : 'sm'"
      :isActivated="isCommandActivated"
      :isRunButtonVisible="canRunInConfigurationPage"
      :commandInfo="commandInfo"
      @commandChanged="$emit('commandChanged', $event)"
    />
    <CommandCardContent
      :commandInfo="commandInfo"
      :isActivated="isCommandActivated"
      :isPlatformSupported="isPlatformSupported"
      :isHovered="isWarpperHover"
      :cardStyleCode="cardStyle.code"
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
    isPlatformSupported() {
      let { platform } = this.commandInfo.features;
      return !window.lodashM.isEmpty(platform) &&
        !platform.includes(window.processPlatform)
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
      // mini视图模式直接运行命令
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
.card-wrapper {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width;
  transform-origin: center center;
}

.card-wrapper-hover {
  transform: translateY(-1px);
}
</style>
