<template>
  <q-card style="width: 600px">
    <q-list>
      <q-item
        v-for="plugin in plugins"
        :key="plugin.name"
        clickable
        @click="jumpTo(plugin.plugin_name)"
      >
        <q-item-section avatar
          ><q-img :src="'https://res.u-tools.cn/plugins' + plugin.logo" />
        </q-item-section>
        <q-item-section>
          <q-item-label
            class="text-weight-bolder"
            v-text="plugin.plugin_name"
          />
          <q-item-label caption v-text="plugin.description" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
const plugins = [
  {
    plugin_name: "程序员手册",
    description:
      "内置了十多个实用的离线中文手册，包括：Linux、PHP、Python、JS等,以及提供了搜索devdocs、dash/zeal上的文档的功能",
    logo: "/logo/11bf712cc79499549754586fff7c8db1.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "bilibili",
    description: "查看b站热门视频、新番等",
    logo: "/logo/dd0977b7d74db32d7088795ef62a7769.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "插件面板",
    description: "已安装插件面板，点击图标启动",
    logo: "/logo/80eae148109a4d7001232efebdd14aca.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "随机壁纸",
    description: "随机获取四张壁纸，选择设为桌面，换换壁纸，换换心情",
    logo: "/logo/223f27b647b184ffdb2cd9f05a99d50a.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "关闭进程",
    description: "列出当前运行的所有进程，左键进行关闭，右键进行重启",
    logo: "/logo/f26a31d11af3a54f9bddd7e781da46d5.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "文件夹助手",
    description:
      "设置常用文件夹并快速打开，将选中文件快速移至常用/已打开文件夹，在另存窗口快速切换至常用/已打开文件夹",
    logo: "/logo/3e4cde32b985e103e76727f73e2a8be4.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "Github助手",
    description: "搜索github上的项目以及查看指定用户所有的项目及star过的项目",
    logo: "/logo/480ac04e8ea522b7bb0dae6418e177a4.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "????能不能好好说话",
    description: "「能不能好好说话？」 拼音首字母缩写翻译工具",
    logo: "/logo/50ef534638a9fc7fbed5274131afe503.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "刷题神器",
    description: "在 utools 或手机（通过 web）上刷题",
    logo: "/logo/1061b0eb6caf80e949ada7cf1ce1997d.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "kali 工具介绍",
    description: "kali 官方工具说明汉化版",
    logo: "/logo/527a20566499e7c3fb63e8705d60ccb7.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "icons8搜索",
    description:
      "搜索icons8的图标，并可以下载png、svg格式，或转成ico、icns格式",
    logo: "/logo/6abb03b743259bd4c976d2a29da0a395.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "emoji搜索",
    description: "快速搜索emoji",
    logo: "/logo/5f9fd2f37445a462c0735b9dcca828cd.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "png转icon",
    description: "批量将png转为ico文件或icns文件",
    logo: "/logo/3ef0e794b7950193fc98289ea2b199e9.png?x-oss-process=style/100x100",
  },
  {
    plugin_name: "homebrew",
    description: "homebrew for uTools",
    logo: "/logo/a2fc5549c970a910066e254fa7bdd8c7.png?x-oss-process=style/100x100",
  },
];

export default {
  data() {
    return {
      plugins: plugins,
    };
  },
  methods: {
    jumpTo(plugin) {
      utools.redirect(plugin);
    },
  },
};
</script>
