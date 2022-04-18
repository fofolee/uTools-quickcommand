<template>
  <div>
    <MonacoEditor
      :placeholder="false"
      class="absolute-top"
      ref="editor"
      @typing="
        (val) => {
          if ($profile.quickFeatures.apiServer.cmd !== val) {
            $profile.quickFeatures.apiServer.cmd = val;
          }
          restartServer();
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
          http://127.0.0.1:{{ $profile.quickFeatures.apiServer.port }}
        </span>
        <span>的参数，均会作为本脚本里的变量 </span>
      </div>
      <q-btn-group unelevated>
        <q-btn flat color="primary" icon="help" @click="showHelp" />
        <q-separator inset vertical />
        <q-btn
          flat
          color="negative"
          icon="stop"
          v-if="serverStatus && !restartTimer"
          @click="stopServer"
          label="停止服务"
        />
        <q-btn
          flat
          color="warning"
          icon="restart_alt"
          v-else-if="serverStatus && !!restartTimer"
          @click="restartServer"
          label="正在重载"
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
      serverStatus: this.$profile.quickFeatures.apiServer.serverStatus,
      restartTimer: null,
    };
  },
  mounted() {
    this.$refs.editor.setEditorValue(this.$profile.quickFeatures.apiServer.cmd);
    this.$refs.editor.setEditorLanguage("javascript");
    this.restartTimer = null;
  },
  methods: {
    enableServer() {
      quickcommand
        .showConfirmBox(
          "请注意，该接口未做任何权限鉴定，千万不要试图将本端口转发出去，否则无异于将本机的 shell 权限暴露在公网！",
          "FBI WARNING"
        )
        .then((ok) => {
          if (!ok) return;
          this.$profile.quickFeatures.apiServer.serverStatus =
            this.serverStatus = true;
          window
            .quickcommandHttpServer()
            .run(
              this.$profile.quickFeatures.apiServer.cmd,
              this.$profile.quickFeatures.apiServer.port
            );
          quickcommand.showMessageBox("启动服务成功！");
        });
    },
    stopServer() {
      window.quickcommandHttpServer().stop();
      this.$profile.quickFeatures.apiServer.serverStatus =
        this.serverStatus = false;
      quickcommand.showMessageBox("关闭服务成功！");
    },
    restartServer() {
      if (!this.serverStatus) return;
      clearTimeout(this.restartTimer);
      this.restartTimer = setTimeout(() => {
        window.quickcommandHttpServer().stop();
        window
          .quickcommandHttpServer()
          .run(
            this.$profile.quickFeatures.apiServer.cmd,
            this.$profile.quickFeatures.apiServer.port
          );
        this.restartTimer = null;
      }, 1000);
    },
    showHelp() {
      window.showHelpPage("#GNjEg");
    },
  },
};
</script>
