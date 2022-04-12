<template>
  <div class="row no-wrap q-pa-md">
    <div class="column items-center">
      <q-avatar size="48px">
        <img :src="userInfo.avatar" />
        <q-badge
          v-if="userInfo.type === 'member'"
          floating
          color="deep-orange"
          label="v"
          rounded
        />
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
          Object.keys(configurationPage.allQuickCommands).length
        }}</q-avatar>
        Quickcommands
        <q-tooltip>当前拥有的「快捷命令」数</q-tooltip>
      </q-chip>
      <q-chip dense square>
        <q-avatar color="green-8" text-color="white">{{
          configurationPage.activatedQuickCommandFeatureCodes.length
        }}</q-avatar>
        Features
        <q-tooltip>当前启用的「快捷命令」数</q-tooltip>
      </q-chip>
      <q-chip dense square>
        <q-avatar color="primary" text-color="white">
          {{ userLevel.number }}</q-avatar
        >Level
        <q-tooltip
          >使用本插件次数越多，等级越高，uTools VIP 有额外加成哟
          <br />不要问我为什么 VIP 有加成，因为我白嫖了一个永久 VIP <br />
          所以怎么也加点「会员特权」吧<br />
          至于这个等级有啥用，我也不知道╮(╯▽╰)╭
        </q-tooltip>
      </q-chip>
      <q-linear-progress
        color="cyan-6"
        stripe
        rounded
        style="width: 130px"
        size="10px"
        :value="userLevel.process"
        ><q-tooltip
          >距离下一级还剩{{ (1 - userLevel.process) * 100 }}%</q-tooltip
        ></q-linear-progress
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: utools.getUser(),
      userLevel: {
        number: 1,
        process: 0.4,
      },
      configurationPage: this.$root.$refs.configuration,
    };
  },
};
</script>
