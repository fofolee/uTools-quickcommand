<template>
  <div
    class="drop-area"
    @dragenter="isDragging = true"
    @dragleave="isDragging = false"
    @drop="isDragging = false"
    :class="{
      'drop-area-dragging': isDragging,
    }"
  >
    <template v-if="type === 'add'">
      <div class="add-area">
        <q-icon name="add" size="32px" />
      </div>
    </template>
    <template v-else-if="type === 'empty'">
      <div class="empty-area">
        <q-icon name="drag_indicator" size="32px" />
        <div class="text-body2">从左侧拖拽命令到这里开始编排</div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EmptyFlow",
  props: {
    type: {
      type: String,
      default: "add",
    },
  },
  data() {
    return {
      isDragging: false,
    };
  },
});
</script>

<style scoped>
.drop-area {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex: 1;
  user-select: none;
  transition: all 0.3s ease;
}

.drop-area:has(.add-area) {
  margin: 8px 0;
}

.body--dark .drop-area {
  border-color: #676666;
}

.drop-area:hover,
.drop-area-dragging {
  background-color: var(--utools-bg-color);
}

.drop-area-dragging {
  position: relative;
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-0.1deg);
  }
  75% {
    transform: rotate(0.1deg);
  }
}

.add-area,
.empty-area {
  display: flex;
  align-items: center;
  justify-content: center;
  color: grey;
}

.add-area {
  height: 30px;
}

.empty-area {
  height: 200px;
}
</style>
