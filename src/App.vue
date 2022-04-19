<template>
  <router-view v-slot="{ Component }">
    <component ref="view" :is="Component" />
  </router-view>
</template>

<script>
import { defineComponent } from "vue";
import { setCssVar } from "quasar";
import UTOOLS from "./js/utools.js";
import programmings from "./js/options/programs.js";
import defaultProfile from "./js/options/defaultProfile.js";
import Cron from "croner";

export default defineComponent({
  name: "App",
  data() {
    return {
      setCssVar: setCssVar,
      programs: programmings,
      profile: defaultProfile,
      utools: UTOOLS,
      cronJobs: {},
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
      if (!this.checkVer()) return;
      this.startUp();
      this.utools.whole.onPluginEnter((enter) => {
        this.enterPlugin(enter);
      });
      this.utools.whole.onPluginOut(() => {
        this.outPlugin();
      });
    },
    checkVer() {
      const requiredVersion = "2.6.1";
      let version = utools.getAppVersion();
      if (version < requiredVersion) {
        this.$router.push({
          name: "needupdate",
          params: { version: version, requiredVersion: requiredVersion },
        });
        return false;
      }
      return true;
    },
    startUp() {
      // 处理旧版本数据
      this.v2DataHandler();
      // 读取用户配置
      let userProfile = this.utools.getDB(
        this.utools.DBPRE.CFG + "preferences"
      );
      _.merge(defaultProfile, _.cloneDeep(userProfile));
      // 计划任务
      _.forIn(this.profile.crontabs, (cronExp, featureCode) => {
        this.runCronTask(featureCode, cronExp);
      });
      // 快捷命令服务
      if (this.profile.quickFeatures.apiServer.serverStatus) {
        window
          .quickcommandHttpServer()
          .run(
            this.profile.quickFeatures.apiServer.cmd,
            this.profile.quickFeatures.apiServer.port
          );
        console.log("Server Start...");
      }
      // 默认主题色
      this.setCssVar("primary", this.profile.primaryColor);
    },
    enterPlugin(enter) {
      // 使用情况统计
      this.usageStatistics(enter.code, this.parseDate(new Date()));
      this.$q.dark.set(utools.isDarkColors());
      quickcommand.enterData = enter;
      quickcommand.payload = enter.payload;
      this.$router.push(enter.code);
    },
    outPlugin() {
      this.saveProfile();
      this.$router.push("/");
      window.temporaryStoreSoldOut();
    },
    saveProfile() {
      let commandEditor = this.$refs.view.$refs.commandEditor;
      if (commandEditor && commandEditor.action.type !== "edit") {
        let command = _.cloneDeep(commandEditor.quickcommandInfo);
        command.cursorPosition = commandEditor.$refs.editor.getCursorPosition();
        this.profile.codeHistory[commandEditor.action.type] = command;
      }
      this.utools.putDB(
        _.cloneDeep(this.profile),
        this.utools.DBPRE.CFG + "preferences"
      );
    },
    runCronTask(featureCode, cronExp) {
      this.cronJobs[featureCode] = Cron(cronExp, () => {
        this.runCommandSilently(featureCode);
      });
    },
    runCommandSilently(featureCode) {
      let command = this.utools.getDB(this.utools.DBPRE.QC + featureCode);
      if (command.program === "quickcommand") {
        window.runCodeInSandbox(command.cmd, () => {});
      } else {
        let option =
          command.program === "custom"
            ? command.customOptions
            : this.programs[command.program];
        option.scptarg = command.scptarg;
        option.charset = command.charset;
        window.runCodeFile(command.cmd, option, false, () => {});
      }
    },
    usageStatistics(featureCode, runTime) {
      let statisticsData = this.utools.getDB(
        this.utools.DBPRE.CFG + "statisticsData"
      );
      let thisYear = runTime.year;
      if (!statisticsData[thisYear]) statisticsData[thisYear] = [];
      statisticsData[thisYear].push({
        code: featureCode,
        time: {
          month: runTime.month,
          day: runTime.day,
          hour: runTime.hour,
          minute: runTime.minute,
        },
      });
      this.utools.putDB(
        statisticsData,
        this.utools.DBPRE.CFG + "statisticsData"
      );
    },
    parseDate: (dateString) => {
      return {
        year: dateString.getFullYear(),
        month: dateString.getMonth() + 1,
        day: dateString.getDate(),
        hour: dateString.getHours(),
        minute: dateString.getMinutes(),
        second: dateString.getSeconds(),
      };
    },
    v2DataHandler() {
      let v2DataHandled = this.utools.whole.dbStorage.getItem(
        this.utools.DBPRE.STATUS + "v2DataHandled"
      );
      if (v2DataHandled) return;
      // 处理统计数据
      let statisticsData = this.utools.getDB(
        this.utools.DBPRE.CFG + "statisticsData"
      );
      _.forIn(statisticsData, (data, year) => {
        statisticsData[year] = data.map((x) => {
          let code =
            x.command.code === "options" ? "configuration" : x.command.code;
          return {
            code: code,
            time: x.time,
          };
        });
      });
      this.utools.putDB(
        statisticsData,
        this.utools.DBPRE.CFG + "statisticsData"
      );
      // 处理历史代码
      // ...
      this.utools.whole.dbStorage.setItem(
        this.utools.DBPRE.STATUS + "v2DataHandled",
        true
      );
    },
  },
});
</script>

<style>
:root {
  --q-dark: #464646;
  --q-dark-page: #303133;
}
.q-tooltip {
  font-size: 11px;
}
.q-chip {
  background: #e3e3e39a;
}
.q-chip--dark {
  background: #676666;
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
