<template>
  <div>
    <q-menu
      target="#menuBtn"
      max-height="480px"
      max-width="300px"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <!-- 用户信息 -->
      <UserInfo
        ref="user"
        :allQuickCommandsLength="allQuickCommandsLength"
        :allFeaturesLength="allFeaturesLength"
      />

      <!-- 菜单列表 -->
      <q-list>
        <!-- 命令管理 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>命令管理</q-item-section>
          <CommandManageMenu />
        </q-item>

        <!-- 实用功能 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>实用功能</q-item-section>
          <UtilityFeaturesMenu />
        </q-item>

        <!-- 环境配置 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>环境配置</q-item-section>
          <EnvConfigMenu @open-user-data="showUserData = true" />
        </q-item>

        <!-- 个性化设置 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>个性化设置</q-item-section>
          <PersonalizeMenu :user="$refs.user" />
        </q-item>

        <!-- 收藏 -->
        <q-item v-if="isTagStared" clickable v-close-popup @click="unMarkTag">
          <q-item-section side>
            <q-icon name="star_border" />
          </q-item-section>
          <q-item-section>取消收藏</q-item-section>
        </q-item>
        <q-item v-else clickable v-close-popup @click="showPanelConf = true">
          <q-item-section side>
            <q-icon name="star" />
          </q-item-section>
          <q-item-section>收藏标签</q-item-section>
          <q-tooltip>
            收藏后，会将当前标签名作为全局关键字，可在 uTools 的主输入框进行搜索
            <br />
            搜索进入后，默认进入当前标签的面板视图 <br />
            类似于旧版本的「快捷面板」
          </q-tooltip>
        </q-item>

        <!-- 关于 -->
        <q-item clickable v-close-popup @click="showAbout = true">
          <q-item-section side>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>关于和帮助</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- 弹窗组件 -->
    <q-dialog v-model="showAbout">
      <AboutThis />
    </q-dialog>
    <q-dialog v-model="showPanelConf">
      <PanelSetting :isTagStared="isTagStared" :currentTag="currentTag" />
    </q-dialog>
    <q-dialog v-model="showUserData">
      <UserData :showInsertBtn="false" />
    </q-dialog>
  </div>
</template>

<script>
import AboutThis from "../popup/AboutThis";
import PanelSetting from "../popup/PanelSetting";
import UserInfo from "../popup/UserInfo";
import CommandManageMenu from "./CommandManageMenu.vue";
import UtilityFeaturesMenu from "./UtilityFeaturesMenu.vue";
import EnvConfigMenu from "./EnvConfigMenu.vue";
import PersonalizeMenu from "./PersonalizeMenu.vue";
import UserData from "../popup/UserData.vue";

export default {
  name: "ConfigurationMenu",
  components: {
    AboutThis,
    PanelSetting,
    UserInfo,
    CommandManageMenu,
    UtilityFeaturesMenu,
    EnvConfigMenu,
    PersonalizeMenu,
    UserData,
  },
  data() {
    return {
      showAbout: false,
      showPanelConf: false,
      showUserData: false,
    };
  },
  props: {
    isTagStared: Boolean,
    currentTag: String,
  },
  computed: {
    configurationPage() {
      return this.$root.$refs.view;
    },
    allQuickCommandsLength() {
      return Object.keys(this.configurationPage.allQuickCommands).length;
    },
    allFeaturesLength() {
      return this.configurationPage.activatedQuickCommandFeatureCodes.length;
    },
  },
  methods: {
    unMarkTag() {
      this.$root.utools.whole.removeFeature(
        `panel_${window.hexEncode(this.currentTag)}`
      );
      window.lodashM.pull(
        this.$root.$refs.view.activatedQuickPanels,
        this.currentTag
      );
      quickcommand.showMessageBox("取消收藏成功");
    },
  },
};
</script>
