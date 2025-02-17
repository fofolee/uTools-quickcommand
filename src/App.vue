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
import { utoolsFull, dbManager } from "./js/utools.js";
import { useCommandManager } from "./js/commandManager.js";
import programmings from "./js/options/programs.js";
import defaultProfile from "./js/options/defaultProfile.js";
import Cron from "croner";
import QuickCommand from "components/quickcommandUI/QuickCommand";
// import autoDetach from "./js/autoDetach.js";

export default defineComponent({
  components: { QuickCommand },
  name: "App",
  data() {
    return {
      commandManager: useCommandManager(),
      setCssVar: setCssVar,
      programs: programmings,
      profile: defaultProfile.common,
      nativeProfile: defaultProfile.native,
      utools: utoolsFull,
      cronJobs: {},
      enterData: {},
      subInputEvent: null,
      isVIP: false,
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
      this.startUpOnce();
      this.utools.onPluginEnter((enter) => {
        this.enterPlugin(enter);
      });
      window.isAppVersion4() &&
        this.utools.onMainPush(
          async ({ code, payload }) => {
            let result = await this.runCommand(code, payload, 5000);
            return result.map((x) => {
              return {
                text: x,
              };
            });
          },
          ({ option }) => {
            window.quickcommand.writeClipboard(option.text);
            window.utools.showNotification("已复制");
          }
        );
      this.utools.onPluginOut(() => {
        this.outPlugin();
      });
    },
    loadProfile() {
      let commonProfile = dbManager.getDB("cfg_profile");
      let nativeProfile = dbManager.getDB(
        "cfg_" + utools.getNativeId() + "_profile"
      );
      this.profile = Object.assign(
        window.lodashM.cloneDeep(this.profile),
        commonProfile
      );
      this.nativeProfile = Object.assign(
        window.lodashM.cloneDeep(this.nativeProfile),
        nativeProfile
      );
    },
    saveProfile() {
      dbManager.putDB(window.lodashM.cloneDeep(this.profile), "cfg_profile");
      dbManager.putDB(
        window.lodashM.cloneDeep(this.nativeProfile),
        "cfg_" + utools.getNativeId() + "_profile"
      );
    },
    // 插件全生命周期只运行一次，主要针对多开的情况
    startUpOnce() {
      if (window.multiProcessDetection())
        return console.log("multiProcess Detected");
      // 计划任务
      window.lodashM.forIn(
        this.nativeProfile.crontabs,
        (cronExp, featureCode) => {
          this.runCronTask(featureCode, cronExp);
        }
      );
      // 快捷命令服务
      if (this.nativeProfile.serverStatus) {
        window.quickcommandHttpServer().run(this.nativeProfile.serverPort);
        console.log("Server Start...");
      }
    },
    enterPlugin(enter) {
      this.updateExp();
      this.$q.dark.set(utools.isDarkColors());
      this.enterData = enter;
      this.$router.push(enter.code);
    },
    outPlugin() {
      // 退出时保存RunCode和RunComposer的命令
      if (["code", "composer"].includes(this.$route.name)) {
        let currentCommand = window.lodashM.cloneDeep(
          this.commandManager.state.currentCommand
        );

        if (this.$route.name === "composer") {
          currentCommand =
            this.commandManager.getLitedComposerCommand(currentCommand);
        }

        dbManager.putDB(currentCommand, `cfg_${this.$route.name}History`);
      }

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
        let command = dbManager.getDB("qc_" + featureCode);
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
    updateExp() {
      let exp = dbManager.getDB("cfg_exp");
      if (typeof exp !== "object") {
        exp += 1;
        dbManager.putDB(exp, "cfg_exp");
        return;
      }
      try {
        let statisticsData = dbManager.getDB("cfg_statisticsData");
        exp = Object.values(statisticsData)
          .map((x) => x.length)
          .reduce((x, y) => x + y);
        // 有BUG可能删不掉
        dbManager.delDB("cfg_statisticsData");
      } catch (error) {
        exp = 0;
      }
      dbManager.putDB(exp, "cfg_exp");
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
      if (dbManager.getStorage("st_v300Inited")) return;
      window.showUb.help();
      // 删掉数据库内的默认命令
      dbManager.delAll("qc_default");
      dbManager.setStorage("st_v300Inited", true);
    },
    getOpacityColor(color, percent) {
      return (
        color +
        parseInt(0xff * percent)
          .toString(16)
          .padStart(2, "0")
      );
    },
  },
  watch: {
    // 监听 glassEffect 值变化
    "profile.glassEffect": {
      immediate: true,
      handler(val) {
        // 给 body 添加 glass-effect-menu 类和强度值
        document.body.classList.toggle("glass-effect-menu", val > 0);
        document.body.style.setProperty("--glass-effect-strength", val);
      },
    },
    // 监听 primaryColor 值变化
    "profile.primaryColor": {
      immediate: true,
      handler(val) {
        this.setCssVar("primary", val);
        this.setCssVar("primary-opacity-5", this.getOpacityColor(val, 0.05));
        this.setCssVar("primary-opacity-10", this.getOpacityColor(val, 0.1));
        this.setCssVar("primary-opacity-20", this.getOpacityColor(val, 0.2));
        this.setCssVar("primary-opacity-30", this.getOpacityColor(val, 0.3));
        this.setCssVar("primary-opacity-40", this.getOpacityColor(val, 0.4));
        this.setCssVar("primary-opacity-50", this.getOpacityColor(val, 0.5));
      },
    },
  },
});
</script>
