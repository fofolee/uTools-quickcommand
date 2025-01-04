<template>
  <div class="row q-col-gutter-sm items-center">
    <template v-for="field in fields" :key="field.key">
      <div
        v-if="!field.showWhen || fieldValue[field.showWhen] === field.showValue"
        :class="['col', field.width ? `col-${field.width}` : 'col-12']"
      >
        <!-- 复选框组 -->
        <template v-if="field.type === 'checkbox-group'">
          <UBrowserCheckboxGroup
            v-model="fieldValue[field.key]"
            :options="field.options"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 单个复选框 -->
        <template v-else-if="field.type === 'checkbox'">
          <UBrowserCheckbox
            v-model="fieldValue[field.key]"
            :label="field.label"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 基本输入类型的处理 -->
        <template v-if="field.type === 'varInput'">
          <!-- 设备名称特殊处理 -->
          <template v-if="field.key === 'deviceName'">
            <UBrowserDeviceName
              v-model="fieldValue[field.key]"
              :label="field.label"
              :icon="field.icon"
              @update:model-value="updateValue(field.key, $event)"
            />
          </template>
          <!-- 普通输入框 -->
          <template v-else>
            <VariableInput
              v-model="fieldValue[field.key]"
              :label="field.label"
              :command="{
                icon: field.icon,
                inputType: field.inputType,
              }"
              @update:model-value="updateValue(field.key, $event)"
            />
          </template>
        </template>

        <!-- 数字输入框 -->
        <template v-else-if="field.type === 'numInput'">
          <NumberInput
            v-model="fieldValue[field.key]"
            :label="field.label"
            :command="{ icon: field.icon }"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 文本区域 -->
        <template v-else-if="field.type === 'textarea'">
          <UBrowserTextarea
            v-model="fieldValue[field.key]"
            :label="field.label"
            :icon="field.icon"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 选择框 -->
        <template v-else-if="field.type === 'select'">
          <UBrowserSelect
            v-model="fieldValue[field.key]"
            :label="field.label"
            :icon="field.icon"
            :options="field.options"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- Cookie列表 -->
        <template v-else-if="field.type === 'cookie-list'">
          <UBrowserCookieList
            v-model="fieldValue[field.key]"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 命名参数列表 -->
        <template v-else-if="field.type === 'named-param-list'">
          <UBrowserNamedParamList
            v-model="fieldValue[field.key]"
            :label="field.label"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 文件列表 -->
        <template v-else-if="field.type === 'file-list'">
          <UBrowserFileList
            v-model="fieldValue[field.key]"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 按钮组 -->
        <template v-else-if="field.type === 'button-toggle'">
          <UBrowserButtonToggle
            v-model="fieldValue[field.key]"
            :label="field.label"
            :options="field.options"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 设备尺寸 -->
        <template v-else-if="field.type === 'device-size'">
          <UBrowserDeviceSize
            v-model="fieldValue.size"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 带参数的函数输入 -->
        <template v-else-if="field.type === 'function-with-params'">
          <UBrowserFunctionInput
            v-model:function="fieldValue.function"
            v-model:args="fieldValue.args"
            :label="field.label"
            :icon="field.icon"
            @update:function="(value) => updateValue('function', value)"
            @update:args="(value) => updateValue('args', value)"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { get, set } from "lodash";
import UBrowserFunctionInput from "./UBrowserFunctionInput.vue";
import UBrowserCheckbox from "./UBrowserCheckbox.vue";
import UBrowserFileList from "./UBrowserFileList.vue";
import UBrowserCookieList from "./UBrowserCookieList.vue";
import UBrowserButtonToggle from "./UBrowserButtonToggle.vue";
import UBrowserDeviceSize from "./UBrowserDeviceSize.vue";
import UBrowserNamedParamList from "./UBrowserNamedParamList.vue";
import UBrowserSelect from "./UBrowserSelect.vue";
import UBrowserDeviceName from "./UBrowserDeviceName.vue";
import UBrowserTextarea from "./UBrowserTextarea.vue";
import VariableInput from "components/composer/ui/VariableInput.vue";
import UBrowserCheckboxGroup from "./UBrowserCheckboxGroup.vue";
import NumberInput from "components/composer/ui/NumberInput.vue";
export default defineComponent({
  name: "UBrowserOperation",
  components: {
    UBrowserFunctionInput,
    UBrowserCheckbox,
    UBrowserFileList,
    UBrowserCookieList,
    UBrowserButtonToggle,
    UBrowserDeviceSize,
    UBrowserNamedParamList,
    UBrowserSelect,
    UBrowserDeviceName,
    UBrowserTextarea,
    VariableInput,
    UBrowserCheckboxGroup,
    NumberInput,
  },
  props: {
    configs: {
      type: Object,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:configs"],
  data() {
    return {
      fieldValue: {},
    };
  },
  created() {
    // 初始化字段值，确保有默认值
    this.fields.forEach((field) => {
      const value = get(this.configs[this.action], field.key);
      // 根据字段类型设置适当的默认值
      let defaultValue;
      if (field.type === "checkbox-group") {
        defaultValue = field.defaultValue || [];
      } else if (field.type === "checkbox") {
        defaultValue = field.defaultValue || false;
      } else if (field.type === "function-with-params") {
        // 为function-with-params类型设置特殊的默认值结构
        this.fieldValue.function = value?.function || "";
        this.fieldValue.args = value?.args || [];
        return; // 跳过后续的赋值
      } else {
        defaultValue = field.defaultValue;
      }
      this.fieldValue[field.key] = value !== undefined ? value : defaultValue;
    });
  },
  methods: {
    updateValue(key, value) {
      // 更新本地值
      this.fieldValue[key] = value;

      // 创建新的配置对
      const newConfigs = { ...this.configs };
      if (!newConfigs[this.action]) {
        newConfigs[this.action] = {};
      }

      // 使用 lodash 的 set 来处理嵌套路径
      set(newConfigs[this.action], key, value);

      // 发出更新事件
      this.$emit("update:configs", newConfigs);
    },
  },
  watch: {
    // 监听配置变化
    configs: {
      deep: true,
      handler() {
        this.fields.forEach((field) => {
          const value = get(this.configs[this.action], field.key);
          if (field.type === "function-with-params") {
            // 为function-with-params类型设置特殊的更新逻辑
            this.fieldValue.function =
              value?.function || this.fieldValue.function || "";
            this.fieldValue.args = value?.args || this.fieldValue.args || [];
            return;
          }
          if (value !== undefined) {
            this.fieldValue[field.key] = value;
          }
        });
      },
    },
  },
});
</script>
