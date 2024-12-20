<template>
  <q-card
    @click="$emit('click')"
    v-ripple
    :class="{ [`text-${disabledColor}`]: !isActivated, command: 1 }"
  >
    <q-card-section>
      <!-- logo -->
      <div class="row" :class="cardStyleVars.logoPosition">
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
      <div :class="'row ' + cardStyleVars.fontPosition">
        <div
          class="ellipsis"
          :style="{
            fontSize: cardStyleVars.showBiggerTitle ? '16px' : '14px',
          }"
          v-html="commandInfo.features.explain.trim() || '<br/>'"
        />
      </div>

      <!-- 匹配模式 -->
      <div class="row">
        <div
          :class="
            'matchTypesBox flex q-gutter-xs ' + cardStyleVars.fontPosition
          "
        >
          <span v-for="cmd in commandInfo.features.cmds" :key="cmd">
            <CommandTypeTag
              :cmd="cmd"
              :isGrayColor="!isPlatformSupported || !isActivated"
            />
          </span>
        </div>
      </div>

      <!-- 语言类型和适配系统 -->
      <div
        class="row justify-end items-center q-gutter-xs"
        v-show="cardStyleVars.showLanguages"
      >
        <span :class="`text-${programColor}`">●</span>
        <span class="text-subtitle2">{{ commandInfo.program }}</span>

        <div class="q-gutter-xs" v-show="cardStyleVars.showPlatforms">
          <span
            v-for="platform in commandInfo.features.platform"
            :key="platform"
            :class="`iconfont icon-${platformTypes[platform].icon} text-${programColor}`"
            style="font-size: 12px"
          ></span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";
import platformTypes from "js/options/platformTypes.js";
import CommandTypeTag from "./CommandTypeTag.vue";

export default {
  components: {
    CommandTypeTag,
  },
  props: {
    commandInfo: Object,
    isActivated: Boolean,
    cardStyleVars: Object,
    isPlatformSupported: Boolean,
    isHovered: Boolean,
  },
  emits: ["click"],
  data() {
    return {
      commandTypes,
      platformTypes,
    };
  },
  computed: {
    programColor() {
      return this.isActivated
        ? this.$root.programs[this.commandInfo.program].color
        : this.disabledColor;
    },
    disabledColor() {
      return this.$q.dark.isActive ? "grey-6" : "grey-5";
    },
  },
  mounted() {
    // 设置图标URL作为光晕背景
    this.$el.style.setProperty(
      "--icon-url",
      `url(${this.commandInfo.features.icon})`
    );
  },
  watch: {
    "commandInfo.features.icon"(newVal) {
      this.$el.style.setProperty("--icon-url", `url(${newVal})`);
    },
  },
};
</script>

<style scoped>
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.matchTypesBox {
  height: 23px;
  width: 100%;
  overflow: hidden;
  text-align: right;
}

.featureIco {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
  position: relative;
  z-index: 1;
}

.featureIcoHover {
  transform: scale(1.08) translateY(-2px);
}

.featureIco::after {
  content: "";
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  background-image: var(--icon-url);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(8px) brightness(1.1);
  transform: scale(1.05);
  pointer-events: none;
}

.featureIcoHover::after {
  opacity: 0.8;
  transform: scale(1.1);
}

.feature-disabled {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
