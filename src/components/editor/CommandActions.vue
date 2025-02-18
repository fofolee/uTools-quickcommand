<template>
  <div class="command-actions">
    <q-btn
      label="历史"
      class="action-btn"
      dense
      flat
      stretch
      color="primary"
      :icon="isSaving ? 'check_circle' : 'history'"
      :class="{ 'saving-animation': isSaving }"
      @click="$refs.history.open()"
    ></q-btn>
    <q-btn-dropdown
      class="special-var-btn"
      dense
      flat
      stretch
      label="变量"
      color="primary"
      icon="data_object"
    >
      <q-list>
        <q-item
          v-for="(item, index) in Object.values(specialVars)"
          :key="index"
          clickable
          v-close-popup
          @click="handleSpecialVarClick(item)"
        >
          <q-item-section>
            <q-item-label class="row items-center justify-between">
              <div v-text="item.label" />
              <div v-if="item.onlyCmdTypes" class="row">
                <q-badge color="grey-9" class="q-ml-xs"> 仅 </q-badge>
                <q-badge
                  v-for="type in item.onlyCmdTypes"
                  :key="type"
                  class="q-ml-xs"
                  v-text="commandTypes[type].label"
                  color="grey-9"
                />
              </div>
            </q-item-label>
            <q-tooltip v-if="item.tooltip">
              {{ item.tooltip }}
            </q-tooltip>
            <q-item-label caption>{{ item.desc }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-separator vertical class="q-my-xs" />
    <q-btn
      v-if="!isRunCodePage"
      class="action-btn run-btn"
      dense
      flat
      stretch
      color="primary"
      icon="arrow_back"
      label="退出"
      @click="$emit('action', 'back')"
    ></q-btn>
    <q-btn
      class="action-btn run-btn"
      dense
      flat
      color="primary"
      icon="play_arrow"
      :label="`运行(${ctrlKey}B)`"
      @click="$emit('action', 'run')"
    ></q-btn>
    <q-btn
      v-if="!isRunCodePage"
      :disable="!canCommandSave"
      :color="canCommandSave ? 'primary' : 'grey'"
      class="action-btn save-btn"
      flat
      dense
      icon="save"
      :label="`保存(${ctrlKey}S)`"
      @click="$emit('action', 'save')"
    ></q-btn>

    <q-dialog v-model="showUserData">
      <UserData
        @insertText="
          insertSpecialVar($event);
          showUserData = false;
        "
        :showInsertBtn="true"
      />
    </q-dialog>

    <!-- 历史记录组件 -->
    <EditorHistory
      ref="history"
      :command-code="commandCode"
      @restore="$emit('action', 'restore', $event)"
    />
  </div>
</template>

<script>
import UserData from "components/popup/UserData.vue";
import commandTypes from "js/options/commandTypes.js";
import specialVars from "js/options/specialVars.js";
import EditorHistory from "components/popup/EditorHistory.vue";

export default {
  name: "CommandActions",
  components: {
    UserData,
    EditorHistory,
  },
  props: {
    canCommandSave: {
      type: Boolean,
      default: true,
    },
    commandCode: {
      type: String,
      default: "temp",
    },
  },
  emits: ["action"],
  data() {
    return {
      ctrlKey: window.utools.isMacOS() ? "⌘" : "⌃",
      commandTypes,
      specialVars,
      showUserData: false,
      isSaving: false,
    };
  },
  computed: {
    isRunCodePage() {
      return this.$route.name === "code";
    },
  },
  methods: {
    handleSpecialVarClick(item) {
      if (item.label === "{{usr:}}") this.showUserData = true;
      else this.insertSpecialVar(item.label);
    },
    insertSpecialVar(text) {
      if (!text) return;
      this.$emit("action", "insert-text", `"${text}"`);
    },
    tryToSave(content, program) {
      const saved = this.$refs.history.tryToSave(content, program);
      if (saved) this.showSaveAnimation();
    },
    showSaveAnimation() {
      this.isSaving = true;
      setTimeout(() => {
        this.isSaving = false;
      }, 2000);
    },
  },
};
</script>

<style scoped>
.command-actions {
  display: flex;
  align-items: center;
}

/* 保存动画 */
@keyframes saving {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(1.4);
    opacity: 0.8;
  }
  60% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.saving-animation :deep(.q-icon) {
  animation: saving 2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

/* 运行按钮动画 */
.run-btn:hover :deep(.q-icon) {
  display: inline-block;
  animation: leftRight 1.5s infinite;
}

/* 保存按钮动画 */
.save-btn:not([disabled]):hover :deep(.q-icon) {
  display: inline-block;
  animation: upDown 1.2s infinite;
}
</style>
