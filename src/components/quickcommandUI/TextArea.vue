<template>
  <q-card class="quickcommand-ui q-dialog-plugin">
    <textarea
      v-model="result"
      :placeholder="options.placeholder"
      autofocus
      class="fixed container"
      :style="{
        outline: 'none',
      }"
    />
    <div class="fixed-bottom-right q-gutter-xs button-container">
      <q-btn flat @click="hide" class="action-btn cancel-btn" label="取消" />
      <q-btn
        flat
        @click="clickOK"
        class="action-btn confirm-btn"
        label="确定"
      />
    </div>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      result: this.options.value,
    };
  },
  props: {
    options: Object,
  },
  methods: {
    hide() {
      this.$emit("hide");
    },
    clickOK() {
      this.$emit("clickOK", this.result);
      this.hide();
    },
  },
};
</script>

<style scoped>
textarea {
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 16px;
  padding: 16px;
  border-radius: 4px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

textarea:focus {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.05);
}

.body--dark textarea {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
  color: #fff;
}

.body--dark textarea:focus {
  background: rgba(255, 255, 255, 0.08);
}

.button-container {
  padding-bottom: 25px;
  padding-right: 30px;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 5px;
}

.action-btn:hover {
  transform: scale(1.05);
}

.confirm-btn {
  color: var(--q-primary);
}

.cancel-btn {
  color: rgba(0, 0, 0, 0.5);
}

.body--dark .cancel-btn {
  color: rgba(255, 255, 255, 0.5);
}
</style>
