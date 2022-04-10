<template>
  <q-dialog maximized ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <textarea
        v-model="result"
        :placeholder="placeholder"
        autofocus
        class="fixed"
        :style="{
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: '#00000000',
          color: $q.dark.isActive ? 'white' : 'black',
          fontSize: '16px',
          outline: 'none',
          border: '3px solid #3577cb',
          borderRadius: '5px',
        }"
      />
      <div
        class="fixed-bottom-right q-pa-md q-gutter-sm"
      >
        <q-btn round color="blue-grey" icon="arrow_back" @click="onCancelClick" />
        <q-btn round color="primary" icon="done" @click="onOKClick" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      result: this.value,
    };
  },
  props: {
    placeholder: String,
    value: String,
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
  },
};
</script>
