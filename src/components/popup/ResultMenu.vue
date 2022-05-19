<template>
  <q-btn-group :stretch="stretch" class="text-primary">
    <q-btn icon="image" @click="dataUrlToImg" v-show="imagebtn" :dense="dense"
      ><q-tooltip v-if="!dense">将 DataUrl 转为图片</q-tooltip></q-btn
    >
    <q-btn
      icon="content_paste"
      @click="copyResult"
      v-show="textbtn"
      :dense="dense"
      ><q-tooltip v-if="!dense">复制到剪贴板</q-tooltip></q-btn
    >
    <q-btn icon="send" @click="sendResult" v-show="textbtn" :dense="dense"
      ><q-tooltip v-if="!dense">发送到活动窗口</q-tooltip></q-btn
    >
    <q-btn
      icon="close"
      class="text-negative"
      v-close-popup
      v-show="closebtn"
      :dense="dense"
    />
  </q-btn-group>
</template>

<script>
export default {
  props: {
    dense: Boolean,
    stretch: Boolean,
    textbtn: Boolean,
    imagebtn: Boolean,
    closebtn: Boolean,
    content: String,
  },
  methods: {
    copyResult() {
      utools.copyText(this.content);
      quickcommand.showMessageBox("已复制到剪贴板");
    },
    sendResult() {
      utools.copyText(this.content);
      utools.hideMainWindow();
      quickcommand.simulatePaste();
    },
    dataUrlToImg() {
      let imgs = this.content
        .match(/data:image\/.*?;base64,.*/g)
        ?.map((dataUrl) => `<img src="${dataUrl}"><br>`);
      if (!imgs) return quickcommand.showMessageBox("dataUrl 格式不正确！");
      this.$emit("showImg", imgs);
    },
  },
};
</script>
