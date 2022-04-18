<template>
  <router-view v-slot="{ Component }">
    <component ref="view" :is="Component" />
  </router-view>
</template>

<script>
import { defineComponent } from "vue";
import { setCssVar } from "quasar";

export default defineComponent({
  name: "App",
  data() {
    return {
      setCssVar: setCssVar,
    };
  },
  computed: {},
  created: function () {
    this.init();
  },
  methods: {
    init() {
      window.root = this;
      window.utools = window.getuToolsLite();
      // 版本检测
      const requiredVersion = "2.6.1";
      let version = utools.getAppVersion();
      if (version < requiredVersion) {
        this.$router.push({
          name: "needupdate",
          params: { version: version, requiredVersion: requiredVersion },
        });
        return;
      }
      this.startUp();
      // 进入插件
      utools.onPluginEnter((enter) => {
        // 暗黑模式
        this.$q.dark.set(utools.isDarkColors());
        // 路由跳转
        quickcommand.enterData = enter;
        quickcommand.payload = enter.payload;
        this.$router.push(enter.code);
      });
      // 退出插件
      utools.onPluginOut(() => {
        // 保存偏好
        this.saveProfile();
        // 切到空路由
        this.$router.push("loading");
        // 清空临时数据
        window.temporaryStoreSoldOut();
      });
    },
    saveProfile() {
      let commandEditor = this.$refs.view.$refs.commandEditor;
      if (commandEditor && commandEditor.action.type !== "edit") {
        let command = _.cloneDeep(commandEditor.quickcommandInfo);
        command.cursorPosition = commandEditor.$refs.editor.getCursorPosition();
        this.$profile.codeHistory[commandEditor.action.type] = command;
      }
      this.$utools.putDB(
        _.cloneDeep(this.$profile),
        this.$utools.DBPRE.CFG + "preferences"
      );
    },
    // 随插件启动执行
    startUp() {
      // 如果配置了后台服务则开启监听
      if (this.$profile.quickFeatures.apiServer.serverStatus) {
        window
          .quickcommandHttpServer()
          .run(
            this.$profile.quickFeatures.apiServer.cmd,
            this.$profile.quickFeatures.apiServer.port
          );
        console.log("Server Start...");
      }
      // 默认主题色
      this.setCssVar("primary", this.$profile.primaryColor);
    },
  },
});
</script>

<style>
.q-tooltip {
  font-size: 11px;
}
:root {
  --q-dark: #464646;
  --q-dark-page: #303133;
}
.commandLogo {
  cursor: pointer;
  transition: 0.2s;
  filter: drop-shadow(2px 1px 1px grey);
}
.commandLogo:hover {
  transition: 0.5s;
  transform: translateY(-5px);
  filter: drop-shadow(2px 1px 5px grey);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(194, 194, 194, 0.4);
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>
