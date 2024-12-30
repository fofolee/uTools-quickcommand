<template>
  <q-card>
    <q-card-section class="text-h5 text-center">定时执行</q-card-section>
    <q-card-section class="flex">
      <div
        v-for="item in Object.keys(cronDetail)"
        :key="item"
        class="q-pa-sm"
        :style="{
          width: '20%',
        }"
      >
        <q-input
          v-model="cronDetail[item].value"
          stack-label
          autofocus
          type="text"
          standout="bg-primary text-white"
          :label="cronDetail[item].label"
        >
        </q-input>
      </div>
    </q-card-section>
    <q-card-section class="q-px-lg q-gutter-md">
      <div class="flex items-center">
        <div class="text-primary text-weight-bolder">表达式</div>
        <div class="q-px-sm">
          {{ cronConverted }}
        </div>
      </div>
      <div class="flex">
        <div class="text-primary text-weight-bolder">距下次</div>
        <div class="q-px-sm">
          {{ nextLeftTime }}
        </div>
      </div>
      <div class="flex">
        <div class="text-primary text-weight-bolder">下三次</div>
        <div v-for="time in nextTasks" :key="time" class="q-px-sm">
          {{ time }}
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right" class="q-px-lg">
      <q-btn
        flat
        color="grey"
        icon="arrow_back_ios_new"
        label="返回"
        v-close-popup
      />
      <q-btn flat color="info" icon="help" label="帮助" @click="showHelp" />
      <q-btn
        flat
        color="negative"
        icon="alarm_off"
        v-if="!!cronExp"
        @click="delCrontab"
        label="禁用"
      />
      <q-btn
        flat
        color="primary"
        icon="alarm_on"
        v-else
        @click="addCrontab"
        label="启用"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import Cron from "croner";

export default {
  data() {
    return {
      default: {
        min: { label: "分钟", value: "" },
        hour: { label: "小时", value: "" },
        day: { label: "天", value: "*" },
        month: { label: "月", value: "*" },
        week: { label: "星期", value: "*" },
      },
      cronDetail: {},
      intervalId: null,
      nextLeftTime: null,
    };
  },
  props: {
    cronExp: String,
  },
  computed: {
    cronConverted() {
      return window.lodashM
        .values(this.cronDetail)
        .map((x) => x.value)
        .join(" ");
    },
    cronJob() {
      try {
        return Cron(this.cronConverted);
      } catch (error) {
        return null;
      }
    },
    nextTasks() {
      return this.cronJob?.enumerate(3)?.map((x) => x?.toLocaleString());
    },
  },
  methods: {
    formatDuring(ms) {
      if (!ms) return;
      let days = parseInt(ms / (1000 * 60 * 60 * 24));
      let hours = parseInt((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = parseInt((ms % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((ms % (1000 * 60)) / 1000);
      return (
        days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 "
      );
    },
    refreshTime() {
      if (!!this.intervalId) return;
      this.intervalId = setInterval(() => {
        this.nextLeftTime = this.formatDuring(this.cronJob?.msToNext());
      }, 1000);
    },
    showHelp() {
      window.showUb.help("#Q0e7s");
    },
    initValue() {
      this.cronDetail = window.lodashM.cloneDeep(this.default);
      if (!this.cronExp) return;
      let splited = this.cronExp.split(" ");
      Object.keys(this.cronDetail).forEach((key, index) => {
        this.cronDetail[key].value = splited[index];
      });
    },
    addCrontab() {
      if (!this.cronJob)
        return quickcommand.showMessageBox(
          "crontab表达式错误，请检查！",
          "error"
        );
      this.$emit("addCrontab", this.cronConverted);
      quickcommand.showMessageBox(
        `启用成功，下次执行时间为 ${this.nextTasks[0]}`
      );
    },
    delCrontab() {
      this.$emit("delCrontab");
      this.cronDetail = window.lodashM.cloneDeep(this.default);
      quickcommand.showMessageBox("禁用成功");
    },
  },
  mounted() {
    this.initValue();
    this.refreshTime();
  },
  unmounted() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  },
};
</script>
