<template>
  <router-view v-slot="{ Component }">
    <component ref="view" :is="Component" />
  </router-view>
  <QuickCommand />
</template>

<script>
import { defineComponent } from "vue";
import { setCssVar } from "quasar";
import UTOOLS from "./js/utools.js";
import programmings from "./js/options/programs.js";
import defaultProfile from "./js/options/defaultProfile.js";
import Cron from "croner";
import QuickCommand from "components/quickcommandUI/QuickCommand";

export default defineComponent({
  components: { QuickCommand },
  name: "App",
  data() {
    return {
      setCssVar: setCssVar,
      programs: programmings,
      profile: defaultProfile.common,
      nativeProfile: defaultProfile.native,
      utools: UTOOLS,
      cronJobs: {},
      enterData: {},
    };
  },
  created: function () {
    this.init();
  },
  methods: {
    init() {
      utools.isDev() && (window.root = this);
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
      // 有可能版本低到没有这个接口
      let version = utools.getAppVersion?.();
      if (!version || version < requiredVersion) {
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
      let commonProfile = this.utools.getDB("cfg_profile");
      let nativeProfile = this.utools.getDB(
        "cfg_" + utools.getNativeId() + "_profile"
      );
      this.profile = Object.assign(_.cloneDeep(this.profile), commonProfile);
      this.nativeProfile = Object.assign(
        _.cloneDeep(this.nativeProfile),
        nativeProfile
      );
      // 默认主题色
      this.setCssVar("primary", this.profile.primaryColor);
      this.startUpOnce();
    },
    // 插件全生命周期只运行一次，主要针对多开的情况
    startUpOnce() {
      if (window.multiProcessDetection())
        return console.log("multiProcess Detected");
      // 计划任务
      _.forIn(this.nativeProfile.crontabs, (cronExp, featureCode) => {
        this.runCronTask(featureCode, cronExp);
      });
      // 快捷命令服务
      if (this.nativeProfile.apiServerStatus && this.profile.apiServerEnable) {
        window.quickcommandHttpServer().run(this.profile.apiServerPort);
        console.log("Server Start...");
      }
    },
    enterPlugin(enter) {
      // 使用情况统计
      this.usageStatistics(enter.code, this.parseDate(new Date()));
      this.$q.dark.set(utools.isDarkColors());
      this.enterData = enter;
      this.$router.push(enter.code);
    },
    outPlugin() {
      this.utools.putDB(_.cloneDeep(this.profile), "cfg_profile");
      this.utools.putDB(
        _.cloneDeep(this.nativeProfile),
        "cfg_" + utools.getNativeId() + "_profile"
      );
      this.$refs.view.$refs?.commandEditor?.saveCodeHistory();
      this.$router.push("/");
    },
    runCronTask(featureCode, cronExp) {
      this.cronJobs[featureCode] = Cron(cronExp, () => {
        this.runCommandSilently(featureCode);
      });
    },
    runCommandSilently(featureCode) {
      let command = this.utools.getDB("qc_" + featureCode);
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
      let statisticsData = this.utools.getDB("cfg_statisticsData");
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
      this.utools.putDB(statisticsData, "cfg_statisticsData");
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
      let v2DataHandled = this.utools.getStorage("st_v2DataHandled");
      if (v2DataHandled) return;
      // 处理统计数据
      let statisticsData = this.utools.getDB("cfg_statisticsData");
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
      this.utools.putDB(statisticsData, "cfg_statisticsData");
      // 处理历史代码
      // ...
      this.utools.setStorage("st_v2DataHandled", true);
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
