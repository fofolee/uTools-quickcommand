<template>
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
            $root.profile.quickFileTag || ($root.profile.quickFileTag = '文件')
          "
          type="text"
        >
          <template v-slot:append>
            <q-toggle
              @update:model-value="(val) => toggleFeature('favFile', val)"
              v-model="$root.profile.quickFileEnable"
              checked-icon="check"
              color="primary"
            />
          </template>
          <q-tooltip
            >启用后，选中文件可以通过超级面板快速将文件收藏到「{{
              $root.profile.quickFileTag
            }}」标签</q-tooltip
          >
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
            $root.profile.quickUrlTag || ($root.profile.quickUrlTag = '网址')
          "
          type="text"
        >
          <template v-slot:append>
            <q-toggle
              @update:model-value="(val) => toggleFeature('favUrl', val)"
              v-model="$root.profile.quickUrlEnable"
              checked-icon="check"
              color="primary"
            />
          </template>
          <q-tooltip
            >启用后，在浏览器界面可以通过超级面板快速将网址收藏到「{{
              $root.profile.quickUrlTag
            }}」标签</q-tooltip
          >
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
              @update:model-value="(val) => toggleFeature('pluNickName', val)"
              v-model="$root.profile.pluNickNameEnable"
              checked-icon="check"
              color="primary"
            />
          </template>
          <q-tooltip>
            启用后，在主输入框输入「插件别名」可以快速设置插件别名<br />
            并将所有设置的别名保存至「{{ $root.profile.pluNickNameTag }}」标签
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
            <q-btn flat @click="$router.push('server')" icon="open_in_new" />
          </template>
          <q-tooltip>
            通过本地监听
            {{ $root.nativeProfile.serverPort }}
            端口的形式，接收用户传送过来的参数，然后根据参数执行不同的操作
            <br />需要配置插件跟随 utools 启动和保留后台<br />可在主输入框通过关键字「快捷命令服务配置」进入
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
            <q-btn flat @click="$router.push('code')" icon="open_in_new" />
          </template>
          <q-tooltip>
            一个可以直接运行代码的代码编辑器<br />可在主输入框输入关键字「RunCode」进入
          </q-tooltip>
        </q-field>
      </q-item>
      <q-item>
        <q-item-section side>
          <q-icon name="view_timeline" />
        </q-item-section>
        <q-field dense outlined style="width: 280px">
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              可视化编排
            </div>
          </template>
          <template v-slot:append>
            <q-btn flat @click="$router.push('composer')" icon="open_in_new" />
          </template>
          <q-tooltip>
            一个可视化编排工具，包含可以直接运行的超过一百种实用工具，也可以组合功能创建自动化流程
            <br />可在主输入框输入关键字「RunComposer」进入
          </q-tooltip>
        </q-field>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
import features from "js/options/quickFeatures.js";
import { utoolsFull } from "js/utools.js";

export default {
  name: "UtilityFeaturesMenu",
  data() {
    return {
      utools: utoolsFull,
    };
  },
  methods: {
    toggleFeature(type, enable) {
      enable
        ? this.utools.setFeature(window.lodashM.cloneDeep(features[type]))
        : this.utools.removeFeature(features[type].code);
    },
  },
};
</script>
