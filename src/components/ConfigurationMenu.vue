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
      <!-- 菜单 -->
      <q-list>
        <!-- 命令管理 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>命令管理</q-item-section>
          <q-menu anchor="top end" self="top start">
            <q-list>
              <!-- 导入 -->
              <q-item
                clickable
                v-close-popup
                @click="importCommand(importCommandFromFile())"
              >
                <q-item-section side>
                  <q-icon name="text_snippet" />
                </q-item-section>
                <q-item-section>从文件导入命令</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="importCommand(importCommandFromClipboard())"
              >
                <q-item-section side>
                  <q-icon name="content_paste" />
                </q-item-section>
                <q-item-section>从剪贴板导入命令</q-item-section>
              </q-item>
              <!-- 导出 -->
              <q-item clickable v-close-popup @click="exportAllCommands">
                <q-item-section side>
                  <q-icon name="file_upload" />
                </q-item-section>
                <q-item-section>导出所有命令</q-item-section>
              </q-item>
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
                  @blur="
                    $root.profile.quickFileTag ||
                      ($root.profile.quickFileTag = '文件')
                  "
                  type="text"
                >
                  <template v-slot:append>
                    <q-toggle
                      @update:model-value="
                        (val, e) => toggleFeature('favFile', val)
                      "
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
                  @blur="
                    $root.profile.quickUrlTag ||
                      ($root.profile.quickUrlTag = '网址')
                  "
                  type="text"
                >
                  <template v-slot:append>
                    <q-toggle
                      @update:model-value="
                        (val, e) => toggleFeature('favUrl', val)
                      "
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
                      @update:model-value="
                        (val, e) => toggleFeature('pluNickName', val)
                      "
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
                    <div class="self-center full-width no-outline" tabindex="0">
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
                    <div class="self-center full-width no-outline" tabindex="0">
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
                    >一个可以代码的代码编辑器<br />
                    也可在主输入框输入关键字「RunCode」进入
                  </q-tooltip>
                </q-field>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <!-- 环境配置 -->
        <q-item clickable>
          <q-item-section side>
            <q-icon name="keyboard_arrow_left" />
          </q-item-section>
          <q-item-section>环境配置</q-item-section>
          <q-menu anchor="bottom end" self="bottom start">
            <q-list>
              <q-item clickable v-close-popup @click="showUserDara = true">
                <q-item-section side>
                  <q-icon name="manage_accounts" />
                </q-item-section>
                <q-item-section>用户特殊变量</q-item-section>
                <q-tooltip
                  >用户设置的变量，类似一个全局配置项<br />
                  配置好后可选择特殊变量中的「usr:」插入<br />
                  也可直接在特殊变量中配置</q-tooltip
                >
              </q-item>
              <q-item>
                <q-item-section side>
                  <q-icon name="dvr" />
                </q-item-section>
                <q-input
                  dense
                  outlined
                  autogrow
                  style="width: 280px"
                  autofocus
                  v-model="$root.nativeProfile.envPath"
                  type="text"
                  label="环境变量 PATH"
                >
                  <q-tooltip
                    >修改本插件环境变量中的 PATH，直接覆盖而非追加
                    <br />将会影响到除 quickcommand、html
                    以外的所有环境</q-tooltip
                  >
                </q-input>
              </q-item>
              <q-item v-if="showAlias">
                <q-item-section side>
                  <q-icon name="code" />
                </q-item-section>
                <q-input
                  dense
                  outlined
                  autogrow
                  style="width: 280px"
                  v-model="$root.nativeProfile.alias"
                  type="text"
                  label="Alias"
                >
                  <q-tooltip
                    >一行一条，配置方法和 shell 的语法一样<br />如 alias
                    python="/home/user/.bin/python"<br />将会影响到除
                    quickcommand、html 以外的所有环境</q-tooltip
                  >
                </q-input>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <!-- 个性化设置 -->
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
                <q-tooltip>你可以更改界面的主题色，会员限定 😎</q-tooltip>
                <q-menu
                  v-if="$refs.user.isVIP"
                  nchor="top left"
                  self="bottom end"
                  style="min-width: 200px; min-height: 200px"
                >
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
                </q-menu>
              </q-item>
              <q-item clickable :disable="!$refs.user.isVIP">
                <q-item-section side>
                  <q-icon name="image" />
                </q-item-section>
                <q-item-section>背景图片设置</q-item-section>
                <q-tooltip>设置背景图片，会员限定 😎</q-tooltip>
                <q-menu
                  v-if="$refs.user.isVIP"
                  anchor="top left"
                  self="bottom end"
                >
                  <q-card>
                    <q-card-section>
                      <div class="text-subtitle2">亮色模式背景</div>
                      <q-file
                        dense
                        standout="bg-primary text-white"
                        v-model="selectFileLight"
                        autofocus
                        @update:model-value="setBackgroundImg('light')"
                        accept="image/*"
                        label="请选择一张图片"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_file" />
                        </template>
                      </q-file>
                    </q-card-section>
                    <q-card-section>
                      <div class="text-subtitle2">暗色模式背景</div>
                      <q-file
                        dense
                        standout="bg-primary text-white"
                        v-model="selectFileDark"
                        @update:model-value="setBackgroundImg('dark')"
                        accept="image/*"
                        label="请选择一张图片"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_file" />
                        </template>
                      </q-file>
                    </q-card-section>
                    <q-btn
                      color="negative"
                      label="取消背景"
                      class="full-width"
                      @click="removeBackgroundImg()"
                    />
                  </q-card>
                </q-menu>
              </q-item>
              <!-- 毛玻璃效果滑块 -->
              <q-item>
                <q-item-section side>
                  <q-icon name="blur_on" />
                </q-item-section>
                <q-item-section class="flex">毛玻璃效果</q-item-section>
                <q-tooltip
                  >启用毛玻璃界面，并调节效果强度，会员限定 😎</q-tooltip
                >
                <q-item-section side>
                  <div
                    class="flex items-center justify-center"
                    style="width: 56px"
                  >
                    <q-knob
                      v-model="$root.profile.glassEffect"
                      :min="0"
                      :max="12"
                      color="primary"
                      :thickness="0.6"
                      size="24px"
                      track-color="grey-3"
                      @change="toggleGlassEffect"
                      class="q-mx-auto"
                    />
                  </div>
                </q-item-section>
              </q-item>
              <q-item clickable :disable="!$refs.user.isVIP">
                <q-item-section side>
                  <q-icon name="label" />
                </q-item-section>
                <q-item-section class="flex">紧凑标签栏 </q-item-section>
                <q-tooltip>更为紧凑的标签栏，适用于标签非常多的情形</q-tooltip>
                <q-item-section side
                  ><q-toggle
                    v-model="$root.profile.denseTagBar"
                    :disable="!$refs.user.isVIP"
                    color="primary"
                    @update:model-value="$root.saveProfile"
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
                    @update:model-value="$root.saveProfile"
                /></q-item-section>
              </q-item>
              <!-- 自动分离 -->
              <!-- <q-item clickable v-close-popup @click="getActivatedFutures(); showAutoDetachFeatures = true">
                <q-item-section side>
                  <q-icon name="web_stories" />
                </q-item-section>
                <q-item-section class="flex">自动分离 </q-item-section>
                <q-tooltip>utools的自动分离对整个插件生效，配置此选项可以实现只对某些特定的功能进行自动分离</q-tooltip>
              </q-item> -->
            </q-list>
          </q-menu>
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
          <q-tooltip
            >收藏后，会将当前标签名作为全局关键字，可在 uTools
            的主输入框进行搜索
            <br />
            搜索进入后，默认进入当前标签的面板视图 <br />
            类似于旧版本的「快捷面板」</q-tooltip
          >
        </q-item>
        <!-- 关于 -->
        <q-item clickable v-close-popup @click="showAbout = true">
          <q-item-section side>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>关于和帮助</q-item-section></q-item
        >
      </q-list>
    </q-menu>
    <!-- 关于弹窗 -->
    <q-dialog v-model="showAbout">
      <AboutThis />
    </q-dialog>
    <!-- 面板视图弹窗 -->
    <q-dialog v-model="showPanelConf">
      <PanelSetting :isTagStared="isTagStared" :currentTag="currentTag" />
    </q-dialog>
    <q-dialog v-model="showUserDara">
      <UserData :showInsertBtn="false" />
    </q-dialog>
    <!-- <q-dialog v-model="showAutoDetachFeatures">
        <q-card>
          <q-card-section style="height: 400px; overflow: auto;">
            <q-option-group v-model="$root.profile.autoDetachFeatures" type="checkbox" :options="activateFeatures">
              <template v-slot:label="opt">
                <q-item clickable v-ripple style="width: 300px;">
                  <q-item-section avatar>
                    <q-img :src="opt.icon" width="30px" />
                  </q-item-section>
                  <q-item-section>
                    {{ opt.label }}
                  </q-item-section>
                </q-item>
              </template>
            </q-option-group>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" @click="showAutoDetachFeatures = false" />
            <q-btn color="primary" label="确定" @click="changeAutoDetachFeatures" />
          </q-card-actions>
        </q-card>
      </q-dialog> -->
  </div>
