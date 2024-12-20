<template>
  <span v-if="typeof cmd === 'string'">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.key.icon" />
      <span class="badge-text">{{ cmd }}</span>
    </q-badge>
    <q-tooltip>
      <div class="text-subtitle2">{{ cmd }}</div>
    </q-tooltip>
  </span>
  <span v-else-if="cmd.type === 'window' && cmd.match">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.window.icon" />
      <span class="badge-text">{{ cmd.match.app[0] }}</span>
    </q-badge>
    <q-tooltip>
      <div class="text-subtitle2" v-for="app in cmd.match.app" :key="app">
        {{ app }}
      </div>
    </q-tooltip>
  </span>
  <span v-else-if="cmd.type === 'files'">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.files.icon" />
      <span class="badge-text">{{ cmd.match || "所有文件" }}</span>
    </q-badge>
    <q-tooltip>
      <div class="text-subtitle2">
        {{ cmd.match || "所有文件" }}
      </div>
    </q-tooltip>
  </span>
  <span v-else-if="cmd.type === 'regex'">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.regex.icon" />
      <span class="badge-text">{{ cmd.match }}</span>
    </q-badge>
    <q-tooltip>
      <div class="text-subtitle2">
        {{ cmd.match }}
      </div>
    </q-tooltip>
  </span>
  <span v-else-if="cmd.type === 'over'">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.over.icon" />所有文本
    </q-badge>
  </span>
  <span v-else-if="cmd.type === 'img'">
    <q-badge rounded :class="badgeClass">
      <q-icon class="q-mr-xs" :name="commandTypes.img.icon" />图片
    </q-badge>
  </span>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";

export default {
  props: {
    cmd: [String, Object],
    isGrayColor: Boolean,
  },
  data() {
    return {
      commandTypes,
    };
  },
  computed: {
    badgeClass() {
      return this.isGrayColor
        ? this.$q.dark.isActive
          ? "text-grey-6 bg-grey-9"
          : "bg-grey-5"
        : "bg-" + this.commandTypes[this.cmd.type || "key"].color;
    },
  },
};
</script>

<style scoped>
.q-badge {
  font-size: 13px;
  margin: 0 1px;
  max-width: 120px;
  white-space: nowrap;
}

.badge-text {
  display: inline-block;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>
