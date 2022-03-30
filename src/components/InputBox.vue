<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h5" align="center" v-text="title"></div>
      </q-card-section>
      <q-card-section class="q-gutter-sm">
        <div v-for="(label, index) in labels" :key="index">
          <q-input
            outlined
            v-model="results[index]"
            :label="label"
            :hint="hints[index]"
            hide-hint
            autofocus
            @keyup.enter="onOKClick"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="确定" @click="onOKClick" />
        <q-btn color="negative" label="取消" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      results: new Array(this.labels.length),
    };
  },
  props: {
    labels: Array,
    title: String,
    hints: Array
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
      this.$emit("ok", this.results);
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },
  },
};
</script>
