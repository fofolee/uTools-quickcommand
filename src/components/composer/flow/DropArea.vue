<template>
  <div class="drop-area">
    <q-icon name="add" size="32px" />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "DropArea",
});
</script>

<style scoped>
.drop-area {
  flex: 1;
  min-height: 50px;
  border-radius: 8px;
  margin: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9994;
  border: 2px dashed #9994;
}

.body--dark .drop-area {
  color: #6664;
  border: 2px dashed #6664;
}
</style>
