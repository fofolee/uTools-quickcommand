<template>
  <div class="flex">
    <q-btn stretch color="primary" flat size="xs"
      ><q-spinner-bars color="primary" size="1.5em" />
      <q-menu
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
        <!-- 菜单 -->
        <q-list>
          <!-- 实用功能 -->
          <q-item clickable>
            <q-item-section side>
              <q-icon name="keyboard_arrow_left" />
            </q-item-section>
            <q-item-section>实用功能</q-item-section>
            <q-menu anchor="top end" self="top start">
              <q-list>
                <q-item>
                  <q-item-section side>
                    <q-icon name="folder_special" />
                  </q-item-section>
                  <q-input
                    dense
                    prefix="快速收藏文件至"
                    suffix="标签"
                    outlined
                    input-class="text-center"
                    style="width: 280px"
                    autofocus
                    v-model="$root.profile.quickFileTag"
                    type="text"
                  >
                    <template v-slot:append>
                      <q-toggle
                        @click="toggleFeature('favFile')"
                        v-model="$root.profile.quickFileEnable"
                        checked-icon="check"
                        color="primary"
                      />
                    </template>
                    <q-tooltip
                      >启用后，选中文件可以通过超级面板快速将文件收藏到「{{
                        $root.profile.quickFileTag
                      }}」标签
                    </q-tooltip>
                  </q-input>
                </q-item>
                <q-item>
                  <q-item-section side>
                    <q-icon name="bookmarks" />
                  </q-item-section>
                  <q-input
                    dense
                    prefix="快速收藏网址至"
                    suffix="标签"
                    outlined
                    input-class="text-center"
                    style="width: 280px"
                    v-model="$root.profile.quickUrlTag"
                    type="text"
                  >
                    <template v-slot:append>
                      <q-toggle
                        @click="toggleFeature('favUrl')"
                        v-model="$root.profile.quickUrlEnable"
                        checked-icon="check"
                        color="primary"
                      />
                    </template>
                    <q-tooltip
                      >启用后，在浏览器界面可以通过超级面板快速将网址收藏到「{{
                        $root.profile.quickUrlTag
                      }}」标签
                    </q-tooltip>
                  </q-input>
                </q-item>
                <q-item>
                  <q-item-section side>
                    <q-icon name="drive_file_rename_outline" />
                  </q-item-section>
                  <q-input
                    dense
                    prefix="新建插件别名至"
                    suffix="标签"
                    outlined
                    input-class="text-center"
                    style="width: 280px"
                    autofocus
                    v-model="$root.profile.pluNickNameTag"
                    type="text"
                  >
                    <template v-slot:append>
                      <q-toggle
                        @click="toggleFeature('pluNickName')"
                        v-model="$root.profile.pluNickNameEnable"
                        checked-icon="check"
                        color="primary"
                      />
                    </template>
                    <q-tooltip
                      >启用后，在主输入框输入「插件别名」可以快速设置插件别名<br />
                      并将所有设置的别名保存至「{{
                        $root.profile.pluNickNameTag
                      }}」标签
                    </q-tooltip>
                  </q-input>
                </q-item>
                <q-item>
                  <q-item-section side>
                    <q-icon name="api" />
                  </q-item-section>
                  <q-field dense outlined style="width: 280px">
                    <template v-slot:control>
                      <div
                        class="self-center full-width no-outline"
                        tabindex="0"
                      >
                        快捷命令服务
                      </div>
                    </template>
                    <template v-slot:append>
                      <q-btn
                        flat
                        @click="$router.push('server')"
                        icon="open_in_new"
                      />
                    </template>
                    <q-tooltip
                      >通过本地监听
                      {{ $root.nativeProfile.serverPort }}
                      端口的形式，接收用户传送过来的参数，然后根据参数执行不同的操作
                      <br />
                      需要配置插件跟随 utools 启动和保留后台<br />
                      也可在主输入框通过关键字「快捷命令服务配置」进入
                    </q-tooltip>
                  </q-field>
                </q-item>
                <q-item>
                  <q-item-section side>
                    <q-icon name="code" />
                  </q-item-section>
                  <q-field dense outlined style="width: 280px">
                    <template v-slot:control>
                      <div
                        class="self-center full-width no-outline"
                        tabindex="0"
                      >
                        运行代码
                      </div>
                    </template>
                    <template v-slot:append>
                      <q-btn
                        flat
                        @click="$router.push('code')"
                        icon="open_in_new"
                      />
                    </template>
                    <q-tooltip
                      >一个可以直接运行代码的代码编辑器<br />
                      也可在主输入框输入关键字「RunCode」进入
                    </q-tooltip>
                  </q-field>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>
          <!-- 导入 -->
          <q-item clickable>
            <q-item-section side>
              <q-icon name="keyboard_arrow_left" />
            </q-item-section>
            <q-item-section>导入导出</q-item-section>
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
                <!-- 导出 -->
                <q-item clickable v-close-popup @click="exportAllCommands">
                  <q-item-section side>
                    <q-icon name="file_upload" />
                  </q-item-section>
                  <q-item-section>导出所有命令</q-item-section>
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
                  <q-item-section>清空数据</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>
          <!-- 选项 -->
          <q-item clickable>
            <q-item-section side>
              <q-icon name="keyboard_arrow_left" />
            </q-item-section>
            <q-item-section>个性化设置</q-item-section>
            <q-menu anchor="top end" self="top start">
              <q-list>
                <q-item clickable :disable="!$refs.user.isVIP">
                  <q-item-section side>
                    <q-icon name="color_lens" />
                  </q-item-section>
                  <q-item-section>主颜色</q-item-section>
                  <q-tooltip>你可以更改界面的主题色，会员限定</q-tooltip>
                  <q-menu
                    v-if="$refs.user.isVIP"
                    nchor="top left"
                    self="bottom end"
                  >
                    <q-card>
                      <q-color
                        @change="setPrimaryColor"
                        v-model="$root.profile.primaryColor"
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
                <q-item clickable :disable="!$refs.user.isVIP">
                  <q-item-section side>
                    <q-icon name="image" />
                  </q-item-section>
                  <q-item-section>面板视图背景图片</q-item-section>
                  <q-tooltip
                    >为面板视图设置一张背景图片，会员限定<br />请不要选择尺寸太大的图片，将影响插件载入速度</q-tooltip
                  >
                  <q-menu
                    v-if="$refs.user.isVIP"
                    nchor="top left"
                    self="bottom end"
                  >
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
                <q-item clickable :disable="!$refs.user.isVIP">
                  <q-item-section side>
                    <q-icon name="label" />
                  </q-item-section>
                  <q-item-section class="flex">紧凑标签栏 </q-item-section>
                  <q-tooltip
                    >更为紧凑的标签栏，适用于标签非常多的情形</q-tooltip
                  >
                  <q-item-section side
                    ><q-toggle
                      v-model="$root.profile.denseTagBar"
                      :disable="!$refs.user.isVIP"
                      color="primary"
                  /></q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section side>
                    <q-icon name="search" />
                  </q-item-section>
                  <q-item-section class="flex">自动聚焦搜索 </q-item-section>
                  <q-tooltip>进入插件时自动聚焦搜索</q-tooltip>
                  <q-item-section side
                    ><q-toggle
                      v-model="$root.profile.autofocusSearch"
                      color="primary"
                  /></q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>
          <q-item clickable to="/share">
            <q-item-section side>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>分享中心</q-item-section>
          </q-item>
          <!-- 收藏 -->
          <q-item v-if="isTagStared" clickable @click="unMarkTag" v-close-popup>
            <q-item-section side>
              <q-icon name="star_border" />
            </q-item-section>
            <q-item-section>取消收藏</q-item-section>
          </q-item>
          <q-item v-else clickable @click="showPanelConf = true" v-close-popup>
            <q-item-section side>
              <q-icon name="star" />
            </q-item-section>
            <q-item-section>收藏标签</q-item-section>
            <q-tooltip
              >收藏后，会将当前标签名作为全局关键字，可在 uTools
              的主输入框进行搜索
              <br />
              搜索进入后，默认进入当前标签的面板视图 <br />
              类似于旧版本的「快捷面板」</q-tooltip
            >
          </q-item>
          <!-- 关于 -->
          <q-item clickable @click="showAbout = true" v-close-popup>
            <q-item-section side>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>关于和帮助</q-item-section></q-item
          >
        </q-list>
      </q-menu>
    </q-btn>
    <!-- 关于弹窗 -->
    <q-dialog v-model="showAbout">
      <AboutThis />
    </q-dialog>
    <!-- 面板视图弹窗 -->
    <q-dialog v-model="showPanelConf">
      <PanelSetting :isTagStared="isTagStared" :currentTag="currentTag" />
    </q-dialog>
  </div>
