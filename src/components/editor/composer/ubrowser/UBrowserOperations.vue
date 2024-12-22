<template>
  <div class="row q-col-gutter-sm">
    <div class="col-12">
      <q-list separator class="operation-list">
        <div
          v-for="(action, index) in selectedActions"
          :key="action.value"
          class="operation-item"
        >
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon
                :name="getActionIcon(action.value)"
                size="xs"
                class="q-mx-sm"
                color="primary"
              />
              <div class="text-subtitle1">{{ action.label }}</div>
              <div class="row items-center q-ml-md">
                <q-btn
                  flat
                  round
                  dense
                  icon="north"
                  :disable="index === 0"
                  @click="moveAction(index, -1)"
                  size="xs"
                  class="q-mb-xs move-btn"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="south"
                  :disable="index === selectedActions.length - 1"
                  @click="moveAction(index, 1)"
                  size="xs"
                  class="move-btn"
                />
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="$emit('remove-action', action)"
              class="delete-btn"
            />
          </div>
          <div v-if="getOperationConfig(action.value)">
            <UBrowserOperation
              :configs="configs"
              :action="action.value"
              :fields="getOperationConfig(action.value)"
              @update:configs="$emit('update:configs', $event)"
            />
          </div>
        </div>
      </q-list>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import UBrowserOperation from "./operations/UBrowserOperation.vue";

