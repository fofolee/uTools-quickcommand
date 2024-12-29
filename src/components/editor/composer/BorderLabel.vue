<template>
  <div class="border-label" :data-label="label">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "BorderLabel",
  props: {
    label: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped>
.border-label {
  width: 100%;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 6px;
  padding: 8px;
  position: relative;
  margin-top: 8px;
}

.border-label::before {
  content: attr(data-label);
  position: absolute;
  top: -9px;
  left: 16px;
  background: #fff;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  line-height: 16px;
  padding: 0 8px;
  z-index: 1;
}

.border-label::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: inherit;
}

.body--dark .border-label {
  --border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .border-label::before {
  background: #303133;
  color: rgba(255, 255, 255, 0.7);
}
</style>
