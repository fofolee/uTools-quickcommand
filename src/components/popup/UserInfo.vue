<template>
  <div class="row no-wrap q-pa-md">
    <div class="column items-center">
      <q-avatar size="48px">
        <img :src="userInfo.avatar" />
        <q-badge v-if="isVIP" floating color="deep-orange" label="v" rounded />
      </q-avatar>
      <div
        class="text-subtitle1 q-mt-md q-mb-xs"
        v-html="userInfo.nickname"
      ></div>
    </div>
    <q-separator vertical inset class="q-mx-lg" />
    <div class="column items-start q-gutter-xs">
      <q-chip dense square>
        <q-avatar color="indigo" text-color="white">{{
          allQuickCommandsLength
        }}</q-avatar>
        Quickcommands
        <q-tooltip>当前拥有的「快捷命令」数</q-tooltip>
      </q-chip>
      <q-chip dense square>
        <q-avatar color="green-8" text-color="white">{{
          allFeaturesLength
        }}</q-avatar>
        Features
        <q-tooltip>当前启用的「快捷命令」数</q-tooltip>
      </q-chip>
      <q-chip dense square>
        <q-avatar color="primary" text-color="white">
          {{ userInfo.level }}</q-avatar
        >Level
        <q-tooltip>等级越高意味着你对本插件的依赖程度越高</q-tooltip>
      </q-chip>
      <q-linear-progress
        color="cyan-6"
        stripe
        rounded
        style="width: 130px"
        size="10px"
        :value="userInfo.process"
        ><q-tooltip
          >当前经验 {{ userInfo.exp }} <br />距离下一级还剩
          {{ 100 - userInfo.process * 100 }}%</q-tooltip
        ></q-linear-progress
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        exp: 0,
        level: 1,
        process: 0,
        type: "",
        avatar: "",
        nickname: "",
      },
      levelDetail: [
        {
          lv: 1,
          minExp: 0,
          upExp: 100,
        },
        {
          lv: 2,
          minExp: 100,
          upExp: 200,
        },
        {
          lv: 3,
          minExp: 300,
          upExp: 300,
        },
        {
          lv: 4,
          minExp: 600,
          upExp: 600,
        },
        {
          lv: 5,
          minExp: 1200,
          upExp: 999999,
        },
      ],
    };
  },
  computed: {
    isVIP() {
      return this.userInfo.type === "member";
    },
  },
  props: {
    allFeaturesLength: Number,
    allQuickCommandsLength: Number,
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      Object.assign(this.userInfo, utools.getUser());
      let statisticsData = this.$root.utools.getDB(
        this.$root.utools.DBPRE.CFG + "statisticsData"
      );
      this.userInfo.exp = Object.values(statisticsData)
        .map((x) => x.length)
        .reduce((x, y) => x + y);
      this.userInfo.level = this.levelDetail
        .filter((x) => this.userInfo.exp > x.minExp)
        .pop().lv;
      let currentLevelDetail = this.levelDetail[this.userInfo.level - 1];
      this.userInfo.process = parseFloat(
        (
          (this.userInfo.exp - currentLevelDetail.minExp) /
          currentLevelDetail.upExp
        ).toFixed(2)
      );
    },
  },
};
</script>
