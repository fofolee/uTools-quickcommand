<template>
  <div class="row q-col-gutter-sm items-center">
    <template v-for="field in fields" :key="field.key">
      <div
        v-if="!field.showWhen || fieldValue[field.showWhen] === field.showValue"
        :class="['col', field.width ? `col-${field.width}` : 'col-12']"
      >
        <!-- 复选框组 -->
        <template v-if="field.type === 'checkbox-group'">
          <q-option-group
            :model-value="
              Array.isArray(fieldValue[field.key]) ? fieldValue[field.key] : []
            "
            :options="field.options"
            type="checkbox"
            class="row items-center"
            inline
            dense
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 是/否选择 -->
        <template v-else-if="field.type === 'boolean-toggle'">
          <div class="row items-center no-wrap">
            <q-badge class="q-pa-xs">{{ field.label }}</q-badge>
            <q-btn-toggle
              :model-value="fieldValue[field.key] ? 'true' : 'false'"
              :options="[
                { label: '是', value: 'true' },
                { label: '否', value: 'false' },
              ]"
              dense
              flat
              no-caps
              spread
              class="button-group"
              @update:model-value="updateValue(field.key, $event === 'true')"
            />
          </div>
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
              :model-value="fieldValue[field.key]"
              :label="field.label"
              :icon="field.icon"
              @update:model-value="updateValue(field.key, $event)"
            />
          </template>
        </template>

        <!-- 数字输入框 -->
        <template v-else-if="field.type === 'numInput'">
          <NumberInput
            v-model="fieldValue[field.key]"
            :label="field.label"
            :icon="field.icon"
            @update:model-value="updateValue(field.key, $event)"
          />
        </template>

        <!-- 选择框 -->
        <template v-else-if="field.type === 'select'">
          <q-select
            :model-value="fieldValue[field.key]"
            :label="field.label"
            :options="field.options"
            dense
            filled
            emit-value
            map-options
            @update:model-value="updateValue(field.key, $event)"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
          </q-select>
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
          <div class="row items-center no-wrap">
            <q-badge class="q-pa-xs">{{ field.label }}</q-badge>
            <q-btn-toggle
              :model-value="fieldValue[field.key]"
              :options="field.options"
              dense
              flat
              no-caps
              spread
              class="button-group"
              @update:model-value="updateValue(field.key, $event)"
            />
          </div>
        </template>

        <!-- 设备尺寸 -->
        <template v-else-if="field.type === 'device-size'">
          <div class="row q-col-gutter-sm">
            <VariableInput
              v-model.number="fieldValue.size[key]"
              class="col-6"
              v-for="key in ['width', 'height']"
              :key="key"
              label="宽度"
              icon="width"
              @update:model-value="
                updateValue(field.key, {
                  ...fieldValue.size,
                  [key]: $event,
                })
              "
            />
          </div>
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
import { defineComponent, computed, ref, onMounted } from "vue";
import { get, set } from "lodash";
import UBrowserFunctionInput from "./UBrowserFunctionInput.vue";
import UBrowserFileList from "./UBrowserFileList.vue";
import UBrowserCookieList from "./UBrowserCookieList.vue";
import UBrowserNamedParamList from "./UBrowserNamedParamList.vue";
import UBrowserDeviceName from "./UBrowserDeviceName.vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";

export default defineComponent({
  name: "UBrowserOperation",
  components: {
    UBrowserFunctionInput,
    UBrowserFileList,
    UBrowserCookieList,
    UBrowserNamedParamList,
    UBrowserDeviceName,
    VariableInput,
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
  setup(props, { emit }) {
    const fieldValue = ref({});

    // 初始化字段值
    onMounted(() => {
      props.fields.forEach((field) => {
        const value = get(props.configs[props.action], field.key);
        // 根据字段类型设置适当的默认值
        if (field.type === "function-with-params") {
          fieldValue.value.function = value?.function || "";
          fieldValue.value.args = value?.args || [];
          return;
        }

        const defaultValue =
          field.type === "checkbox-group"
            ? []
            : field.type === "checkbox"
            ? field.defaultValue || false
            : field.defaultValue;

        fieldValue.value[field.key] = Array.isArray(value)
          ? value
          : defaultValue;
      });
    });

    // 更新值的方法
    const updateValue = (key, value) => {
      fieldValue.value[key] = value;

      const newConfigs = { ...props.configs };
      if (!newConfigs[props.action]) {
        newConfigs[props.action] = {};
      }

      set(newConfigs[props.action], key, value);
      emit("update:configs", newConfigs);
    };

    return {
      fieldValue,
      updateValue,
    };
  },
});
</script>

<style scoped>
.button-group {
  flex: 1;
  padding: 0 10px;
}

.button-group :deep(.q-btn) {
  min-height: 24px;
  font-size: 12px;
}
</style>
