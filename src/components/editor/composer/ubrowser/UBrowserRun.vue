<template>
  <div class="row q-col-gutter-sm">
    <!-- 窗口显示控制 -->
    <div class="col-12">
      <div class="row items-center q-gutter-x-md">
        <q-checkbox
          :model-value="localConfigs.run.show"
          label="显示窗口"
          @update:model-value="updateConfig('show', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.center"
          label="居中显示"
          @update:model-value="updateConfig('center', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.alwaysOnTop"
          label="总在最前"
          @update:model-value="updateConfig('alwaysOnTop', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.fullscreen"
          label="全屏显示"
          @update:model-value="updateConfig('fullscreen', $event)"
        />
      </div>
    </div>

    <!-- 窗口尺寸和位置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.width"
            type="number"
            label="窗口宽度"
            dense
            outlined
            @update:model-value="updateConfig('width', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.height"
            type="number"
            label="窗口高度"
            dense
            outlined
            @update:model-value="updateConfig('height', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.x"
            type="number"
            label="X坐标"
            dense
            outlined
            @update:model-value="updateConfig('x', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.y"
            type="number"
            label="Y坐标"
            dense
            outlined
            @update:model-value="updateConfig('y', $event)"
          />
        </div>
      </div>
    </div>

    <!-- 最大最小尺寸 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.minWidth"
            type="number"
            label="最小宽度"
            dense
            outlined
            @update:model-value="updateConfig('minWidth', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.minHeight"
            type="number"
            label="最小高度"
            dense
            outlined
            @update:model-value="updateConfig('minHeight', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.maxWidth"
            type="number"
            label="最大宽度"
            dense
            outlined
            @update:model-value="updateConfig('maxWidth', $event)"
          />
        </div>
        <div class="col-3">
          <q-input
            v-model.number="localConfigs.run.maxHeight"
            type="number"
            label="最大高度"
            dense
            outlined
            @update:model-value="updateConfig('maxHeight', $event)"
          />
        </div>
      </div>
    </div>

    <!-- 窗口行为控制 -->
    <div class="col-12">
      <div class="row items-center q-gutter-x-md">
        <q-checkbox
          :model-value="localConfigs.run.resizable"
          label="可调整大小"
          @update:model-value="updateConfig('resizable', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.movable"
          label="可移动"
          @update:model-value="updateConfig('movable', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.minimizable"
          label="可最小化"
          @update:model-value="updateConfig('minimizable', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.maximizable"
          label="可最大化"
          @update:model-value="updateConfig('maximizable', $event)"
        />
      </div>
    </div>

    <!-- 特殊功能控制 -->
    <div class="col-12">
      <div class="row items-center q-gutter-x-md">
        <q-checkbox
          :model-value="localConfigs.run.enableLargerThanScreen"
          label="允许超出屏幕"
          @update:model-value="updateConfig('enableLargerThanScreen', $event)"
        />
        <q-checkbox
          :model-value="localConfigs.run.fullscreenable"
          label="允许全屏"
          @update:model-value="updateConfig('fullscreenable', $event)"
        />
      </div>
    </div>

    <!-- 透明度控制 -->
    <div class="col-12">
      <div class="row items-center">
        <div class="q-mr-md">透明度</div>
        <q-slider
          class="col"
          v-model="localConfigs.run.opacity"
          :min="0"
          :max="1"
          :step="0.1"
          label
          label-always
          color="primary"
          @update:model-value="updateConfig('opacity', $event)"
        >
          <template v-slot:thumb-label>
            {{ localConfigs.run.opacity.toFixed(1) }}
          </template>
        </q-slider>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserRun",
  props: {
    configs: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:configs"],
  data() {
    return {
      localConfigs: _.cloneDeep(this.configs),
    };
  },
  methods: {
    updateConfig(key, value) {
      this.localConfigs.run[key] = value;
      this.$emit("update:configs", _.cloneDeep(this.localConfigs));
    },
  },
  watch: {
    configs: {
      deep: true,
      handler(newConfigs) {
        this.localConfigs = _.cloneDeep(newConfigs);
      },
    },
  },
});
</script>
