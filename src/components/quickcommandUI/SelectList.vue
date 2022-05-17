<template>
  <q-card @contextmenu="mouseHandler">
    <q-virtual-scroll
      ref="scrollBar"
      @scroll="scrollHandler"
      :style="{ maxHeight: listMaxHeight + 'px', height: '100vh' }"
      :virtual-scroll-slice-size="lazyItemSize"
      :virtual-scroll-item-size="itemHeight"
      :items="matchedItems"
    >
      <template v-slot="{ item, index }">
        <div
          :key="index"
          v-ripple
          @mousemove="currentIndex = index"
          @click="clickOK"
          :class="{
            'item-selected': index === currentIndex,
          }"
          :style="{
            height: itemHeight + 'px',
            paddingRight: shortCutWidth - 16 + 'px',
            cursor: 'pointer',
          }"
        >
          <!-- 纯文本 -->
          <q-item v-if="is.text">
            <q-item-section>
              <q-item-label lines="1">{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
          <!-- json -->
          <q-item v-else-if="is.json">
            <q-item-section avatar v-if="item.icon">
              <q-avatar size="34px">
                <q-img :src="item.icon" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ item.title }}</q-item-label>
              <q-item-label lines="1" caption>{{
                item.description
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <!-- html -->
          <q-item v-else-if="is.html">
            <q-item-section>
              <div v-html="item" class="full-width"></div>
            </q-item-section>
          </q-item>
        </div>
      </template>
    </q-virtual-scroll>
    <div
      :style="{ top: 0, bottom: 0, width: shortCutWidth + 'px' }"
      class="fixed-right shortcut"
    >
      <div
        :style="{ height: itemHeight + 'px' }"
        class="flex content-center justify-start q-pa-xs"
        v-for="count in countsPerPage"
        :key="count"
      >
        {{ $q.platform.is.mac ? "⌘" : "Alt" }}+{{ count % countsPerPage }}
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
      lazyItemSize: 100,
      shortCutWidth: 50,
      searchWords: "",
      topIndex: 0,
      timeoutId: null,
    };
  },
  mounted() {
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
    countsPerPage() {
      return this.listMaxHeight / this.itemHeight;
    },
    bottomIndex() {
      return this.topIndex + this.countsPerPage - 1;
    },
    is() {
      return {
        json: this.options.options.optionType === "json",
        html: this.options.options.optionType === "html",
        text: this.options.options.optionType === "plaintext",
      };
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
      let selected = this.is.json
        ? this.matchedItems[this.currentIndex]
        : {
            id: this.currentIndex,
            text: this.matchedItems[this.currentIndex],
          };
      this.$emit("clickOK", selected);
      this.options.options.closeOnSelect && this.hide();
    },

    keyHandler(e) {
      e.preventDefault();
      if (this.$q.platform.is.mac ? e.metaKey : e.altKey && !isNaN(e.key)) {
        let index = e.key === "0" ? 10 : parseInt(e.key);
        this.currentIndex = this.topIndex + index - 1;
        return this.clickOK();
      }
      switch (e.keyCode) {
        case 38: // 上
          this.currentIndex = Math.max(0, this.currentIndex - 1);
          break;
        case 40: // 下
          this.currentIndex = Math.min(
            this.matchedItemsSize - 1,
            this.currentIndex + 1
          );
          break;
        case 13: // 回车
          return this.clickOK();
      }
      this.$nextTick(() => {
        document.querySelector(".item-selected").scrollIntoViewIfNeeded(0);
      });
    },

    scrollHandler(e) {
      this.topIndex = parseInt(e.target.scrollTop / this.itemHeight);
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        if (this.currentIndex < this.topIndex)
          this.currentIndex = this.topIndex;
        if (this.currentIndex > this.bottomIndex)
          this.currentIndex = this.bottomIndex;
        this.timeoutId = null;
      }, 200);
    },

    mouseHandler(e) {
      e.preventDefault();
      this.$refs.scrollBar.$el.scrollBy(
        0,
        (e.deltaY / this.itemHeight).toFixed() * this.itemHeight
      );
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
      document.removeEventListener("keydown", this.keyHandler, true);
      this.setUtoolsHeight(this.listMaxHeight);
    },

    addListeners() {
      // 如果之前启用了子输入框，先移除监听
      if (this.$root.subInputEvent)
        document.removeEventListener(...this.$root.subInputEvent);
      document.addEventListener("keydown", this.keyHandler, true);
    },
  },
};
</script>

<style scoped>
.q-card--dark {
  background: var(--q-dark-page);
}
.q-item,
.shortcut {
  user-select: none;
  transition: 0s;
}
.item-selected {
  background: #dfe2e6;
}
.body--dark .item-selected {
  background: #515151;
}
</style>
