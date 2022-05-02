<template>
  <q-card>
    <q-virtual-scroll
      ref="scrollBar"
      :style="{ maxHeight: listMaxHeight + 'px', height: '100vh' }"
      :virtual-scroll-slice-size="lazyItemSize"
      :virtual-scroll-item-size="itemHeight"
      :items="matchedItems"
    >
      <template v-slot="{ item, index }">
        <q-item
          :key="index"
          clickable
          v-ripple
          @mousemove="currentIndex = index"
          @click="clickOK"
          manual-focus
          :focused="index === currentIndex"
          :active="index === currentIndex"
          :style="{
            height: itemHeight + 'px',
            paddingRight: shortCurtWidth + 'px',
          }"
        >
          <q-item-section v-if="isText">
            <q-item-label lines="1">{{ item }}</q-item-label>
          </q-item-section>
          <q-item-section v-else-if="isJson" class="content-start">
            <q-avatar size="34px" style="margin-right: 16px" v-if="item.icon">
              <q-img :src="item.icon" />
            </q-avatar>
            <q-item-label lines="1" style="padding-right: 50px">{{
              item.title
            }}</q-item-label>
            <q-item-label lines="1" style="padding-right: 50px" caption>{{
              item.description
            }}</q-item-label>
          </q-item-section>
          <q-item-section v-else-if="isHtml">
            <div v-html="item"></div>
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
    <div
      :style="{ top: 0, bottom: 0, width: shortCurtWidth + 'px' }"
      class="fixed-right"
    >
      <div
        :style="{ height: itemHeight + 'px' }"
        class="flex content-center justify-start q-pa-xs"
        v-for="count in 10"
        :key="count"
      >
        {{ $q.platform.is.mac ? "⌘" : "Alt" }}+{{ count % 10 }}
      </div>
    </div>
    <q-btn
      v-if="options.options.showCancelButton"
      class="absolute-bottom-right q-ma-xs"
      round
      color="primary"
      icon="close"
      @click="hide"
    />
  </q-card>
</template>

<script>
import pinyinMatch from "pinyin-match";

export default {
  data() {
    return {
      items: this.options.initItems,
      listMaxHeight: 500,
      currentIndex: 0,
      itemHeight: 50,
      lazyItemSize: 50,
      shortCurtWidth: 50,
      searchWords: "",
      lastTimeStamp: null,
    };
  },
  mounted() {
    window.aa = this;
    this.options.options.enableSearch && this.setSubInput();
    this.addListeners();
    this.setUtoolsHeight(this.itemHeight * this.matchedItemsSize);
  },
  unmounted() {
    this.clear();
  },
  computed: {
    matchedItems() {
      let matchedItems = this.searchWords
        ? this.items.filter((x) =>
            pinyinMatch.match(x.title ? x.title : x, this.searchWords)
          )
        : this.items;
      this.setUtoolsHeight(this.itemHeight * matchedItems.length);
      return matchedItems;
    },
    matchedItemsSize() {
      return this.matchedItems.length;
    },
    isJson() {
      return this.options.options.optionType === "json";
    },
    isHtml() {
      return this.options.options.optionType === "html";
    },
    isText() {
      return this.options.options.optionType === "plaintext";
    },
  },
  props: {
    options: Object,
  },
  methods: {
    hide() {
      this.clear();
      this.$emit("hide");
    },

    clickOK() {
      let selected = this.isJson
        ? this.matchedItems[this.currentIndex]
        : {
            id: this.currentIndex,
            text: this.matchedItems[this.currentIndex],
          };
      this.$emit("clickOK", selected);
      this.options.options.closeOnSelect && this.hide();
    },

    changeItemIndex(e) {
      e.preventDefault();
      if (e.keyCode === 13) return this.clickOK();
      if (e.keyCode && e.keyCode !== 38 && e.keyCode !== 40) return;
      if (e.timeStamp - this.lastTimeStamp < 50) return;
      let value = e.deltaY ? e.deltaY : e.keyCode - 39;
      switch (value > 0) {
        case false:
          this.currentIndex = Math.max(0, this.currentIndex - 1);
          break;
        case true:
          this.currentIndex = Math.min(
            this.matchedItemsSize - 1,
            this.currentIndex + 1
          );
          break;
      }
      this.$refs.scrollBar.scrollTo(this.currentIndex);
      this.lastTimeStamp = e.timeStamp;
    },

    shuortCurtHandle(e) {
      e.preventDefault();
      if (!(this.$q.platform.is.mac ? e.metaKey : e.altKey) || isNaN(e.key))
        return;
      let index = parseInt(e.key);
      this.currentIndex =
        Math.ceil(this.$refs.scrollBar.$el.scrollTop / 50) +
        (index === 0 ? 10 : index) -
        1;
      this.clickOK();
    },

    setSubInput() {
      utools.setSubInput(({ text }) => {
        this.searchWords = text;
      }, this.options.options.placeholder);
    },

    setUtoolsHeight(height) {
      utools.setExpendHeight(Math.min(height, this.listMaxHeight));
    },

    clear() {
      utools.removeSubInput();
      document.removeEventListener("keydown", this.changeItemIndex);
      document.removeEventListener("keydown", this.shuortCurtHandle);
      document.removeEventListener("mousewheel", this.changeItemIndex, {
        passive: false,
      });
      this.setUtoolsHeight(this.listMaxHeight);
    },

    addListeners() {
      document.addEventListener("keydown", this.changeItemIndex);
      document.addEventListener("keydown", this.shuortCurtHandle);
      document.addEventListener("mousewheel", this.changeItemIndex, {
        passive: false,
      });
    },
  },
};
</script>

<style scoped>
.q-card--dark {
  background: var(--q-dark-page);
}
</style>
