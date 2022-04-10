<template>
  <q-dialog
    @keydown="keyEvent"
    maximized
    ref="dialog"
    transition-show="fade"
    @hide="onDialogHide"
  >
    <q-scroll-area
      ref="scrollbar"
      :thumb-style="{
        width: '7px',
      }"
    >
      <q-card>
        <q-virtual-scroll
          virtual-scroll-slice-size="50"
          virtual-scroll-item-size="50"
          @virtual-scroll="scrollEvent"
          :items="items"
        >
          <template v-slot="{ item, index }">
            <q-item
              :key="index"
              ref="qitems"
              clickable
              v-ripple
              @mousemove="currentIndex = index"
              manual-focus
              :focused="index === currentIndex"
              :active="index === currentIndex"
              :style="{
                height: itemHeight + 'px',
              }"
            >
              <q-item-section>
                <q-item-section>{{ item }}</q-item-section>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-card>
    </q-scroll-area>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      result: this.items[0],
      currentIndex: 0,
      itemHeight: 50,
    };
  },
  mounted() {
    window.SelectList = this;
  },
  computed: {
    maxIndex() {
      return this.items.length - 1;
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
      this.$emit("ok", this.result);
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },

    keyEvent(e) {
      e.preventDefault();
      switch (e.keyCode) {
        case 38:
          this.currentIndex = Math.max(0, this.currentIndex - 1);
          break;
        case 40:
          this.currentIndex = Math.min(this.maxIndex, this.currentIndex + 1);
          break;
      }
      //   this.$refs.qitems[this.currentIndex].$el.scrollIntoViewIfNeeded(false);
    },
    scrollEvent(e) {
      console.log(e);
    },
  },
};
</script>
