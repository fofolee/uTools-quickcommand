<template>
  <router-view v-slot="{ Component }">
    <!-- <transition name="fade"> -->
    <component ref="view" :is="Component" />
    <!-- </transition> -->
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
import autoDetach from "./js/autoDetach.js";

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
      subInputEvent: null,
    };
  },
  created: function () {
    this.init();
  },
  methods: {
    init() {
      window.utools = window.getuToolsLite();
      if (!this.checkVer()) return;
      this.firstRun();
      this.startUp();
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
      this.loadProfile();
      // 默认主题色
      this.setCssVar("primary", this.profile.primaryColor);
      this.startUpOnce();
      this.utools.whole.onPluginEnter((enter) => {
        this.enterPlugin(enter);
      });
      window.isAppVersion4() &&
        this.utools.whole.onMainPush(
          async ({ code, type, payload }) => {
            let result = await this.runCommand(code, payload, 5000);
            return result.map((x) => {
              return {
                text: x,
              };
            });
          },
          ({ code, type, payload, option }) => {
            window.quickcommand.writeClipboard(option.text);
            window.utools.showNotification("已复制");
          }
        );
      this.utools.whole.onPluginOut(() => {
        this.outPlugin();
      });
    },
    loadProfile() {
      let commonProfile = this.utools.getDB("cfg_profile");
      let nativeProfile = this.utools.getDB(
        "cfg_" + utools.getNativeId() + "_profile"
      );
      this.profile = Object.assign(_.cloneDeep(this.profile), commonProfile);
      this.nativeProfile = Object.assign(
        _.cloneDeep(this.nativeProfile),
        nativeProfile
      );
    },
    saveProfile() {
      this.utools.putDB(_.cloneDeep(this.profile), "cfg_profile");
      this.utools.putDB(
        _.cloneDeep(this.nativeProfile),
        "cfg_" + utools.getNativeId() + "_profile"
      );
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
      if (this.nativeProfile.serverStatus) {
        window.quickcommandHttpServer().run(this.nativeProfile.serverPort);
        console.log("Server Start...");
      }
    },
    enterPlugin(enter) {
      // 使用情况统计
      // this.usageStatistics(enter.code, this.parseDate(new Date()));
      this.updateExp();
      this.$q.dark.set(utools.isDarkColors());
      this.enterData = enter;
      // 自动分离目前还没有好的方案
      // if (this.$root.profile.autoDetachFeatures?.includes(enter.code)) {
        // autoDetach.autoDetach();
      // }
      this.$router.push(enter.code);
    },
    outPlugin() {
      this.$refs.view.$refs?.commandEditor?.saveCodeHistory();
      this.$router.push("/");
      this.saveProfile();
    },
    runCronTask(featureCode, cronExp) {
      this.cronJobs[featureCode] = Cron(cronExp, () => {
        this.runCommandSilently(featureCode);
      });
    },
    runCommand(featureCode, mainInput, timeout = false) {
      return new Promise((reslove, reject) => {
        timeout &&
          setTimeout(() => {
            reslove([`超过${timeout}ms未响应`]);
          }, timeout);
        let command = this.utools.getDB("qc_" + featureCode);
        let commandCode = command.cmd;
        if (mainInput)
          commandCode = commandCode.replace(/\{\{input\}\}/g, mainInput);
        if (command.program === "quickcommand") {
          window.runCodeInSandbox(commandCode, (stdout, stderr) => {
            stderr && reslove([stderr.toString()]);
            reslove(stdout);
          });
        } else {
          let option =
            command.program === "custom"
              ? command.customOptions
              : this.programs[command.program];
          option.scptarg = command.scptarg;
          option.charset = command.charset;
          window.runCodeFile(
            commandCode,
            option,
            false,
            (stdout, stderr) => {
              stderr && reslove([stderr.toString()]);
              reslove([stdout]);
            },
            false
          );
        }
      });
    },
    runCommandSilently(featureCode) {
      this.runCommand(featureCode);
    },
    // usageStatistics(featureCode, runTime) {
    //   let statisticsData = this.utools.getDB("cfg_statisticsData");
    //   let thisYear = runTime.year;
    //   if (!statisticsData[thisYear]) statisticsData[thisYear] = [];
    //   statisticsData[thisYear].push({
    //     code: featureCode,
    //     time: {
    //       month: runTime.month,
    //       day: runTime.day,
    //       hour: runTime.hour,
    //       minute: runTime.minute,
    //     },
    //   });
    //   this.utools.putDB(statisticsData, "cfg_statisticsData");
    // },
    updateExp() {
      let exp = this.utools.getDB("cfg_exp");
      if (typeof exp !== "object") {
        exp += 1;
        this.utools.putDB(exp, "cfg_exp");
        return;
      }
      try {
        let statisticsData = this.utools.getDB("cfg_statisticsData");
        exp = Object.values(statisticsData)
          .map((x) => x.length)
          .reduce((x, y) => x + y);
        // 有BUG可能删不掉
        this.utools.delDB("cfg_statisticsData");
      } catch (error) {
        exp = 0;
      }
      this.utools.putDB(exp, "cfg_exp");
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
    firstRun() {
      if (this.utools.getStorage("st_v300Inited")) return;
      window.showUb.help();
      // 处理统计数据
      // let statisticsData = this.utools.getDB("cfg_statisticsData");
      // _.forIn(statisticsData, (data, year) => {
      //   statisticsData[year] = data.map((x) => {
      //     if (!x.command) return x;
      //     let code =
      //       x.command.code === "options" ? "configuration" : x.command.code;
      //     return {
      //       code: code,
      //       time: x.time,
      //     };
      //   });
      // });
      // this.utools.putDB(statisticsData, "cfg_statisticsData");
      // 删掉数据库内的默认命令
      this.utools.delAll("qc_default");
      this.utools.setStorage("st_v300Inited", true);
    },
  },
});
</script>
