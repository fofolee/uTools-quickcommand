<template>
  <CommandComposer
    ref="composer"
    @action="handleComposerAction"
    v-model="commandManager.state.currentCommand"
    :disabled-control-buttons="disabledControlButtons"
    class="fixed-full"
  />
  <q-dialog v-model="showHelpDialog">
    <q-card style="width: 450px">
      <div class="q-pa-md">
        <div class="text-h6 q-mb-md">👏🏻 欢迎使用可视化编排</div>
        <div class="q-mb-sm">由于编排功能众多，推荐先查看教程再使用</div>
        <div class="q-mb-sm">
          <q-btn dense color="primary" flat @click="showHelp('#TMtYg')">
            完整教程
          </q-btn>
        </div>
        <div class="q-mb-sm">
          <q-btn dense color="primary" flat @click="showHelp('#JqM2f')">
            快速入门：浏览器控制典型案例
          </q-btn>
        </div>
        <div class="row items-center">
          <div>你随时可以点击右上角的</div>
          <q-icon name="help" class="q-ml-xs" size="13px" />
          <div>帮助按钮，再次查看教程</div>
        </div>
      </div>
      <div class="flex justify-end q-pa-sm">
        <q-btn
          flat
          dense
          label="我知道了"
          @click="showHelpDialog = false"
        />
      </div>
    </q-card>
  </q-dialog>
  <!-- 运行结果 -->
  <CommandRunResult ref="result"></CommandRunResult>
</template>

<script>
import CommandComposer from "components/composer/CommandComposer.vue";
import CommandRunResult from "components/CommandRunResult";
import { useCommandManager } from "js/commandManager.js";
import { dbManager } from "js/utools";
import { ref } from "vue";

export default {
  components: { CommandComposer, CommandRunResult },
  setup() {
    const hasRunComposer = dbManager.getStorage("st_hasRunComposer");
    const showHelpDialog = ref(false);
    if (!hasRunComposer) {
      showHelpDialog.value = true;
      dbManager.setStorage("st_hasRunComposer", true);
    }

    const commandManager = useCommandManager();

    const defaultCommand = commandManager.getDefaultCommand("quickcomposer");

    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...commandManager.getFullComposerCommand(
        commandManager.state.currentCommand
      ),
    };

    return {
      commandManager,
      showHelpDialog,
    };
  },
  emits: ["editorEvent"],
  computed: {
    isRunComposerPage() {
      return this.$route.name === "composer";
    },
    disabledControlButtons() {
      return this.isRunComposerPage ? ["close", "save", "apply"] : ["apply"];
    },
  },
  methods: {
    handleComposerAction(actionType, command) {
      switch (actionType) {
        case "run":
          return this.runCurrentCommand(command);
        case "close":
          return this.$emit("editorEvent", "back");
        case "save":
          return this.$emit(
            "editorEvent",
            "save",
            this.commandManager.getLitedComposerCommand(command)
          );
      }
    },
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
    showHelp(id) {
      window.showUb.help(id);
    },
  },
};
</script>
