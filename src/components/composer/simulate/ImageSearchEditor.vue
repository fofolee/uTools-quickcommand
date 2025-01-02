<template>
  <div class="image-search-editor">
    <div class="row q-col-gutter-sm">
      <!-- 图片预览区域 -->
      <div class="col-12 col-sm-8">
        <div
          class="image-preview q-pa-md"
          :class="{ 'has-image': !!imagePreview }"
          @click="triggerImageUpload"
          @paste="handlePaste"
          tabindex="0"
        >
          <template v-if="imagePreview">
            <img :src="imagePreview" class="preview-image" />
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
              <div class="text-grey-6 q-mt-sm">
                点击上传或粘贴图片<br />支持从剪贴板读取
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 配置区域 -->
      <div class="col-12 col-sm-4">
        <div class="row q-col-gutter-sm">
          <!-- 从剪贴板读取按钮 -->
          <div class="col-12">
            <q-btn
              outline
              color="primary"
              class="full-width"
              @click="pasteFromClipboard"
            >
              <q-icon name="content_paste" class="q-mr-sm" />
              从剪贴板读取
            </q-btn>
          </div>

          <!-- 匹配阈值设置 -->
          <div class="col-12">
            <VariableInput
              v-model="threshold"
              label="匹配阈值"
              class="border-primary"
              :command="{
                inputType: 'number',
                icon: 'tune',
              }"
            />
          </div>

          <!-- 鼠标动作选择 -->
          <div class="col-12">
            <q-select
              v-model="mouseAction"
              :options="mouseActionOptions"
              label="找到后"
              class="border-primary"
              dense
              filled
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="mouse" />
              </template>
            </q-select>
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
import VariableInput from "../ui/VariableInput.vue";

export default defineComponent({
  name: "ImageSearchEditor",
  components: {
    VariableInput,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      imagePreview: "",
      threshold: 0.9,
      mouseAction: "none",
      mouseActionOptions: [
        { label: "不处理", value: "none" },
        { label: "单击", value: "click" },
        { label: "双击", value: "dblclick" },
        { label: "右击", value: "rightclick" },
      ],
    };
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          // 如果是空字符串，初始化为默认值
          this.imagePreview = "";
          this.threshold = 0.9;
          this.mouseAction = "none";
          this.updateValue();
          return;
        }

        // 从代码字符串解析配置
        try {
          const imageDataMatch = val.match(/"data:image\/png;base64,([^"]+)"/);
          const thresholdMatch = val.match(/threshold:\s*([\d.]+)/);
          const mouseActionMatch = val.match(/mouseAction:\s*"([^"]+)"/);

          if (imageDataMatch) {
            this.imagePreview = `data:image/png;base64,${imageDataMatch[1]}`;
          }
          if (thresholdMatch) {
            this.threshold = parseFloat(thresholdMatch[1]);
          }
          if (mouseActionMatch) {
            this.mouseAction = mouseActionMatch[1];
          }
        } catch (e) {
          console.warn("Failed to parse config from code string");
        }
      },
    },
    threshold(val) {
      this.updateValue();
    },
    mouseAction(val) {
      this.updateValue();
    },
  },

  methods: {
    // 触发文件上传
    triggerImageUpload() {
      this.$refs.fileInput.click();
    },

    // 处理文件上传
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreview = e.target.result;
            this.updateValue();
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
            this.imagePreview = e.target.result;
            this.updateValue();
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    },

    // 从剪贴板读取
    async pasteFromClipboard() {
      const clipboardImage = quickcommand.readClipboardImage();
      if (!clipboardImage)
        return quickcommand.showMessageBox("剪贴板中没有图片", "warning");
      this.imagePreview = clipboardImage;
      this.updateValue();
    },

    // 清除图片
    clearImage() {
      this.imagePreview = "";
      this.updateValue();
    },

    // 更新值
    updateValue() {
      const imageData = this.imagePreview.split(",")[1] || "";
      const config = {
        imageData,
        threshold: this.threshold,
        mouseAction: this.mouseAction,
      };

      // 生成代码
      const code = `quickcomposer.simulate.findImage("data:image/png;base64,${config.imageData}", { threshold: ${config.threshold}, mouseAction: "${config.mouseAction}" })`;
      this.$emit("update:modelValue", code);
    },
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
  max-height: 128px;
  min-height: 128px;
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
