<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础设置 -->
    <div class="col-12">
      <q-checkbox
        :value="configs.run.show"
        @update:modelValue="updateConfig('run.show', $event)"
        label="显示窗口"
      />
    </div>

    <!-- 窗口大小 -->
    <div class="col-12">
      <div class="text-subtitle2 q-mb-sm">窗口大小</div>
      <div class="row q-col-gutter-sm">
        <UBrowserInput
          :value="configs.run.width"
          @update:modelValue="updateConfig('run.width', $event)"
          type="number"
          label="宽度"
          :width="6"
          icon="width"
        />
        <UBrowserInput
          :value="configs.run.height"
          @update:modelValue="updateConfig('run.height', $event)"
          type="number"
          label="高度"
          :width="6"
          icon="height"
        />
      </div>
    </div>

    <!-- 窗口位置 -->
    <div class="col-12">
      <div class="text-subtitle2 q-mb-sm">窗口位置</div>
      <div class="row q-col-gutter-sm">
        <UBrowserInput
          :value="configs.run.x"
          @update:modelValue="updateConfig('run.x', $event)"
          type="number"
          label="X坐标"
          :width="6"
          icon="drag_handle"
        />
        <UBrowserInput
          :value="configs.run.y"
          @update:modelValue="updateConfig('run.y', $event)"
          type="number"
          label="Y坐标"
          :width="6"
          icon="drag_handle"
        />
      </div>
    </div>

    <!-- 窗口限制 -->
    <div class="col-12">
      <div class="text-subtitle2 q-mb-sm">窗口限制</div>
      <div class="row q-col-gutter-sm">
        <UBrowserInput
          :value="configs.run.minWidth"
          @update:modelValue="updateConfig('run.minWidth', $event)"
          type="number"
          label="最小宽度"
          :width="6"
          icon="width"
        />
        <UBrowserInput
          :value="configs.run.minHeight"
          @update:modelValue="updateConfig('run.minHeight', $event)"
          type="number"
          label="最小高度"
          :width="6"
          icon="height"
        />
        <UBrowserInput
          :value="configs.run.maxWidth"
          @update:modelValue="updateConfig('run.maxWidth', $event)"
          type="number"
          label="最大宽度"
          :width="6"
          icon="width"
        />
        <UBrowserInput
          :value="configs.run.maxHeight"
          @update:modelValue="updateConfig('run.maxHeight', $event)"
          type="number"
          label="最大高度"
          :width="6"
          icon="height"
        />
      </div>
    </div>

    <!-- 窗口行为 -->
    <div class="col-12">
      <div class="text-subtitle2 q-mb-sm">窗口行为</div>
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-checkbox
            :value="configs.run.center"
            @update:modelValue="updateConfig('run.center', $event)"
            label="居中显示"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.resizable"
            @update:modelValue="updateConfig('run.resizable', $event)"
            label="允许调整大小"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.movable"
            @update:modelValue="updateConfig('run.movable', $event)"
            label="允许移动"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.minimizable"
            @update:modelValue="updateConfig('run.minimizable', $event)"
            label="允许最小化"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.maximizable"
            @update:modelValue="updateConfig('run.maximizable', $event)"
            label="允许最大化"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.alwaysOnTop"
            @update:modelValue="updateConfig('run.alwaysOnTop', $event)"
            label="总是置顶"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.fullscreen"
            @update:modelValue="updateConfig('run.fullscreen', $event)"
            label="全屏显示"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.fullscreenable"
            @update:modelValue="updateConfig('run.fullscreenable', $event)"
            label="允许全屏"
          />
        </div>
        <div class="col-12">
          <q-checkbox
            :value="configs.run.enableLargerThanScreen"
            @update:modelValue="updateConfig('run.enableLargerThanScreen', $event)"
            label="允许超出屏幕大小"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import UBrowserInput from './operations/UBrowserInput.vue';

export default defineComponent({
  name: 'UBrowserRun',
  components: {
    UBrowserInput
  },
  props: {
    configs: {
      type: Object,
      required: true
    }
  },
  emits: ['update:configs'],
  methods: {
    updateConfig(path, value) {
      const newConfigs = { ...this.configs };
      const keys = path.split('.');
      let current = newConfigs;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      this.$emit('update:configs', newConfigs);
    }
  }
});
</script>
