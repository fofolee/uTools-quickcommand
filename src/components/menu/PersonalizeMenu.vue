<template>
  <q-menu anchor="top end" self="top start">
    <q-list>
      <q-item clickable :disable="!$root.isVIP">
        <q-item-section side>
          <q-icon name="color_lens" />
        </q-item-section>
        <q-item-section>主颜色</q-item-section>
        <q-tooltip>你可以更改界面的主题色，会员限定 😎</q-tooltip>
        <q-menu
          v-if="$root.isVIP"
          anchor="center left"
          self="center right"
          style="min-width: 250px"
        >
          <div class="column">
            <q-color
              @change="setPrimaryColor"
              v-model="$root.profile.primaryColor"
              default-view="palette"
              class="full-width"
            />
            <q-btn
              color="primary"
              label="重置为默认"
              class="q-mt-sm"
              @click="resetPrimary"
            />
          </div>
        </q-menu>
      </q-item>
      <q-item clickable :disable="!$root.isVIP" class="bg-img-menu">
        <q-item-section side>
          <q-icon name="image" />
        </q-item-section>
        <q-item-section>背景图片设置</q-item-section>
        <q-tooltip>设置背景图片，会员限定 😎</q-tooltip>
        <q-menu v-if="$root.isVIP" anchor="center left" self="center right">
          <q-list style="min-width: 280px">
            <q-item>
              <q-item-section>
                <q-file
                  v-model="selectFileLight"
                  label="亮色模式背景"
                  dense
                  outlined
                  class="full-width"
                  accept=".jpg,.png,jpeg"
                  @update:model-value="() => setBackgroundImg('light')"
                >
                  <template v-slot:prepend>
                    <q-icon name="light_mode" />
                  </template>
                </q-file>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-file
                  v-model="selectFileDark"
                  label="暗色模式背景"
                  dense
                  outlined
                  class="full-width"
                  accept=".jpg,.png,.webp"
                  @update:model-value="() => setBackgroundImg('dark')"
                >
                  <template v-slot:prepend>
                    <q-icon name="dark_mode" />
                  </template>
                </q-file>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn
                  color="negative"
                  label="删除背景图片"
                  class="full-width"
                  @click="removeBackgroundImg"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item clickable :disable="!$root.isVIP">
        <q-item-section side>
          <q-icon name="blur_on" />
        </q-item-section>
        <q-item-section>毛玻璃效果</q-item-section>
        <q-tooltip>启用毛玻璃界面，并调节效果强度，会员限定 😎</q-tooltip>
        <q-item-section side>
          <div class="flex items-center justify-center" style="width: 56px">
            <q-knob
              v-model="$root.profile.glassEffect"
              :min="0"
              :max="12"
              :step="1"
              :disable="!$root.isVIP"
              color="primary"
              @update:model-value="toggleGlassEffect"
              size="34px"
              :thickness="0.22"
              class="glass-effect-knob"
              show-value
              font-size="13px"
            >
            </q-knob>
          </div>
        </q-item-section>
      </q-item>
      <q-item clickable :disable="!$root.isVIP">
        <q-item-section side>
          <q-icon name="label" />
        </q-item-section>
        <q-item-section>紧凑标签栏</q-item-section>
        <q-tooltip
          >更为紧凑的标签栏，适用于标签非常多的情形，会员限定 😎</q-tooltip
        >
        <q-item-section side>
          <q-toggle
            v-model="$root.profile.denseTagBar"
            :disable="!$root.isVIP"
            color="primary"
            @update:model-value="$root.saveProfile"
          />
        </q-item-section>
      </q-item>
      <q-item clickable>
        <q-item-section side>
          <q-icon name="search" />
        </q-item-section>
        <q-item-section class="flex">自动聚焦搜索</q-item-section>
        <q-tooltip>进入插件时自动聚焦搜索</q-tooltip>
        <q-item-section side>
          <q-toggle
            v-model="$root.profile.autofocusSearch"
            color="primary"
            @update:model-value="$root.saveProfile"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
import pictureCompress from "picture-compressor";

export default {
  name: "PersonalizeMenu",
  data() {
    return {
      selectFileLight: null,
      selectFileDark: null,
    };
  },
  methods: {
    setPrimaryColor() {
      this.$root.saveProfile();
    },
    resetPrimary() {
      this.$root.profile.primaryColor = this.$root.profile.defaultPrimaryColor;
      this.setPrimaryColor();
    },
    async setBackgroundImg(mode) {
      const file =
        mode === "light" ? this.selectFileLight : this.selectFileDark;
      if (!file) return;
      const processedImage = await this.compressingPic(
        window.resolveFileToBase64(file.path)
      );

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
    toggleGlassEffect(val) {
      this.$root.profile.glassEffect = val;
      this.$root.saveProfile();
    },
    async compressingPic(img) {
      let compressedImage = await pictureCompress({
        img: img,
        width: 1280,
        height: 720,
        type: "jpg",
        quality: 0.8,
      });
      return compressedImage.img;
    },
  },
};
</script>

<style scoped>
.glass-effect-knob {
  cursor: pointer;
  transition: transform 0.3s;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.glass-effect-knob:hover {
  transform: scale(1.1);
}
</style>
