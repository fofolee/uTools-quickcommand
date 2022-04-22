<template>
  <q-dialog
    ref="dialog"
    seamless
    position="right"
    @hide="onDialogHide"
  >
    <q-card>
      <q-btn color="primary" :label="label" @click="onOKClick" v-close-popup />
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    label: String,
  },
  mounted(){
      console.log(this);
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
      this.$emit("ok");
    },

    onCancelClick() {
      this.hide();
    },
  },
};
</script>