export default defineComponent({
  name: "UBrowserOperations",
  components: {
    UBrowserOperation,
  },
  props: {
    configs: {
      type: Object,
      required: true,
    },
    selectedActions: {
      type: Array,
      required: true,
    },
  },
  emits: ["remove-action", "update:selectedActions"],
  methods: {
    moveAction(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.selectedActions.length) {
        const actions = [...this.selectedActions];
        const temp = actions[index];
        actions[index] = actions[newIndex];
        actions[newIndex] = temp;
        this.$emit("update:selectedActions", actions);
      }
    },
    getActionIcon(action) {
      const iconMap = {
        wait: "timer",
        click: "mouse",
        css: "style",
        press: "keyboard",
        paste: "content_paste",
        screenshot: "photo_camera",
        pdf: "picture_as_pdf",
        device: "devices",
        cookies: "cookie",
        evaluate: "code",
        when: "rule",
        mousedown: "mouse",
        mouseup: "mouse",
        file: "upload_file",
        value: "edit",
        check: "check_box",
        focus: "center_focus_strong",
        scroll: "swap_vert",
        download: "download",
        hide: "visibility_off",
        show: "visibility",
        devTools: "developer_board",
      };
      return iconMap[action] || "touch_app";
    },
    getOperationConfig(action) {
      const configs = {
        wait: [
          {
            key: "value",
            label: "等待时间(ms)或CSS选择器",
            icon: "timer",
            type: "input",
          },
          {
            key: "timeout",
            label: "超时时间(ms)",
            icon: "timer_off",
            type: "input",
            inputType: "number",
          },
        ],
        click: [
          {
            key: "selector",
            label: "点击元素的CSS选择器",
            icon: "mouse",
            type: "input",
          },
        ],
        css: [
          {
            key: "value",
            label: "注入的CSS样式",
            icon: "style",
            type: "textarea",
          },
        ],
        press: [
          { key: "key", label: "按键", icon: "keyboard", type: "input" },
          {
            key: "modifiers",
            type: "checkbox-group",
            options: [
              { label: "Ctrl", value: "ctrl" },
              { label: "Shift", value: "shift" },
              { label: "Alt", value: "alt" },
              { label: "Meta", value: "meta" },
            ],
          },
        ],
        paste: [
          {
            key: "text",
            label: "粘贴内容",
            icon: "content_paste",
            type: "input",
          },
        ],
        viewport: [
          {
            key: "width",
            label: "视窗宽度",
            icon: "width",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "height",
            label: "视窗高度",
            icon: "height",
            type: "input",
            inputType: "number",
            width: 6,
          },
        ],
        screenshot: [
          { key: "selector", label: "元素选择器", icon: "crop", type: "input" },
          {
            key: "rect.x",
            label: "X坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "rect.y",
            label: "Y坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "rect.width",
            label: "宽度",
            icon: "width",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "rect.height",
            label: "高度",
            icon: "height",
            type: "input",
            inputType: "number",
            width: 6,
          },
          { key: "savePath", label: "保存路径", icon: "save", type: "input" },
        ],
        pdf: [
          {
            key: "options.marginsType",
            label: "边距类型",
            type: "select",
            options: [
              { label: "默认边距", value: 0 },
              { label: "无边距", value: 1 },
              { label: "最小边距", value: 2 },
            ],
          },
          {
            key: "options.pageSize",
            label: "页面大小",
            type: "select",
            options: ["A3", "A4", "A5", "Legal", "Letter", "Tabloid"],
          },
          { key: "savePath", label: "保存路径", icon: "save", type: "input" },
        ],
        device: [
          {
            key: "size.width",
            label: "设备宽度",
            icon: "width",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "size.height",
            label: "设备高度",
            icon: "height",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "useragent",
            label: "设备User-Agent",
            icon: "phone_android",
            type: "input",
          },
        ],
        cookies: [
          { key: "name", label: "Cookie名称", icon: "cookie", type: "input" },
        ],
        setCookies: [
          { key: "items", label: "Cookie列表", type: "cookie-list" },
        ],
        removeCookies: [
          { key: "name", label: "Cookie名称", icon: "cookie", type: "input" },
        ],
        clearCookies: [
          { key: "url", label: "URL(可选)", icon: "link", type: "input" },
        ],
        evaluate: [
          {
            key: "function",
            label: "JavaScript代码",
            icon: "code",
            type: "textarea",
          },
          { key: "params", label: "参数列表", type: "param-list" },
        ],
        when: [
          {
            key: "condition",
            label: "条件(JavaScript表达式或选择器)",
            icon: "rule",
            type: "textarea",
          },
        ],
        mousedown: [
          {
            key: "selector",
            label: "按下元素选择器",
            icon: "mouse",
            type: "input",
          },
        ],
        mouseup: [
          {
            key: "selector",
            label: "释放元素选择器",
            icon: "mouse",
            type: "input",
          },
        ],
        file: [
          {
            key: "selector",
            label: "文件输入框选择器",
            icon: "upload_file",
            type: "input",
          },
          { key: "files", label: "文件列表", type: "file-list" },
        ],
        value: [
          {
            key: "selector",
            label: "元素选择器",
            icon: "input",
            type: "input",
          },
          { key: "value", label: "设置的值", icon: "edit", type: "input" },
        ],
        check: [
          {
            key: "selector",
            label: "复选框/选框选择器",
            icon: "check_box",
            type: "input",
          },
          { key: "checked", label: "选中状态", type: "checkbox" },
        ],
        focus: [
          {
            key: "selector",
            label: "元素选择器",
            icon: "center_focus_strong",
            type: "input",
          },
        ],
        scroll: [
          {
            key: "target",
            label: "目标元素选择器(可选)",
            icon: "swap_vert",
            type: "input",
          },
          {
            key: "x",
            label: "X坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
          },
          {
            key: "y",
            label: "Y坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
          },
        ],
        download: [
          { key: "url", label: "下载URL", icon: "link", type: "input" },
          { key: "savePath", label: "保存路径", icon: "save", type: "input" },
        ],
      };
      return configs[action];
    },
  },
});
</script>

<style scoped>
.operation-list {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.operation-list :deep(.q-field) div,
.operation-list :deep(div.q-checkbox__label) {
  font-size: 12px !important;
}

.operation-item {
  transition: all 0.3s;
  border-radius: 4px;
  margin: 0;
  padding: 2px 4px;
  border-color: rgba(0, 0, 0, 0.15);
}

.operation-item:hover {
  background: rgba(0, 0, 0, 0.25);
}

.body--dark .operation-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.15);
}

.body--dark .operation-item:hover {
  background: rgba(0, 0, 0, 0.25);
}

.move-btn {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.operation-item:hover .move-btn {
  opacity: 1;
}

.delete-btn {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.operation-item:hover .delete-btn {
  opacity: 1;
}

.text-subtitle2 {
  font-size: 0.9rem;
  font-weight: 500;
}

.q-item-section {
  transition: all 0.3s;
}

.operation-item:hover .q-item-section {
  opacity: 1;
}
</style>
