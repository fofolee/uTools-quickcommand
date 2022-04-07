<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h5" align="center" v-text="title"></div>
      </q-card-section>
      <q-card-section class="q-gutter-lg">
        <div v-for="(label, index) in labels" :key="index">
          <q-btn
            class="full-width"
            color="primary"
            :label="label"
            @click="onOKClick(label, index)"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      results: this.values,
    };
  },
  props: {
    labels: Array,
    title: String,
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

    onOKClick(label, index) {
      this.$emit("ok", { id: index, text: label });
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },
  },
};
</script>
