<template>
  <div class="empty-flow">
    <div class="text-center text-grey-6">
      <q-icon name="drag_indicator" size="32px" />
      <div class="text-body2 q-mt-sm">从左侧拖拽命令到这里开始编排</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EmptyFlow",
});
</script>

<style scoped>
.empty-flow {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  margin: 8px 0;
  transition: all 0.3s ease;
  flex: 1;
}

.body--dark .empty-flow {
  border: 2px dashed #676666;
}

.empty-flow:hover {
  border-color: #bdbdbd;
  background-color: #fafafa;
}

.body--dark .empty-flow:hover {
  border-color: #676666;
  background-color: #303132;
}
</style>
