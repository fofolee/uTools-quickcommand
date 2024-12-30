<template>
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
        input-debounce="2000"
        @input-value="searchIcon8s"
        @update:model-value="getIcon8sIcon"
        transition-show="jump-down"
        transition-hide="jump-up"
        virtual-scroll-slice-size="30"
        standout="bg-primary text-white"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> 键入关键词搜索 </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected>
          <!-- {{ icon8sIcon?.name || "" }} -->
        </template>
        <template v-slot:prepend>
          <q-avatar size="24px" v-if="dataUrl && icon8sIcon">
            <q-img :src="dataUrl" />
          </q-avatar>
          <q-icon v-else name="image" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-img :src="getIcon8sIconUrl(scope.opt, 1)" />
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
        :display-value="localIconFile || ''"
        @click="getLocalIcon"
        label="选择本地资源"
      >
        <template v-slot:prepend>
          <q-avatar size="24px" v-if="dataUrl && localIconFile">
            <q-img :src="dataUrl" />
          </q-avatar>
          <q-icon v-else name="folder" />
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
        <template v-slot:prepend>
          <q-avatar size="24px" v-if="dataUrl && netWorkIconUrl">
            <q-img :src="dataUrl" />
          </q-avatar>
          <q-icon v-else name="cloud" /> </template
      ></q-input>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat color="primary" v-close-popup>确定</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref } from "vue";
import pictureCompress from "picture-compressor";

export default {
  data() {
    return {
      localIconFile: ref(null),
      icon8sIcon: ref(null),
      netWorkIconUrl: "",
      options: ref(null),
      loading: false,
      icon8: {
        platform:
          "office80,color,fluent,nolan,3d-fluency,isometric,emoji,dusk,stickers,plasticine,bubbles,cotton,clouds,doodle,arcade,pulsar-color,clr-gls,ultraviolet,flat_round,parakeet,neon,matisse,tiny-color,stencil,avantgarde,water-color,retro,3d-plastilina,stitch",
        amount: "300",
        baseUrl: "https://search.icons8.com/api/iconsets/v5/search",
      },
      dataUrl: null,
    };
  },
  props: {
    position: String,
  },
  methods: {
    setIcon(dataUrl) {
      this.dataUrl = dataUrl;
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

    getIcon8sIconUrl(icon, size) {
      return `https://img.icons8.com/${icon.platform}/${size}x/${icon.commonName}.png`;
    },

    getIcon8sIcon() {
      let imgUrl = this.getIcon8sIconUrl(this.icon8sIcon, 2);
      this.getRemoteIcon(imgUrl);
    },

    getLocalIcon(e) {
      // q-file 无法获取 .app 的路径，改用 utools.showOpenDialog
      e.preventDefault();
      this.localIconFile = utools.showOpenDialog({
        title: "请选择图片文件或者可执行文件",
        filters: [
          {
            name: "localFile",
            extensions: [
              "png",
              "jpg",
              "jpeg",
              "bmp",
              "ico",
              "gif",
              "svg",
              "app",
              "exe",
            ],
          },
        ],
      })[0];
      if (
        this.localIconFile.slice(-4) === ".app" ||
        this.localIconFile.slice(-4) === ".exe"
      )
        return this.setIcon(utools.getFileIcon(this.localIconFile));
      this.compressingPic(window.resolveFileToBase64(this.localIconFile)).then(
        (dataUrl) => {
          dataUrl && this.setIcon(dataUrl);
        }
      );
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
      let imgPath = window.getQuickcommandTempFile(imgInfo.ext, "TempImgFile");
      quickcommand
        .downloadFile(imgUrl, imgPath)
        .then(() => {
          this.compressingPic(window.resolveFileToBase64(imgPath)).then(
            (src) => {
              callback(src);
            }
          );
        })
        .catch((e) => {
          quickcommand.showMessageBox("图片地址有误！", "error");
        });
    },
    async compressingPic(img, width = 80) {
      let compressedImage = await pictureCompress({
        img: img,
        width: width,
        height: width,
        type: "png",
        quality: 1,
      });
      return compressedImage.img;
    },
  },
};
</script>
