<template>
  <div class="row q-col-gutter-sm">
    <div class="col-12">
      <!-- 操作选择网格 -->
      <div class="row q-col-gutter-xs">
        <div
          v-for="action in availableActions"
          :key="action.value"
          class="col-2"
        >
          <q-card
            flat
            bordered
            class="action-card cursor-pointer"
            :class="{
              'action-selected': selectedActions.some(
                (a) => a.value === action.value
              ),
            }"
            @click="toggleAction(action)"
          >
            <div class="q-pa-xs text-caption text-wrap text-center">
              {{ action.label }}
            </div>
          </q-card>
        </div>
      </div>

      <!-- 已选操作列表 -->
      <q-list separator class="operation-list q-mt-md">
        <div
          v-for="(action, index) in selectedActions"
          :key="action.id"
          class="operation-item"
        >
          <div class="row items-center justify-between">
            <q-chip
              square
              removable
              @remove="$emit('remove-action', action)"
              class="text-caption q-mx-none q-mb-sm"
            >
              <q-avatar color="primary">
                <q-icon
                  color="white"
                  :name="getActionIcon(action.value)"
                  size="14px"
                />
              </q-avatar>
              <div class="q-mx-sm">{{ action.label }}</div>
            </q-chip>
            <div class="row items-start q-gutter-xs">
              <q-btn
                round
                dense
                color="primary"
                icon="north"
                v-show="index !== 0"
                @click="moveAction(index, -1)"
                size="xs"
                class="q-mb-xs move-btn"
              />
              <q-btn
                round
                dense
                color="primary"
                icon="south"
                v-show="index !== selectedActions.length - 1"
                @click="moveAction(index, 1)"
                size="xs"
                class="move-btn"
              />
            </div>
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
import {
  ubrowserActionIcons,
  ubrowserAvailableActions,
} from "../composerConfig";
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
  emits: ["remove-action", "update:selectedActions", "update:configs"],
  computed: {
    availableActions() {
      return ubrowserAvailableActions;
    },
  },
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
      return ubrowserActionIcons[action] || "touch_app";
    },
    getOperationConfig(action) {
      const configs = {
        wait: [
          {
            key: "value",
            label: "等待时间(ms)或CSS选择器",
            icon: "timer",
            type: "input",
            width: 8,
          },
          {
            key: "timeout",
            label: "超时时间(ms)",
            icon: "timer_off",
            type: "input",
            inputType: "number",
            width: 4,
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
          {
            key: "key",
            label: "按键",
            icon: "keyboard",
            type: "input",
            width: 5,
          },
          {
            key: "modifiers",
            label: "修饰键",
            type: "checkbox-group",
            options: [
              { label: "Ctrl", value: "ctrl" },
              { label: "Shift", value: "shift" },
              { label: "Alt", value: "alt" },
              { label: "Meta", value: "meta" },
            ],
            defaultValue: [],
            width: 7,
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
            width: 3,
          },
          {
            key: "rect.y",
            label: "Y坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 3,
          },
          {
            key: "rect.width",
            label: "宽度",
            icon: "width",
            type: "input",
            inputType: "number",
            width: 3,
          },
          {
            key: "rect.height",
            label: "高度",
            icon: "height",
            type: "input",
            inputType: "number",
            width: 3,
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
            width: 6,
          },
          {
            key: "options.pageSize",
            label: "页面大小",
            type: "select",
            options: ["A3", "A4", "A5", "Legal", "Letter", "Tabloid"],
            width: 6,
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
          { key: "files", label: "文件列表", type: "file-list", width: 12 },
        ],
        value: [
          {
            key: "selector",
            label: "元素选择器",
            icon: "input",
            type: "input",
            width: 6,
          },
          {
            key: "value",
            label: "设置的值",
            icon: "edit",
            type: "input",
            width: 6,
          },
        ],
        check: [
          {
            key: "selector",
            label: "复选框/选框选择器",
            icon: "check_box",
            type: "input",
            width: 8,
          },
          {
            key: "checked",
            label: "选中状态",
            type: "checkbox",
            defaultValue: false,
            width: 4,
          },
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
            key: "type",
            label: "滚动类型",
            type: "button-toggle",
            options: [
              { label: "滚动到元素", value: "element" },
              { label: "滚动到坐标", value: "position" },
            ],
            defaultValue: "element",
          },
          {
            key: "selector",
            label: "目标元素选择器",
            icon: "swap_vert",
            type: "input",
            width: 12,
            showWhen: "type",
            showValue: "element",
          },
          {
            key: "x",
            label: "X坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
            showWhen: "type",
            showValue: "position",
          },
          {
            key: "y",
            label: "Y坐标",
            icon: "drag_handle",
            type: "input",
            inputType: "number",
            width: 6,
            showWhen: "type",
            showValue: "position",
          },
        ],
        download: [
          {
            key: "url",
            label: "下载URL",
            icon: "link",
            type: "input",
            width: 6,
          },
          {
            key: "savePath",
            label: "保存路径",
            icon: "save",
            type: "input",
            width: 6,
          },
        ],
        devTools: [
          {
            key: "mode",
            label: "开发工具位置",
            type: "button-toggle",
            options: [
              { label: "右侧", value: "right" },
              { label: "底部", value: "bottom" },
              { label: "独立", value: "undocked" },
              { label: "分离", value: "detach" },
            ],
            defaultValue: "right",
          },
        ],
      };
      return configs[action];
    },
    toggleAction(action) {
      const index = this.selectedActions.findIndex(
        (a) => a.value === action.value
      );
      if (index === -1) {
        // 添加操作
        this.$emit("update:selectedActions", [
          ...this.selectedActions,
          {
            ...action,
            id: Date.now(),
            argv: "",
            saveOutput: false,
            useOutput: null,
            cmd: action.value || action.cmd,
            value: action.value || action.cmd,
          },
        ]);

        // 初始化配置对象
        const config = this.getOperationConfig(action.value);
        if (config) {
          const newConfigs = { ...this.configs };
          if (!newConfigs[action.value]) {
            newConfigs[action.value] = {};
          }
          // 设置默认值
          config.forEach((field) => {
            if (field.defaultValue !== undefined) {
              newConfigs[action.value][field.key] = field.defaultValue;
            }
          });
          this.$emit("update:configs", newConfigs);
        }
      } else {
        // 移除操作
        const newActions = [...this.selectedActions];
        newActions.splice(index, 1);
        this.$emit("update:selectedActions", newActions);
      }
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
  background: rgba(0, 0, 0, 0.05);
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

.action-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* min-height: 42px; */
}

.action-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background: var(--q-primary-opacity-5);
}

.action-selected {
  border-color: var(--q-primary);
  background: var(--q-primary-opacity-10);
}

.body--dark .action-selected {
  background: var(--q-primary-opacity-40);
}

.body--dark .action-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .action-card:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  background: var(--q-primary-opacity-20);
}

.text-caption {
  font-size: 11px;
  line-height: 1.1;
}

.q-card__section {
  padding: 4px !important;
}

.row.q-col-gutter-xs {
  margin: -2px;
}

.row.q-col-gutter-xs > * {
  padding: 2px;
}
</style>
