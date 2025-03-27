<template>
  <div class="image-search-editor">
    <div class="row q-col-gutter-sm">
      <!-- 图片预览区域 -->
      <div class="col-12 col-sm-8">
        <div
          class="image-preview q-pa-md"
          :class="{ 'has-image': !!argvs.imagePreview }"
          @click="triggerImageUpload"
          @paste="handlePaste"
          tabindex="0"
        >
          <template v-if="argvs.imagePreview">
            <img :src="argvs.imagePreview" class="preview-image" />
            <q-btn
              round
              flat
              dense
              icon="close"
              class="remove-image"
              @click.stop="clearImage"
            >
              <q-tooltip>移除图片</q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <div class="upload-placeholder">
              <q-icon name="add_photo_alternate" size="48px" color="grey-6" />
              <div class="text-grey-6 q-mt-sm">点击上传或粘贴图片</div>
            </div>
          </template>
        </div>
      </div>

      <!-- 配置区域 -->
      <div class="col-12 col-sm-4">
        <div class="row">
          <!-- 截图按钮 -->
          <div class="col-12">
            <q-btn
              outline
              color="primary"
              class="full-width"
              @click="getImgByCaptureScreen"
            >
              <q-icon name="crop" class="q-mr-sm" />
              截图查找
            </q-btn>
          </div>

          <!-- 匹配阈值设置 -->
          <div class="col-12">
            <NumberInput
              v-if="false"
              :model-value="argvs.threshold"
              @update:model-value="updateArgvs('threshold', $event)"
              label="匹配阈值"
              :min="0"
              :max="1"
              :step="0.1"
              class="border-primary"
              :command="{
                icon: 'tune',
              }"
            />
          </div>

          <!-- 鼠标动作选择 -->
          <div class="col-12">
            <ButtonGroup
              :is-collapse="false"
              :model-value="argvs.mouseAction"
              @update:model-value="updateArgvs('mouseAction', $event)"
              :options="mouseActionOptions"
              label="找到后"
              class="border-primary"
            >
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";

export default defineComponent({
  name: "ImageSearchEditor",
  components: {
    NumberInput,
    ButtonGroup,
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      mouseActionOptions: [
        { label: "不处理", value: "none" },
        { label: "单击", value: "click" },
        { label: "双击", value: "dblclick" },
        { label: "右击", value: "rightclick" },
      ],
      defaultArgvs: {
        imagePreview: "",
        threshold: 1,
        mouseAction: "none",
      },
    };
  },

  computed: {
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
  },

  methods: {
    // 触发文件上传
    triggerImageUpload() {
      this.$refs.fileInput.click();
    },

    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };
      this.updateModelValue(argvs);
    },

    // 处理文件上传
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.updateArgvs("imagePreview", e.target.result);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          quickcommand.showMessageBox("读取图片失败", "error");
        }
      }
    },

    // 处理粘贴事件
    async handlePaste(event) {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e) => {
            this.updateArgvs("imagePreview", e.target.result);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    },

    // 从剪贴板读取
    async getImgByCaptureScreen() {
      const img = await quickcomposer.simulate.captureScreenToClipboard({
        type: "area",
      });
      if (!img) return;
      this.updateArgvs("imagePreview", img);
    },

    // 清除图片
    clearImage() {
      this.updateArgvs("imagePreview", "");
    },

    // 更新值
    generateCode(argvs = this.argvs) {
      const imageData = argvs.imagePreview.split(",")[1] || "";
      const config = {
        imageData,
        threshold: argvs.threshold,
        mouseAction: argvs.mouseAction,
      };

      // 生成代码
      return `${this.modelValue.value}("data:image/png;base64,${config.imageData}", { threshold: ${config.threshold}, mouseAction: "${config.mouseAction}" })`;
    },

    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
  },
  mounted() {
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.image-search-editor {
  width: 100%;
}

.image-preview {
  border: 2px dashed var(--q-primary);
  border-radius: 8px;
  display: flex;
  max-height: 138px;
  min-height: 138px;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.image-preview:hover {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary), 0.03);
}

.image-preview.has-image {
  border-style: solid;
  padding: 4px;
}

.preview-image {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
}

.remove-image:hover {
  background: rgba(0, 0, 0, 0.7);
}

.upload-placeholder {
  text-align: center;
}

/* 暗色模式适配 */
:deep(.dark) .image-preview:hover {
  background: rgba(255, 255, 255, 0.05);
}

.border-primary {
  border: 1px solid var(--q-primary);
  border-radius: 4px;
}
</style>
