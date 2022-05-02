<template>
  <div>
    <MonacoEditor
      :placeholder="false"
      class="absolute-top"
      ref="editor"
      @typing="
        (val) => {
          if (cmd === val) return;
          cmd = val;
          saveCode();
        }
      "
      :style="{
        bottom: bottomHeight + 'px',
      }"
    />
    <div
      class="
        absolute-bottom
        flex
        items-center
        justify-between
        q-px-md
        shadow-10
      "
      :style="{
        height: bottomHeight + 'px',
      }"
    >
      <div class="q-gutter-xs">
        <q-badge color="primary" dense square>POST</q-badge
        ><q-badge color="primary" dense square>GET</q-badge>
        <span>
          http://127.0.0.1:{{ $root.profile.quickFeatures.apiServer.port }}
        </span>
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
            v-if="$root.profile.quickFeatures.apiServer.serverStatus"
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
import MonacoEditor from "components/MonacoEditor";

export default {
  components: { MonacoEditor },
  data() {
    return {
      bottomHeight: 40,
      saveCodeTimer: null,
      cmd: null,
    };
  },
  mounted() {
    this.cmd =
      this.$root.utools.whole.dbStorage.getItem("cfg_serverCode") || "";
    this.$refs.editor.setEditorValue(this.cmd);
    this.$refs.editor.setEditorLanguage("javascript");
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
          this.$root.profile.quickFeatures.apiServer.serverStatus = true;
          window
            .quickcommandHttpServer()
            .run(this.$root.profile.quickFeatures.apiServer.port);
          quickcommand.showMessageBox("启动服务成功！");
        });
    },
    stopServer() {
      window.quickcommandHttpServer().stop();
      this.$root.profile.quickFeatures.apiServer.serverStatus = false;
      quickcommand.showMessageBox("关闭服务成功！");
    },
    saveCode() {
      clearTimeout(this.saveCodeTimer);
      this.saveCodeTimer = setTimeout(() => {
        this.$root.utools.whole.dbStorage.setItem("cfg_serverCode", this.cmd);
        this.saveCodeTimer = null;
      }, 1000);
    },
    showHelp() {
      window.showUb.help("#GNjEg");
    },
  },
};
</script>
