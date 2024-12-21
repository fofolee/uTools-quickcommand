<template>
  <q-card
    @click="$emit('click')"
    v-ripple
    :class="{ [`text-${disabledColor}`]: !isActivated, command: 1 }"
  >
    <component
      :is="currentLayout"
      :commandInfo="commandInfo"
      :isActivated="isActivated"
      :isPlatformSupported="isPlatformSupported"
      :isHovered="isHovered"
      :style="iconHaloStyle"
      :cardStyleCode="cardStyleCode"
    />
  </q-card>
</template>

<script>
import ListLayout from "./layouts/ListLayout.vue";
import DenseLayout from "./layouts/DenseLayout.vue";
import MiniLayout from "./layouts/MiniLayout.vue";

export default {
  components: {
    ListLayout,
    DenseLayout,
    MiniLayout,
  },
  props: {
    commandInfo: Object,
    isActivated: Boolean,
    cardStyleCode: Number,
    isPlatformSupported: Boolean,
    isHovered: Boolean,
  },
  emits: ["click"],
  computed: {
    currentLayout() {
      switch (this.cardStyleCode) {
        case 3:
          return "ListLayout";
        case 2:
          return "DenseLayout";
        case 1:
          return "MiniLayout";
        default:
          return "DenseLayout";
      }
    },
    disabledColor() {
      return this.$q.dark.isActive ? "grey-6" : "grey-5";
    },
    iconHaloStyle() {
      return {
        "--icon-url": `url(${this.commandInfo.features.icon})`,
      };
    },
  },
};
</script>

<style scoped>
/* 保留卡片基础样式 */
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
</style>
