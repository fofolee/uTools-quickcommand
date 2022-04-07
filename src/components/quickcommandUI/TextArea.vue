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
          bottom: '36px',
          left: 0,
          right: 0,
          background: '#00000000',
          color: $q.dark.isActive ? 'white' : 'black',
          fontSize: '16px',
          outline: 'none',
        }"
      />
      <q-btn-group
        spread
        class="fixed-bottom"
        :style="{
          left: 0,
          right: 0,
        }"
      >
        <q-btn label="取消" color="negative" @click="onCancelClick" />
        <q-btn label="确定" color="primary" @click="onOKClick" />
      </q-btn-group>
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