</template>

<script>
import { setCssVar } from "quasar";
import { ref } from "vue";
import AboutThis from "components/popup/AboutThis";
import PanelSetting from "components/popup/PanelSetting";
import UserInfo from "components/popup/UserInfo";
import features from "../js/options/quickFeatures.js";
import UserData from "components/popup/UserData";

export default {
  components: {
    AboutThis,
    PanelSetting,
    UserInfo,
    UserData,
  },
  data() {
    return {
      setCssVar: setCssVar,
      selectFileLight: null,
      selectFileDark: null,
      showAbout: false,
      showPanelConf: false,
      showUserDara: false,
      showAutoDetachFeatures: false,
      features: features,
      redirect: utools.redirect,
      showAlias: this.$q.platform.is.mac || this.$q.platform.is.linux,
      activateFeatures: [],
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
    importCommand(command) {
      this.configurationPage.importCommand(command);
    },
    // 从文件导入命令
    importCommandFromFile() {
      let options = {
        type: "dialog",
        argvs: { filters: [{ name: "json", extensions: ["json"] }] },
        readfile: true,
      };
      let fileContent = window.getFileInfo(options);
      return fileContent ? fileContent.data : false;
    },
    // 从剪贴板导入命令
    importCommandFromClipboard() {
      return window.clipboardReadText();
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
      this.$root.saveProfile();
    },
    // 重置主题色
    resetPrimary() {
      this.$root.profile.primaryColor = this.$root.profile.defaultPrimaryColor;
      this.setPrimaryColor();
    },
    // 修改背景
    async setBackgroundImg(mode) {
      const file =
        mode === "light" ? this.selectFileLight : this.selectFileDark;
      if (!file) return;

      // 使用 Node.js 处理图片
      const processedImage = await window.imageProcessor(file.path);

      // 更新配置
      if (mode === "light") {
        this.$root.profile.backgroundImgLight = processedImage;
      } else {
        this.$root.profile.backgroundImgDark = processedImage;
      }
      this.$root.saveProfile();
    },
    removeBackgroundImg() {
      this.$root.profile.backgroundImgLight = "";
      this.$root.profile.backgroundImgDark = "";
      this.$root.saveProfile();
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
    toggleFeature(type, enable) {
      enable
        ? this.$root.utools.whole.setFeature(_.cloneDeep(this.features[type]))
        : this.$root.utools.whole.removeFeature(this.features[type].code);
    },
    // 获取所有启用的功能
    getActivatedFutures() {
      let activateFeatures = this.$root.utools.whole
        .getFeatures()
        .map((fts) => {
          return {
            value: fts.code,
            icon: fts.icon,
            label: fts.explain,
          };
        });
      let defaultFeatures = [
        {
          value: "configuration",
          label: "快捷命令配置",
          icon: "logo.png",
        },
        {
          value: "code",
          label: "运行代码",
          icon: "features/code.png",
        },
        {
          value: "server",
          label: "快捷命令服务",
          icon: "features/server.png",
        },
      ];
      this.activateFeatures = _.concat(
        defaultFeatures,
        _.cloneDeep(activateFeatures)
      );
    },
    changeAutoDetachFeatures() {
      this.showAutoDetachFeatures = false;
      quickcommand.showMessageBox("设置成功");
    },
    toggleGlassEffect(val) {
      this.$root.profile.glassEffect = val;
      this.$root.saveProfile();
    },
  },
};
</script>

<style>
/* 基础菜单样式 - 始终保持最小毛玻璃效果 */
.q-menu {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.07);
}

.body--dark .q-menu {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 毛玻璃菜单效果 - 叠加用户设置的效果 */
body.glass-effect-menu .q-menu {
  background: rgba(
    255,
    255,
    255,
    calc(0.15 + var(--glass-effect-strength) * 0.01)
  ) !important;
  backdrop-filter: blur(
    calc(5px + var(--glass-effect-strength) * 1px)
  ) !important;
  -webkit-backdrop-filter: blur(
    calc(5px + var(--glass-effect-strength) * 1px)
  ) !important;
}

/* 暗色模式菜单 */
body.body--dark.glass-effect-menu .q-menu {
  background: rgba(
    0,
    0,
    0,
    calc(0.2 + var(--glass-effect-strength) * 0.02)
  ) !important;
}

/* 菜单列表透明背景 */
.q-menu .q-list {
  background: transparent !important;
}

/* 菜单项浮效果 */
.q-menu .q-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .q-menu .q-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 输入框样式 */
.q-menu .q-field__control {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 4px;
}

.body--dark .q-menu .q-field__control {
  background: rgba(0, 0, 0, 0.3) !important;
}
</style>
