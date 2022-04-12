<template>
  <q-menu
    max-height="450px"
    max-width="290px"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <!-- 用户信息 -->
    <UserInfo
      :allQuickCommandsLength="allQuickCommandsLength"
      :allFeaturesLength="allFeaturesLength"
    />
    <!-- 菜单 -->
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
              <q-tooltip>你可以更改界面的主题色，Level 3 以上限定</q-tooltip>
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
            <q-item clickable>
              <q-item-section side>
                <q-icon name="image" />
              </q-item-section>
              <q-item-section>面板视图背景图片</q-item-section>
              <q-tooltip
                >为面板视图设置一张背景图片，Level 2 以上限定<br />请不要选择尺寸太大的图片，将影响插件载入速度</q-tooltip
              >
              <q-menu nchor="top left" self="bottom end">
                <q-card>
                  <q-file
                    dense
                    standout="bg-primary text-white"
                    v-model="selectFile"
                    autofocus
                    @update:model-value="changeBackground()"
                    accept="image/*"
                    label="请选择一张图片"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                  <q-btn
                    color="negative"
                    label="取消背景"
                    class="full-width"
                    @click="changeBackground(1)"
                  />
                </q-card>
              </q-menu>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <!-- 收藏 -->
      <q-item v-if="isTagStared" clickable>
        <q-item-section side>
          <q-icon name="star_border" />
        </q-item-section>
        <q-item-section>取消收藏</q-item-section>
      </q-item>
      <q-item v-else clickable @click="showPanelConf = true">
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
      <!-- 关于 -->
      <q-item clickable @click="showAbout = true">
        <q-item-section side>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>关于</q-item-section></q-item
      >
    </q-list>
    <!-- 关于弹窗 -->
    <q-dialog v-model="showAbout">
      <AboutThis />
    </q-dialog>
    <!-- 面板视图弹窗 -->
    <q-dialog v-model="showPanelConf">
      <PanelSetting :isTagStared="isTagStared" />
    </q-dialog>
  </q-menu>
</template>

<script>
import { setCssVar } from "quasar";
import { ref } from "vue";
import AboutThis from "components/AboutThis";
import PanelSetting from "components/PanelSetting";
import UserInfo from "components/UserInfo";

export default {
  components: {
    AboutThis,
    PanelSetting,
    UserInfo,
  },
  data() {
    return {
      setCssVar: setCssVar,
      selectFile: ref(null),
      showAbout: false,
      showPanelConf: false,
    };
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
  mounted() {
    window.configurationMenu = this;
  },
  props: {
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
      this.$profile.primaryColor = this.$profile.defaultPrimaryColor;
      this.setPrimaryColor();
    },
    changeBackground(reset = false) {
      this.$profile.backgroundImg = reset ? null : this.selectFile.path;
      this.configurationPage.$forceUpdate();
    },
  },
};
</script>