</template>

<script>
import { setCssVar } from "quasar";
import { ref } from "vue";
import AboutThis from "components/popup/AboutThis";
import PanelSetting from "components/popup/PanelSetting";
import UserInfo from "components/popup/UserInfo";
import features from "../js/options/quickFeatures.js";

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
      features: features,
      redirect: utools.redirect,
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
  props: {
    isTagStared: Boolean,
    currentTag: String,
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
    // 设置主题色
    setPrimaryColor() {
      this.setCssVar("primary", this.$root.profile.primaryColor);
    },
    // 重置主题色
    resetPrimary() {
      this.$root.profile.primaryColor = this.$root.profile.defaultPrimaryColor;
      this.setPrimaryColor();
    },
    // 修改面板视图背景
    changeBackground(reset = false) {
      let base64 = window.getBase64Ico(this.selectFile.path);
      this.$root.profile.backgroundImg = reset ? null : base64;
      this.configurationPage.$forceUpdate();
    },
    // 取消收藏
    unMarkTag() {
      this.$root.utools.whole.removeFeature(
        `panel_${window.hexEncode(this.currentTag)}`
      );
      _.pull(this.$root.$refs.view.activatedQuickPanels, this.currentTag);
      quickcommand.showMessageBox("取消收藏成功");
    },
    // 实用功能
    toggleFeature(type) {
      this.$root.utools.whole.removeFeature(this.features[type].code) ||
        this.$root.utools.whole.setFeature(_.cloneDeep(this.features[type]));
      if (type === "apiServer" && !this.$root.profile.apiServerEnable) {
        window.quickcommandHttpServer().stop();
        this.$root.nativeProfile.serverStatus = false;
      }
    },
  },
};
</script>
