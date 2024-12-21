<template>
  <q-badge rounded :class="badgeClass">
    <q-icon class="q-mr-xs" :name="iconName" :style="iconStyle" />
    <span class="badge-text">{{ text }}</span>
    <q-tooltip v-if="showTooltip">
      <slot name="tooltip">
        <template v-if="cmd.type === 'add'">
          <slot />
        </template>
        <template v-else>
          <div class="text-subtitle2">{{ text }}</div>
        </template>
      </slot>
    </q-tooltip>
  </q-badge>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";
import { textDisplayRules } from "js/options/textDisplayRules.js";

export default {
  name: "CommandBadge",
  data() {
    return {
      commandTypes,
    };
  },
  props: {
    cmd: {
      type: [String, Object],
      required: true,
    },
    isGrayColor: Boolean,
    showTooltip: Boolean,
    iconStyle: Object,
    inheritColor: String,
  },
  computed: {
    badgeClass() {
      if (this.isGrayColor) {
        return this.$q.dark.isActive ? "text-grey-6 bg-grey-9" : "bg-grey-4";
      }
      const color =
        this.cmd.type === "add" && this.inheritColor
          ? this.inheritColor
          : this.commandTypes[this.cmd.type || "key"].color;
      return "bg-" + color + (this.$q.dark.isActive ? "-10" : "-4");
    },
    iconName() {
      if (typeof this.cmd === "string") {
        return this.commandTypes.key.icon;
      }
      return this.cmd.type === "add"
        ? "add"
        : this.commandTypes[this.cmd.type].icon;
    },
    text() {
      const type = typeof this.cmd === "string" ? "string" : this.cmd.type;
      return textDisplayRules[type]?.(this.cmd, false) ?? "";
    },
  },
};
</script>

<style scoped>
.q-badge {
  font-size: 12px;
  white-space: nowrap;
  max-width: var(--max-tag-width);
}

.badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
