<template>
  <q-menu anchor="top end" self="top start">
    <q-list>
      <!-- 导入 -->
      <q-item clickable v-close-popup @click="importCommand(importCommandFromFile())">
        <q-item-section side>
          <q-icon name="text_snippet" />
        </q-item-section>
        <q-item-section>从文件导入命令</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="importCommand(importCommandFromClipboard())">
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
      <q-item style="color: red" clickable v-close-popup @click="clearAllCommands">
        <q-item-section side>
          <q-icon name="delete" />
        </q-item-section>
        <q-item-section>清空数据</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
export default {
  name: 'CommandManageMenu',
  computed: {
    configurationPage() {
      return this.$root.$refs.view;
    }
  },
  methods: {
    importCommand(command) {
      this.configurationPage.importCommand(command);
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
    exportAllCommands() {
      this.configurationPage.exportAllCommands();
    },
    clearAllCommands() {
      this.configurationPage.clearAllCommands();
    },
    enableAllCommands() {
      document.querySelectorAll('.q-toggle[aria-checked="false"]')
        .forEach(x => x.click());
    },
    disableAllCommands() {
      document.querySelectorAll('.q-toggle[aria-checked="true"]')
        .forEach(x => x.click());
    }
  }
};
</script>
