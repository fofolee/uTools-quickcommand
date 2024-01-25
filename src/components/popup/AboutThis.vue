<template>
  <div>
    <q-card>
      <q-card-section class="q-gutter-md flex items-center">
        <q-avatar square size="48px">
          <img src="logo.png" />
        </q-avatar>
        <span class="text-h5"
          >{{ pluginInfo.pluginName }} v{{ pluginInfo.version }}</span
        >
      </q-card-section>
      <q-card-section> {{ pluginInfo.description }} </q-card-section>
      <q-card-section>
        <div
          v-for="group in Object.keys(links)"
          :key="group"
          class="q-gutter-sm"
        >
          <q-btn
            flat
            color="primary"
            v-for="item in links[group]"
            :icon="item.icon"
            :key="item"
            @click="item.url ? visit(item.url) : (showMore = true)"
            :label="item.name"
            ><q-tooltip>{{ item.desc }} </q-tooltip></q-btn
          >
          <br />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="确定" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
    <q-dialog transition-show="fade" transition-hide="fade" v-model="showMore">
      <MorePlugins
    /></q-dialog>
  </div>
</template>

<script>
import MorePlugins from "./MorePlugins";

const links = {
  plugin: [
    {
      name: "帮助",
      icon: "help",
      url: "https://www.yuque.com/fofolee/mwsoos/bg31vl",
      desc: "查看插件使用帮助",
    },
    {
      name: "源码",
      icon: "code",
      url: "https://github.com/fofolee/uTools-quickcommand",
      desc: "本插件完全开源，记得 ⭐️ 哟",
    },
    {
      name: "论坛",
      icon: "forum",
      url: "https://yuanliao.info/d/424-242-242",
      desc: "到猿料论坛参与讨论吧",
    },
    {
      name: "更多插件",
      icon: "extension",
      desc: "看一看作者的其他插件吧",
    },
  ],
  tech: [
    {
      name: "Vue.js",
      url: "https://v3.cn.vuejs.org/",
      desc: "基于 Vue.js 开发",
    },
    {
      name: "Quasar Framework",
      url: "https://quasar.dev/",
      desc: "基于 Quasar Framework 开发",
    },
    {
      name: "Google Fonts",
      url: "https://fonts.google.com/",
      desc: "文字图标来自 Google Fonts",
    },
    {
      name: "Icon8s",
      url: "https://icons8.com/",
      desc: "彩色图标来自 Icon8s",
    },
  ],
};

export default {
  components: { MorePlugins },
  data() {
    return {
      pluginInfo: window.pluginInfo(),
      links: links,
      showMore: false,
    };
  },
  methods: {
    visit(url) {
      utools.shellOpenExternal(url);
    },
  },
};
</script>
