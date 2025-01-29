<template>
  <div class="ubrowser-run">
    <div class="row q-col-gutter-sm">
      <!-- 窗口显示控制 -->
      <div class="col-12">
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="fields.show" label="显示窗口" />
          <q-checkbox v-model="fields.center" label="居中显示" />
          <q-checkbox v-model="fields.alwaysOnTop" label="总在最前" />
          <q-checkbox v-model="fields.fullscreen" label="全屏显示" />
          <q-checkbox v-model="fields.fullscreenable" label="允许全屏" />
        </div>
      </div>

      <!-- 窗口尺寸和位置 -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-3">
            <NumberInput v-model="fields.width" label="窗口宽度" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.height" label="窗口高度" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.x" label="X坐标" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.y" label="Y坐标" />
          </div>
        </div>
      </div>

      <!-- 最大最小尺寸 -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-3">
            <NumberInput v-model="fields.minWidth" label="最小宽度" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.minHeight" label="最小高度" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.maxWidth" label="最大宽度" />
          </div>
          <div class="col-3">
            <NumberInput v-model="fields.maxHeight" label="最大高度" />
          </div>
        </div>
      </div>

      <!-- 窗口行为控制 -->
      <div class="col-12">
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="fields.resizable" label="可调整大小" />
          <q-checkbox v-model="fields.movable" label="可移动" />
          <q-checkbox v-model="fields.minimizable" label="可最小化" />
          <q-checkbox v-model="fields.maximizable" label="可最大化" />
          <q-checkbox
            v-model="fields.enableLargerThanScreen"
            label="允许超出屏幕"
          />
        </div>
      </div>

      <!-- 透明度控制 -->
      <div class="col-12">
        <div class="row items-center q-px-sm" style="height: 36px">
          <div class="q-mr-md" style="font-size: 12px">透明度</div>
          <q-slider
            v-model="fields.opacity"
            class="col"
            :min="0"
            :max="1"
            :step="0.1"
            label
            color="primary"
            dense
          >
            <template v-slot:thumb-label>
              {{ fields.opacity.toFixed(1) }}
            </template>
          </q-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NumberInput from "components/composer/common/NumberInput.vue";

const defaultValues = {
  show: true,
  center: false,
  alwaysOnTop: false,
  fullscreen: false,
  fullscreenable: true,
  width: 800,
  height: 600,
  x: undefined,
  y: undefined,
  minWidth: 0,
  minHeight: 0,
  maxWidth: undefined,
  maxHeight: undefined,
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  enableLargerThanScreen: false,
  opacity: 1,
};

export default {
  name: "UBrowserRun",
  components: {
    NumberInput,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:model-value"],
  computed: {
    fields() {
      return Object.keys(defaultValues).reduce((acc, field) => {
        Object.defineProperty(acc, field, {
          get: () => this.modelValue[field] ?? defaultValues[field],
          set: (value) => this.updateField(field, value),
        });
        return acc;
      }, {});
    },
  },
  methods: {
    updateField(field, value) {
      this.$emit("update:model-value", {
        ...this.modelValue,
        [field]: value,
      });
    },
  },
};
</script>

<style scoped>
.ubrowser-run {
  width: 100%;
}
</style>
