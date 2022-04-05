<template>
  <q-menu
    max-height="450px"
    max-width="290px"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <!-- 用户信息 -->
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
            allQuickcommandsLength
          }}</q-avatar>
          Quickcommands
          <q-tooltip>当前拥有的「快捷命令」数</q-tooltip>
        </q-chip>
        <q-chip dense square>
          <q-avatar color="green-8" text-color="white">{{
            allFeaturesLength
          }}</q-avatar>
          Features
          <q-tooltip>当前启用的「快捷命令』数</q-tooltip>
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
    <q-list>
      <!-- 导入 -->
      <q-item clickable>
        <q-item-section side>
          <q-icon name="keyboard_arrow_left" />
        </q-item-section>
        <q-item-section>导入</q-item-section>
        <q-menu anchor="top end" self="top start">
          <q-list>
            <q-item clickable v-close-popup @click="importCommand">
              <q-item-section side>
                <q-icon name="text_snippet" />
              </q-item-section>
              <q-item-section>从文件导入</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="importCommand(false)">
              <q-item-section side>
                <q-icon name="content_paste" />
              </q-item-section>
              <q-item-section>从剪贴板导入</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <!-- 批处理 -->
      <q-item clickable>
        <q-item-section side>
          <q-icon name="keyboard_arrow_left" />
        </q-item-section>
        <q-item-section>批处理</q-item-section>
        <q-menu anchor="top end" self="top start">
          <q-list>
            <q-item clickable v-close-popup @click="enableAllCommands">
              <q-item-section side>
                <q-icon name="checklist_rtl" />
              </q-item-section>
              <q-item-section>启用本页所有命令</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="disableAllCommands">
              <q-item-section side>
                <q-icon name="remove_done" />
              </q-item-section>
              <q-item-section>禁用本页所有命令</q-item-section>
            </q-item>
            <!-- 导出 -->
            <q-item clickable v-close-popup @click="exportAllCommands">
              <q-item-section side>
                <q-icon name="file_upload" />
              </q-item-section>
              <q-item-section>导出所有命令</q-item-section>
            </q-item>
            <!-- 清空 -->
            <q-item
              style="color: red"
              clickable
              v-close-popup
              @click="clearAllCommands"
            >
              <q-item-section side>
                <q-icon name="delete" />
              </q-item-section>
              <q-item-section>删除所有命令</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <!-- 收藏 -->
      <q-item v-if="isTagStared" clickable v-close-popup>
        <q-item-section side>
          <q-icon name="star_border" />
        </q-item-section>
        <q-item-section>取消收藏</q-item-section>
      </q-item>
      <q-item v-else clickable v-close-popup>
        <q-item-section side>
          <q-icon name="star" />
        </q-item-section>
        <q-item-section>收藏标签</q-item-section>
        <q-tooltip
          >收藏后，会将当前标签名作为全局关键字，可在 uTools 的主输入框进行搜索
          <br />
          搜索进入后，默认进入当前标签的面板视图 <br />
          类似于旧版本的「快捷面板」</q-tooltip
        >
      </q-item>
      <!-- 选项 -->
      <q-item clickable>
        <q-item-section side>
          <q-icon name="keyboard_arrow_left" />
        </q-item-section>
        <q-item-section>偏好设置</q-item-section>
        <q-menu anchor="top end" self="top start">
          <q-list>
            <q-item clickable>
              <q-item-section side>
                <q-icon name="color_lens" />
              </q-item-section>
              <q-item-section>主颜色</q-item-section>
              <q-tooltip>你可以更改界面的主题色，Level 2 以上限定</q-tooltip>
              <q-menu nchor="top left" self="bottom end">
                <q-card>
                  <q-color
                    no-header
                    no-footer
                    @change="setPrimaryColor"
                    v-model="$profile.primaryColor"
                  />
                  <q-btn
                    color="primary"
                    label="重置为默认"
                    class="full-width"
                    @click="resetPrimary"
                  />
                </q-card>
              </q-menu>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <!-- 帮助 -->
      <q-item clickable v-close-popup>
        <q-item-section side>
          <q-icon name="help" />
        </q-item-section>
        <q-item-section>帮助</q-item-section></q-item
      >
    </q-list></q-menu
  >
</template>

<script>
import { setCssVar } from "quasar";

export default {
  data() {
    return {
      userInfo: utools.getUser(),
      userLevel: {
        number: 1,
        process: 0.4,
      },
      configurationPage: this.$parent.$parent.$parent,
      setCssVar: setCssVar,
    };
  },
  mounted() {
    window.configurationMenu = this;
  },
  props: {
    allQuickcommandsLength: Number,
    allFeaturesLength: Number,
    isTagStared: Boolean,
  },
  methods: {
    // 导入命令且定位
    importCommand(fromFile = true) {
      this.configurationPage.importCommand(fromFile);
    },
    // 全部导出
    exportAllCommands() {
      this.configurationPage.exportAllCommands();
    },
    // 清空
    clearAllCommands() {
      this.configurationPage.clearAllCommands();
    },
    // 启用全部
    enableAllCommands() {
      // dom 操作
      document
        .querySelectorAll(".q-toggle[aria-checked='false']")
        .forEach((x) => x.click());
    },
    // 禁用全部
    disableAllCommands() {
      // dom 操作
      document
        .querySelectorAll(".q-toggle[aria-checked='true']")
        .forEach((x) => x.click());
    },
    setPrimaryColor() {
      this.setCssVar("primary", this.$profile.primaryColor);
    },
    resetPrimary() {
      this.$profile.primaryColor = "#419488";
      this.setPrimaryColor();
    },
  },
};
</script>
