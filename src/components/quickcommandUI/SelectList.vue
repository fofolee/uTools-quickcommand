<template>
  <q-card class="quickcommand-ui q-dialog-plugin" @mousewheel="mouseHandler">
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
            item: true,
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
              <q-item-label
                lines="1"
                v-html="highlightText(item)"
              ></q-item-label>
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
              <q-item-label
                lines="1"
                v-html="highlightText(item.title)"
              ></q-item-label>
              <q-item-label
                lines="1"
                caption
                v-html="highlightText(item.description)"
              ></q-item-label>
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
      class="close-btn"
      round
      flat
      icon="close"
      @click="hide"
    />
  </q-card>
</template>

<script>
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
      if (!this.searchWords) return this.items;

      return this.items.filter((x) => {
        if (this.is.json) {
          const titleMatch = window.pinyinMatch.match(
            x.title,
            this.searchWords
          );
          const descMatch =
            x.description &&
            window.pinyinMatch.match(x.description, this.searchWords);
          return titleMatch || descMatch;
        } else {
          return window.pinyinMatch.match(x, this.searchWords);
        }
      });
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
      this.is.json && selected.clickFn
        ? selected.clickFn(this.matchedItems[this.currentIndex].id)
        : this.$emit("clickOK", selected);
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
        if (this.matchedItems.length < this.currentIndex + 1)
          this.currentIndex = 0;
        this.setUtoolsHeight(this.itemHeight * this.matchedItemsSize);
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

    highlightText(text) {
      if (!text || !this.searchWords) return text;

      const matchInfo = window.pinyinMatch.match(text, this.searchWords);
      if (!matchInfo) return text;

      let result = text;
      // 从后往前替换，避免位置变化
      for (let i = matchInfo.length - 2; i >= 0; i -= 2) {
        const start = matchInfo[i];
        const end = matchInfo[i + 1] + 1; // 增加1来包含最后一个字符
        const highlightedText = `<span class="select-list-highlight">${text.slice(
          start,
          end
        )}</span>`;
        result = result.slice(0, start) + highlightedText + result.slice(end);
      }
      return result;
    },
  },
};
</script>

<style scoped>
.shortcut {
  user-select: none;
  transition: 0;
}

.item {
  transform: scale(1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  height: 50px;
}

.item-selected {
  transform: scale(0.996);
  background-color: rgba(13, 110, 253, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-item .q-avatar {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-selected .q-avatar {
  transform: scale(1.01);
  filter: brightness(1.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-card--dark .item-selected {
  background: rgba(255, 255, 255, 0.15);
}

:deep(.select-list-highlight) {
  color: var(--q-primary);
  font-weight: bold;
}

.close-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.q-card--dark .close-btn {
  background: rgba(0, 0, 0, 0.2);
}

.q-card--dark .close-btn:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
