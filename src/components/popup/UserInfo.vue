<template>
  <div class="row no-wrap q-pa-md">
    <div class="column items-center">
      <q-avatar size="48px">
        <q-img :src="userInfo.avatar" />
        <q-badge
          v-if="isVIP"
          floating
          color="deep-orange"
          :label="isDoubleVIP ? 'V²' : 'V'"
          rounded
        ></q-badge>
      </q-avatar>
      <div
        class="text-subtitle1"
        :class="{
          'text-deep-orange': isPluginVIP,
          'q-mt-md': isPluginVIP,
          'q-md-xs': isPluginVIP,
        }"
        style="width: 64px; text-align: center; cursor: pointer"
        @click="showPayPage = true"
        v-html="userInfo.nickname"
      ></div>
      <q-btn
        v-if="!isPluginVIP"
        outline
        size="xs"
        label="插件会员"
        @click="showPayPage = true"
        ><q-tooltip>2元解锁本插件所有会员特权</q-tooltip></q-btn
      >
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
    <q-dialog
      v-model="showPayPage"
      transition-show="flip-up"
      transition-hide="flip-down"
    >
      <q-card>
        <q-card-section class="text-h5 text-deep-orange"
          ><q-icon color="deep-orange" name="flash_on"></q-icon>
          {{ isPluginVIP ? "您已是插件会员" : "开通插件会员" }}
        </q-card-section>
        <q-separator inset />
        <q-card-section class="q-gutter-sm">
          <div>「uTools 会员」或「插件会员」均可享受本插件的会员功能</div>
          <div class="text-weight-bolder">
            本插件会员仅需 {{ memberPrice }} 元，一次性付费，uTools 会员享 9
            折优惠
          </div>
          <div>
            会员功能将在保障用户完整的插件功能体验的前提下，提供主题样式类个性化功能
          </div>
          <div class="row items-center">
            <q-icon size="sm" name="color_lens" class="q-mr-sm"></q-icon>
            设置插件的主题色
          </div>
          <div class="row items-center q-mr-lg">
            <q-icon size="sm" name="image" class="q-mr-sm"></q-icon>
            设置背景图片，以及开启毛玻璃效果
          </div>
          <div class="row items-center q-mr-lg">
            <q-icon size="sm" name="label" class="q-mr-sm"></q-icon>
            更为紧凑的标签栏
          </div>
          <div>走过路过不要错过~</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-if="!isPluginVIP"
            label="思考3秒！"
            color="positive"
            icon="hourglass_bottom"
            v-close-popup
            @click="thinkOver"
          />
          <q-btn
            label="功能介绍"
            icon="info"
            color="deep-orange"
            @click="showHelp"
          ></q-btn>
          <q-btn
            v-if="!isPluginVIP"
            label="赏了！"
            color="red"
            icon="local_fire_department"
            @click="payForMember"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import levelDetail from "../../js/options/levelDetail.js";

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
      levelDetail: levelDetail,
      showPayPage: false,
      memberPrice: 2,
      isPluginVIP: false,
      goodsId: "3LHZ9WdXnUnBSgGRzr2c7bDOyGJBzUyD",
    };
  },
  computed: {
    isDoubleVIP() {
      return this.isUtoolsVIP && this.isPluginVIP;
    },
    isVIP() {
      return this.isUtoolsVIP || this.isPluginVIP;
    },
    isUtoolsVIP() {
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
      Object.assign(this.userInfo, this.$root.utools.whole.getUser());
      this.userInfo.exp = this.$root.utools.getDB("cfg_exp");
      this.userInfo.level = this.levelDetail
        .filter((x) => this.userInfo.exp > x.minExp)
        .pop().lv;
      let currentLevelDetail = this.levelDetail[this.userInfo.level - 1];
      this.userInfo.process = currentLevelDetail.upExp
        ? parseFloat(
            (
              (this.userInfo.exp - currentLevelDetail.minExp) /
              currentLevelDetail.upExp
            ).toFixed(2)
          )
        : 1;
      this.$root.utools.whole.fetchUserPayments().then((ret) => {
        console.log("PayInfo:", ret);
        !ret.filter((x) => x.goods_id === this.goodsId).length ||
          (this.isPluginVIP = true);
      });
    },
    thinkOver() {
      let that = this;
      setTimeout(() => {
        that.showPayPage = true;
      }, 3000);
    },
    payForMember() {
      this.$root.utools.whole.openPayment({ goodsId: this.goodsId }, () => {
        this.isPluginVIP = true;
        this.showPayPage = false;
      });
    },
    showHelp() {
      window.showUb.help("#yiSRi");
    },
  },
};
</script>
