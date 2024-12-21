<template>
  <div class="matchTypesBox">
    <div v-for="cmd in cmds" :key="cmd">
      <span v-if="typeof cmd === 'string'">
        <q-badge rounded :class="getBadgeClass(cmd)">
          <q-icon class="q-mr-xs" :name="commandTypes.key.icon" />
          <span class="badge-text">{{ cmd }}</span>
        </q-badge>
        <q-tooltip>
          <div class="text-subtitle2">{{ cmd }}</div>
        </q-tooltip>
      </span>
      <span v-else-if="cmd.type === 'window' && cmd.match">
        <q-badge rounded :class="getBadgeClass(cmd)">
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
        <q-badge rounded :class="getBadgeClass(cmd)">
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
        <q-badge rounded :class="getBadgeClass(cmd)">
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
        <q-badge rounded :class="getBadgeClass(cmd)">
          <q-icon class="q-mr-xs" :name="commandTypes.over.icon" />所有文本
        </q-badge>
      </span>
      <span v-else-if="cmd.type === 'img'">
        <q-badge rounded :class="getBadgeClass(cmd)">
          <q-icon class="q-mr-xs" :name="commandTypes.img.icon" />图片
        </q-badge>
      </span>
    </div>
  </div>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";

export default {
  name: "CommandTypeTag",
  props: {
    cmds: Array,
    isGrayColor: Boolean,
  },
  data() {
    return {
      commandTypes,
    };
  },
  methods: {
    getBadgeClass(cmd) {
      if (this.isGrayColor) {
        return this.$q.dark.isActive ? "text-grey-6 bg-grey-9" : "bg-grey-4";
      }
      const color = this.commandTypes[cmd.type || "key"].color;
      return "bg-" + color + (this.$q.dark.isActive ? "-10" : "-4");
    },
  },
};
</script>

<style scoped>
.matchTypesBox {
  height: 23px;
  display: flex;
  overflow: hidden;
  gap: 2px;
}

.q-badge {
  font-size: 12px;
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

.tags-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
}

.tag-wrapper {
  display: inline-flex;
  white-space: nowrap;
}
</style>
