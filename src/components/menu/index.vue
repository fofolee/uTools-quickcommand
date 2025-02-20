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
          <PersonalizeMenu />
        </q-item>

        <!-- AI配置 -->
        <q-item clickable v-close-popup @click="showAIConfig = true">
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>AI配置</q-item-section>
        </q-item>

        <!-- 收藏 -->
        <q-item
          v-if="activatedQuickPanels.includes(currentTag)"
          clickable
          v-close-popup
          @click="unMarkTag"
        >
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
      <PanelSetting
        :currentTag="currentTag"
        @update-activated-quick-panels="activatedQuickPanels = $event"
      />
    </q-dialog>
    <q-dialog v-model="showUserData">
      <UserData :showInsertBtn="false" />
    </q-dialog>

    <q-dialog v-model="showAIConfig">
      <AIConfig />
    </q-dialog>
  </div>
</template>

<script>
import AboutThis from "components/popup/AboutThis";
import PanelSetting from "components/popup/PanelSetting";
import UserInfo from "components/popup/UserInfo";
import CommandManageMenu from "components/menu/CommandManageMenu.vue";
import UtilityFeaturesMenu from "components/menu/UtilityFeaturesMenu.vue";
import EnvConfigMenu from "components/menu/EnvConfigMenu.vue";
import PersonalizeMenu from "components/menu/PersonalizeMenu.vue";
import AIConfig from "components/ai/AIConfig.vue";
import UserData from "components/popup/UserData.vue";
import { utoolsFull } from "js/utools.js";
import { useCommandManager } from "js/commandManager";

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
    AIConfig,
  },
  data() {
    return {
      commandManager: useCommandManager(),
      showAbout: false,
      showPanelConf: false,
      showUserData: false,
      showAIConfig: false,
      utools: utoolsFull,
    };
  },
  computed: {
    activatedQuickPanels: {
      get() {
        return this.commandManager.state.activatedQuickPanels;
      },
      set(value) {
        this.commandManager.state.activatedQuickPanels = value;
      },
    },
    currentTag() {
      return this.commandManager.state.currentTag;
    },
    allQuickCommandsLength() {
      return Object.keys(this.commandManager.state.allQuickCommands).length;
    },
    allFeaturesLength() {
      return this.commandManager.state.activatedQuickCommandFeatureCodes.length;
    },
  },
  methods: {
    unMarkTag() {
      this.utools.removeFeature(`panel_${window.hexEncode(this.currentTag)}`);
      const newPanels = [...this.activatedQuickPanels];
      this.activatedQuickPanels = newPanels.filter(
        (panel) => panel !== this.currentTag
      );
      quickcommand.showMessageBox("取消收藏成功");
    },
  },
};
</script>
