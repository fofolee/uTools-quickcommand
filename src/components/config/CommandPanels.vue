<template>
  <q-tab-panels
    animated
    class="absolute-right"
    :style="{
      bottom: footerBarHeight,
      left: tabBarWidth,
    }"
    v-model="currentTag"
    transition-prev="jump-down"
    transition-next="jump-up"
  >
    <q-tab-panel
      style="padding: 0"
      v-for="tag in allQuickCommandTags"
      :key="tag"
      :name="tag"
    >
      <q-scroll-area
        style="height: 100%"
        :thumb-style="{
          background: 'grey',
          width: '6px',
          opacity: 0.5,
        }"
      >
        <div class="row center q-pa-xs">
          <CommandCard
            v-for="commandInfo in currentTagQuickCommands"
            :key="commandInfo.features.code"
            :commandInfo="commandInfo"
            :isCommandActivated="
              activatedQuickCommandFeatureCodes.includes(
                commandInfo.features.code
              )
            "
            :cardStyle="cardStyleSheet[$root.profile.commandCardStyle]"
            @commandChanged="$emit('command-changed', $event)"
            :style="{
              width: cardStyleSheet[$root.profile.commandCardStyle].width,
            }"
            class="relative-position q-pa-sm"
          ></CommandCard>
        </div>
      </q-scroll-area>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script>
import CommandCard from "components/CommandCard.vue";

export default {
  name: "CommandPanels",
  components: {
    CommandCard,
  },
  data() {
    return {
      cardStyleSheet: {
        mini: {
          width: "20%",
          code: 1,
        },
        dense: {
          width: "33%",
          code: 2,
        },
        normal: {
          width: "50%",
          code: 3,
        },
        large: {
          width: "100%",
          code: 4,
        },
      },
    };
  },
  props: {
    footerBarHeight: {
      type: String,
      required: true,
    },
    tabBarWidth: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    allQuickCommandTags: {
      type: Array,
      required: true,
    },
    currentTagQuickCommands: {
      type: Array,
      required: true,
    },
    activatedQuickCommandFeatureCodes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    currentTag: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  emits: ["update:modelValue", "command-changed"],
};
</script>

<style scoped>
.q-tab-panels {
  background: transparent;
}

/* 面板过渡效果 */
.q-tab-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
