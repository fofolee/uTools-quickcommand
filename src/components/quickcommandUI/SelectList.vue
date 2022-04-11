<template>
  <q-dialog
    @keydown="keyEvent"
    maximized
    ref="dialog"
    transition-show="fade"
    transition-hide="fade"
    @hide="onDialogHide"
  >
    <q-card>
      <q-virtual-scroll
        ref="scrollBar"
        :style="{ maxHeight: listMaxHeight + 'px' }"
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
            @click="onOKClick"
            manual-focus
            :focused="index === currentIndex"
            :active="index === currentIndex"
            :style="{
              height: itemHeight + 'px',
            }"
          >
            <q-item-section v-if="isText">{{ item }}</q-item-section>
            <q-item-section v-else-if="isJson">
              <q-avatar v-if="item.icon">
                <q-icon :name="item.icon" />
              </q-avatar>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption>{{ item.description }}</q-item-label>
            </q-item-section>
            <q-item-section v-else-if="isHtml">
              <div v-html="item"></div>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
      <q-btn
        class="absolute-bottom-right q-ma-md"
        round
        color="primary"
        icon="close"
        @click="onCancelClick"
      />
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      listMaxHeight: 500,
      currentIndex: 0,
      itemHeight: 50,
      lazyItemSize: 50,
      searchWords: "",
    };
  },
  mounted() {
    window.SelectList = this;
    this.setSubInput();
    this.setUtoolsHeight(this.itemHeight * this.itemSize);
  },
  computed: {
    itemSize() {
      return this.items.length;
    },
    matchedItems() {
      if (!this.searchWords) return this.items;
      let matchedItems = this.items.filter((x) => {
        if (typeof x === "string") {
          return x.toLowerCase().includes(this.searchWords.toLowerCase());
        }
        return (
          x.title.toLowerCase().includes(this.searchWords.toLowerCase()) ||
          x.description.toLowerCase().includes(this.searchWords.toLowerCase())
        );
      });
      this.setUtoolsHeight(this.itemHeight * matchedItems.length);
      return matchedItems;
    },
    isJson() {
      return this.options.optionType === "json";
    },
    isHtml() {
      return this.options.optionType === "html";
    },
    isText() {
      return this.options.optionType === "plaintext";
    },
  },
  props: {
    options: Object,
    items: Array,
  },
  emits: ["ok", "hide"],
  methods: {
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit("hide");
    },

    onOKClick() {
      utools.removeSubInput();
      let selected =
        this.options.optionType === "json"
          ? this.matchedItems[this.currentIndex]
          : {
              id: this.currentIndex,
              text: this.matchedItems[this.currentIndex],
            };
      this.$emit("ok", selected);
      this.hide();
    },

    onCancelClick() {
      utools.removeSubInput();
      this.hide();
    },

    keyEvent(e) {
      e.preventDefault();
      switch (e.keyCode) {
        case 38:
          this.currentIndex = Math.max(0, this.currentIndex - 1);
          break;
        case 40:
          this.currentIndex = Math.min(
            this.itemSize - 1,
            this.currentIndex + 1
          );
          break;
        case 13:
          this.onOKClick();
          return;
      }
      this.$refs.scrollBar.scrollTo(this.currentIndex);
    },

    scrollEvent(e) {
      this.currentIndex =
        e.direction === "increase"
          ? Math.max(e.index, this.currentIndex)
          : Math.min(e.index + 9, this.currentIndex);
    },

    setSubInput() {
      utools.setSubInput(({ text }) => {
        this.searchWords = text;
      }, this.options.placeholder);
    },

    setUtoolsHeight(height) {
      utools.setExpendHeight(Math.min(height, this.listMaxHeight));
    },
  },
};
</script>
