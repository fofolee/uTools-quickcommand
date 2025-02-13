<template>
  <q-menu anchor="top end" self="top start">
    <q-list>
      <!-- 导入 -->
      <q-item
        clickable
        v-close-popup
        @click="importCommand(importCommandFromFile())"
      >
        <q-item-section side>
          <q-icon name="text_snippet" />
        </q-item-section>
        <q-item-section>从文件导入命令</q-item-section>
      </q-item>
      <q-item
        clickable
        v-close-popup
        @click="importCommand(importCommandFromClipboard())"
      >
        <q-item-section side>
          <q-icon name="content_paste" />
        </q-item-section>
        <q-item-section>从剪贴板导入命令</q-item-section>
      </q-item>
      <!-- 导出 -->
      <q-item clickable v-close-popup @click="exportAllCommands">
        <q-item-section side>
          <q-icon name="file_upload" />
        </q-item-section>
        <q-item-section>导出所有命令</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="enableAllCommands">
        <q-item-section side>
          <q-icon name="checklist_rtl" />
        </q-item-section>
        <q-item-section>启用本页所有命令</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="disableAllCommands">
        <q-item-section side>
          <q-icon name="remove_done" />
        </q-item-section>
        <q-item-section>禁用本页所有命令</q-item-section>
      </q-item>
      <!-- 清空 -->
      <q-item
        style="color: red"
        clickable
        v-close-popup
        @click="clearAllCommands"
      >
        <q-item-section side>
          <q-icon name="delete" />
        </q-item-section>
        <q-item-section>清空数据</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
import { useCommandManager } from "src/js/commandManager";

export default {
  name: "CommandManageMenu",
  data() {
    return {
      commandManager: useCommandManager(),
    };
  },
  methods: {
    importCommand(command) {
      this.commandManager.importCommand(command);
    },
    importCommandFromFile() {
      let options = {
        type: "dialog",
        argvs: { filters: [{ name: "json", extensions: ["json"] }] },
        readfile: true,
      };
      let fileContent = window.getFileInfo(options);
      return fileContent ? fileContent.data : false;
    },
    importCommandFromClipboard() {
      return window.clipboardReadText();
    },
    // 全部导出
    exportAllCommands(saveAsFile = true) {
      if (this.commandManager.exportAllCommands(saveAsFile)) {
        quickcommand.showMessageBox("导出成功！");
      }
    },
    // 清空
    clearAllCommands() {
      quickcommand
        .showConfirmBox("将会清空所有自定义命令，停用所有实用功能，请确认！")
        .then((isConfirmed) => {
          if (!isConfirmed) {
            return quickcommand.showMessageBox("取消操作", "info");
          }
          this.commandManager.clearAllCommands();
          quickcommand.showMessageBox(
            "清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复",
            "success",
            2000,
            "bottom-right"
          );
        });
    },
    enableAllCommands() {
      document
        .querySelectorAll('.q-toggle[aria-checked="false"]')
        .forEach((x) => x.click());
    },
    disableAllCommands() {
      document
        .querySelectorAll('.q-toggle[aria-checked="true"]')
        .forEach((x) => x.click());
    },
  },
};
</script>
