<template>
  <q-card-section>
    <!-- logo -->
    <div class="row">
      <q-avatar
        square
        size="48px"
        :class="{
          featureIco: 1,
          featureIcoHover: isHovered,
          'feature-disabled': !isActivated,
        }"
      >
        <img :src="commandInfo.features.icon" />
      </q-avatar>
    </div>

    <!-- 名称 -->
    <div class="row justify-end">
      <div
        class="text-ellipsis"
        v-html="purify(commandInfo.features.explain)"
      />
    </div>

    <!-- 匹配模式 -->
    <div class="row justify-end">
      <CommandTypeTag
        :cmds="commandInfo.features.cmds"
        :isGrayColor="!isPlatformSupported || !isActivated"
        :cardStyleCode="cardStyleCode"
      />
    </div>

    <!-- 语言类型 -->
    <div
      :class="{
        'platform-icons': 1,
        'platform-icons-disabled': !isActivated,
      }"
    >
      <q-img
        v-for="platform in commandInfo.features.platform"
        :key="platform"
        :src="platformTypes[platform].icon"
        width="16px"
      />
      <div>|</div>
      <q-img :src="program.icon" width="16px" />
      <div class="text-subtitle2">{{ programName }}</div>
    </div>
  </q-card-section>
</template>

<script>
import CommandTypeTag from "../CommandTypeTag.vue";
import platformTypes from "js/options/platformTypes.js";
import programs from "js/options/programs.js";

export default {
  name: "DenseLayout",
  components: { CommandTypeTag },
  props: {
    commandInfo: Object,
    isActivated: Boolean,
    isPlatformSupported: Boolean,
    isHovered: Boolean,
    cardStyleCode: Number,
  },
  data() {
    return {
      platformTypes,
      programs,
    };
  },
  computed: {
    program() {
      if (this.commandInfo.program === "quickcomposer") {
        return {
          ...this.programs.quickcommand,
          shortName: "可视化",
        };
      }
      return this.programs[this.commandInfo.program];
    },
    programName() {
      return this.program.shortName ?? this.program.name;
    },
  },
  methods: {
    purify(content) {
      return window.DOMPurify.sanitize(content);
    },
  },
};
</script>

<style scoped>
.platform-icons {
  display: flex;
  gap: 2px;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-size: 14px;
}
</style>
