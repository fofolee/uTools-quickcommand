<template>
  <div class="operation-cards-container" :style="containerStyle">
    <div ref="scrollArea" class="scroll-container" @wheel.prevent="handleWheel">
      <div class="cards-wrapper">
        <div
          v-for="option in options"
          ref="operationCard"
          :key="option.value"
          :class="['operation-card', { active: modelValue === option.value }]"
          :data-value="option.value"
          :style="{
            borderRadius: square ? '5px' : '16px',
            height: height ? height : '',
          }"
          @click="$emit('update:modelValue', option.value)"
        >
          <q-icon
            :name="option.icon || 'functions'"
            size="16px"
            :color="modelValue === option.value ? 'primary' : 'grey'"
          />
          <div class="text-caption">{{ option.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: String,
      default: () => this.options[0]?.value,
    },
    minWidth: {
      type: String,
      default: "80px",
    },
    square: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
    },
  },
  computed: {
    containerStyle() {
      return {
        "--min-width": this.minWidth,
        "--total-items": this.options.length,
        "--total-gap": `${(this.options.length - 1) * 8}px`,
      };
    },
  },
  methods: {
    // 将滚轮垂直滚动转换为水平滚动
    handleWheel(e) {
      const scrollArea = this.$refs.scrollArea;
      // 同时处理水平和垂直滚动
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.8;

      if (scrollArea) {
        scrollArea.scrollLeft += delta;
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          this.$refs.operationCard
            ?.find((card) => card.dataset.value === newVal)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
        });
      },
    },
  },
};
</script>

<style scoped>
.operation-cards-container {
  position: relative;
  width: 100%;
}

.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.cards-wrapper {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(
    var(--min-width),
    calc((100% - (var(--total-gap, 0px))) / var(--total-items, 1))
  );
  gap: 8px;
  width: fit-content;
  min-width: 100%;
  padding: 1px;
}

.operation-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 8px;
  user-select: none;
}

.operation-card:hover {
  background: var(--q-primary-opacity-5);
  transform: translateY(-1px);
  border: 1px solid var(--q-primary-opacity-5);
}

.operation-card.active {
  border-color: var(--q-primary);
  background: var(--q-primary-opacity-5);
}

/* 暗色模式适配 */
.body--dark .operation-card {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .operation-card:hover {
  background: var(--q-primary-opacity-5);
}

.body--dark .operation-card.active {
  border-color: var(--q-primary-opacity-50);
  background: var(--q-primary-opacity-5);
}

.operation-card .text-caption {
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
}
</style>
