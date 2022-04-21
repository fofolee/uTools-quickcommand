<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 20vh">需要升级</div>

      <div class="text-h4" style="opacity: 0.4">
        uTools 当前版本 {{ version || "过低" }}<br />然而这个插件是基于
        {{ requiredversion }} 版本开发的，低于该版本可能会出现不可预料的问题
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        @click="update()"
        label="去官网升级"
        no-caps
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      requiredversion: this.$route.params.requiredVersion,
      version: this.$route.params.version,
    };
  },
  methods: {
    update() {
      utools.shellOpenExternal("https://u.tools/");
    },
  },
};
</script>
