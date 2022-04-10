<template>
  <div>
    <q-dialog v-model="showIconPicker" class="q-gutter" position="left">
      <q-card>
        <q-card-section class="text-h5 text-center">更改图标</q-card-section>
        <q-card-section>
          <q-select
            ref="icon8"
            v-model="icon8sIcon"
            :options="options"
            label="搜索ICON8S"
            options-dense
            use-input
            :loading="loading"
            input-debounce="1000"
            @input-value="searchIcon8s"
            @update:model-value="getIcon8sIcon"
            transition-show="jump-down"
            transition-hide="jump-up"
            virtual-scroll-slice-size="30"
            standout="bg-primary text-white"
          >
            <template v-slot:selected>
              {{ icon8sIcon?.name || "" }}
            </template>
            <template v-slot:prepend> <q-icon name="image" /> </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-img
                    :src="`https://img.icons8.com/color/1x/${scope.opt.commonName}.png`"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.name" />
                </q-item-section>
              </q-item> </template
          ></q-select>
        </q-card-section>
        <q-card-section>
          <q-file
            standout="bg-primary text-white"
            v-model="localIconFile"
            @update:model-value="getLocalIcon"
            accept="image/*"
            label="选择本地图片"
          >
            <template v-slot:prepend>
              <q-icon name="folder" />
            </template>
          </q-file>
        </q-card-section>
        <q-card-section>
          <q-input
            standout="bg-primary text-white"
            v-model="netWorkIconUrl"
            @blur="getRemoteIcon"
            type="text"
            label="网络图片地址"
          >
            <template v-slot:prepend> <q-icon name="cloud" /> </template
          ></q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" @click="showIconPicker = false"
            >确定</q-btn
          >
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  data() {
    return {
      showIconPicker: false,
      localIconFile: ref(null),
      icon8sIcon: ref(null),
      netWorkIconUrl: "",
      options: ref(null),
      loading: false,
      icon8: {
        platform: "color",
        amount: "300",
        baseUrl: "https://search.icons8.com/api/iconsets/v5/search",
      },
    };
  },
  methods: {
    setIcon(dataUrl) {
      this.$emit("iconChanged", dataUrl);
    },

    searchIcon8s(val) {
      if (!val) return;
      this.loading = true;
      let language = /[\u4e00-\u9fa5]/.test(val) ? "zh" : "en";
      let apiUrl = `${this.icon8.baseUrl}?term=${val}&amount=${this.icon8.amount}&offset=0&platform=${this.icon8.platform}&language=${language}`;
      fetch(apiUrl)
        .then((res) => res.json())
        .then((res) => {
          this.options = res.icons;
          this.$refs.icon8.showPopup();
          this.loading = false;
        });
    },

    getIcon8sIcon() {
      let imgUrl = `https://img.icons8.com/color/2x/${this.icon8sIcon.commonName}.png`;
      this.getRemoteIcon(imgUrl);
    },

    getLocalIcon() {
      window.getBase64Ico(this.localIconFile.path).then((dataUrl) => {
        dataUrl && this.setIcon(dataUrl);
      });
    },

    getRemoteIcon(url = this.netWorkIconUrl) {
      this.getImg(url, (dataUrl) => {
        dataUrl && this.setIcon(dataUrl);
      });
    },

    getImg(imgUrl, callback) {
      let imgInfo = window.getFileInfo({
        type: "file",
        argvs: imgUrl,
        readfile: false,
      });
      let imgPath = window.getQuickcommandTempFile(imgInfo.ext);
      quickcommand
        .downloadFile(imgUrl, imgPath)
        .then(() => {
          window.getBase64Ico(imgPath).then((src) => {
            callback(src);
          });
        })
        .catch((e) => {
          quickcommand.showMessageBox("图片地址有误！", "error");
        });
    },
  },
};
</script>
