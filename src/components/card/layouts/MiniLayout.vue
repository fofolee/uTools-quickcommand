<template>
  <div class="mini-layout">
    <!-- logo -->
    <div class="row justify-center">
      <q-avatar
        square
        size="48px"
        :class="{
          featureIco: 1,
          featureIcoHover: isHovered,
        }"
      >
        <img :src="commandInfo.features.icon" />
      </q-avatar>
    </div>

    <!-- 名称 -->
    <div class="row justify-center w-100">
      <div
        class="text-ellipsis text-center"
        v-html="purify(commandInfo.features.explain)"
      />
    </div>

    <!-- 匹配模式 -->
    <div class="row justify-center w-100">
      <CommandTypeTag
        :cmds="commandInfo.features.cmds"
        :cardStyleCode="cardStyleCode"
      />
    </div>
  </div>
</template>

<script>
import CommandTypeTag from "../CommandTypeTag.vue";
import platformTypes from "js/options/platformTypes.js";

export default {
  name: "MiniLayout",
  components: { CommandTypeTag },
  props: {
    commandInfo: Object,
    isHovered: Boolean,
    cardStyleCode: Number,
  },
  setup() {
    return {
      platformTypes,
    };
  },
  methods: {
    purify(content) {
      return window.DOMPurify.sanitize(content);
    },
  },
};
</script>

<style scoped>
.mini-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px 8px;
}

.w-100 {
  width: 100%;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* max-width: 90%; */
  margin: 0 auto;
  /* padding: 0 8px; */
  font-size: 14px;
}
</style>
