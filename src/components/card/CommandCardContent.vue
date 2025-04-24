<template>
  <q-card
    @click="$emit('click')"
    v-ripple
    :class="{ [`text-${disabledColor}`]: !isActivated, command: 1 }"
  >
    <q-badge floating transparent style="z-index: 1000" v-if="isActivated">
      <q-btn
        flat
        round
        dense
        :color="isPinned ? 'amber' : 'grey'"
        icon="push_pin"
        @click.stop="togglePin"
        size="12px"
      >
        <q-tooltip>{{ isPinned ? "取消固定到桌面" : "固定到桌面" }}</q-tooltip>
      </q-btn>
    </q-badge>

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
    isPinned() {
      return (
        this.$root.nativeProfile.pinnedCommands?.some(
          (cmd) => cmd.info.features.code === this.commandInfo.features.code
        ) || false
      );
    },
  },
  methods: {
    async togglePin() {
      if (this.isPinned) {
        window.pinService.removePinWindow(this.commandInfo.features.code);
        this.$root.nativeProfile.pinnedCommands =
          this.$root.nativeProfile.pinnedCommands.filter(
            (cmd) => cmd.info.features.code !== this.commandInfo.features.code
          );
      } else {
        await window.pinService.createPinWindow(this.commandInfo);
        if (!this.$root.nativeProfile.pinnedCommands) {
          this.$root.nativeProfile.pinnedCommands = [];
        }
        this.$root.nativeProfile.pinnedCommands.push({
          info: this.commandInfo,
          position: utools.getCursorScreenPoint(),
        });
      }
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

.pin-icon {
  opacity: 0;
  transform: translateY(-5px);
  visibility: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, visibility;
}

.q-card:hover .pin-icon {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  backdrop-filter: blur(1px);
}

.pin-icon .q-btn {
  transition: transform 0.35s cubic-bezier(0.68, -0.6, 0.32, 1.6);
  will-change: transform;
}

.pin-icon .q-btn:hover {
  transform: scale(1.15);
}
</style>
