<template>
  <div class="server-page">
    <CodeEditor
      v-model="cmd"
      @update:modelValue="saveCode"
      language="quickcommand"
      style="flex: 1"
    />
    <div class="flex items-center justify-between q-px-md shadow-10">
      <div class="q-gutter-xs flex items-center full-height content-center">
        <q-badge color="primary" dense square>POST</q-badge
        ><q-badge color="primary" dense square>GET</q-badge>
        <span> http://127.0.0.1:</span>
        <q-input
          borderless
          dense
          v-model="$root.nativeProfile.serverPort"
          style="width: 40px"
          input-class="text-weight-bolder"
          @blur="restartServer"
          ><q-tooltip>点击修改端口</q-tooltip></q-input
        >
        <span>的参数，均会作为本脚本里的变量 </span>
      </div>
      <q-btn-group unelevated>
        <q-btn flat color="primary" icon="help" @click="showHelp" />
        <q-separator inset vertical />
        <div v-if="!!saveCodeTimer">
          <q-btn
            flat
            color="warning"
            icon="restart_alt"
            @click="saveCode"
            label="正在保存"
          />
        </div>
        <div v-else>
          <q-btn
            flat
            color="negative"
            icon="stop"
            v-if="$root.nativeProfile.serverStatus"
            @click="stopServer"
            label="停止服务"
          />
          <q-btn
            flat
            color="primary"
            icon="play_arrow"
            v-else
            label="开启服务"
            @click="enableServer"
          >
          </q-btn>
        </div>
      </q-btn-group>
    </div>
  </div>
</template>

<script>
import CodeEditor from "components/editor/CodeEditor.vue";
import { dbManager } from "js/utools.js";
import { ref } from "vue";

export default {
  components: { CodeEditor },
  setup() {
    const cmd = ref(dbManager.getStorage("cfg_serverCode") || "");
    const saveCodeTimer = ref(null);
    return { cmd, saveCodeTimer };
  },
  methods: {
    enableServer() {
      if (!this.cmd)
        return quickcommand.showMessageBox("脚本不能为空！", "warning");
      quickcommand
        .showConfirmBox(
          "请注意，该接口未做任何权限鉴定，千万不要试图将本端口转发出去，否则无异于将本机的 shell 权限暴露在公网！",
          "FBI WARNING"
        )
        .then(() => {
          this.$root.nativeProfile.serverStatus = true;
          window
            .quickcommandHttpServer()
            .run(this.$root.nativeProfile.serverPort);
          quickcommand.showMessageBox("启动服务成功！");
        });
    },
    stopServer() {
      window.quickcommandHttpServer().stop();
      this.$root.nativeProfile.serverStatus = false;
      quickcommand.showMessageBox("关闭服务成功！");
    },
    restartServer() {
      if (!this.$root.nativeProfile.serverPort)
        this.$root.nativeProfile.serverPort = 33442;
      if (this.$root.nativeProfile.serverStatus) {
        window.quickcommandHttpServer().stop();
        window
          .quickcommandHttpServer()
          .run(this.$root.nativeProfile.serverPort);
        quickcommand.showMessageBox("服务已重启");
      }
    },
    saveCode() {
      clearTimeout(this.saveCodeTimer);
      this.saveCodeTimer = setTimeout(() => {
        dbManager.setStorage("cfg_serverCode", this.cmd);
        this.saveCodeTimer = null;
      }, 1000);
    },
    showHelp() {
      window.showUb.help("#GNjEg");
    },
  },
};
</script>

<style scoped>
.server-page {
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0;
}
</style>
