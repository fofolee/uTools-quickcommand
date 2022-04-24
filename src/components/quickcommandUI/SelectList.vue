<template>
  <q-card @keydown="keyEvent">
    <q-virtual-scroll
      ref="scrollBar"
      :style="{ maxHeight: listMaxHeight + 'px', height: '100vh' }"
      :virtual-scroll-slice-size="lazyItemSize"
      :virtual-scroll-item-size="itemHeight"
      @virtual-scroll="scrollEvent"
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
          }"
        >
          <q-item-section v-if="isText">
            <q-item-label lines="1">{{ item }}</q-item-label>
          </q-item-section>
          <q-item-section v-else-if="isJson" class="content-start q-gutter-md">
            <q-avatar size="40px" v-if="item.icon">
              <q-img :src="item.icon" />
            </q-avatar>
            <q-item-label lines="1">{{ item.title }}</q-item-label>
            <q-item-label lines="1" caption>{{
              item.description
            }}</q-item-label>
          </q-item-section>
          <q-item-section v-else-if="isHtml">
            <div v-html="item"></div>
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
    <q-btn
      v-if="options.showCancelButton"
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
      searchWords: "",
    };
  },
  mounted() {
    this.options.options.enableSearch && this.setSubInput();
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

    keyEvent(e) {
      e.preventDefault();
      switch (e.keyCode) {
        case 38:
          this.currentIndex = Math.max(0, this.currentIndex - 1);
          break;
        case 40:
          this.currentIndex = Math.min(
            this.matchedItemsSize - 1,
            this.currentIndex + 1
          );
          break;
        case 13:
          this.clickOK();
          return;
      }
      this.$refs.scrollBar.scrollTo(this.currentIndex);
    },

    scrollEvent(e) {
      //e.index为当前列表第一个可见项的索引
      this.currentIndex =
        // increase代表向下滚动
        e.direction === "increase"
          ? Math.max(
              //当滚动到底时，e.index会突然变成列表最后一个选项的索引
              Math.min(this.matchedItems.length - 10, e.index),
              this.currentIndex
            )
          : Math.min(e.index + 9, this.currentIndex);
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
      this.setUtoolsHeight(this.listMaxHeight);
    },
  },
};
</script>

<style scoped>
.q-card--dark {
  background: var(--q-dark-page);
}
</style>
