<template>
  <div class="row q-col-gutter-sm items-center">
    <template v-for="field in fields" :key="field.key">
      <div
        v-if="!field.showWhen || fieldValue[field.showWhen] === field.showValue"
        :class="['col', field.width ? `col-${field.width}` : 'col-12']"
      >
        <!-- 复选框组 -->
        <template v-if="field.type === 'checkbox-group'">
          <div class="row items-center">
            <!-- <div class="text-caption q-mb-sm">{{ field.label }}</div> -->
            <q-option-group
              :model-value="fieldValue[field.key] || []"
              :options="field.options"
              type="checkbox"
              inline
              dense
              @update:model-value="updateValue(field.key, $event)"
            />
          </div>
        </template>

        <!-- 单个复选框 -->
        <template v-else-if="field.type === 'checkbox'">
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

        <!-- 文本输入 -->
        <template v-else-if="field.type === 'input'">
          <q-input
            :model-value="fieldValue[field.key]"
            :label="field.label"
            :type="field.inputType || 'text'"
            dense
            outlined
            @update:model-value="updateValue(field.key, $event)"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
          </q-input>
        </template>

        <!-- 文本区域 -->
        <template v-else-if="field.type === 'textarea'">
          <q-input
            :model-value="fieldValue[field.key]"
            :label="field.label"
            type="textarea"
            dense
            outlined
            autogrow
            @update:model-value="updateValue(field.key, $event)"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
          </q-input>
        </template>

        <!-- 选择框 -->
        <template v-else-if="field.type === 'select'">
          <q-select
            :model-value="fieldValue[field.key]"
            :label="field.label"
            :options="field.options"
            dense
            outlined
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
          <div class="row q-col-gutter-sm">
            <div
              v-for="(cookie, index) in fieldValue[field.key] || [{}]"
              :key="index"
              class="col-12"
            >
              <div class="row items-center q-gutter-x-sm">
                <div class="col">
                  <q-input
                    v-model="cookie.name"
                    label="名称"
                    dense
                    outlined
                    @update:model-value="updateCookieList(field.key)"
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="cookie.value"
                    label="值"
                    dense
                    outlined
                    @update:model-value="updateCookieList(field.key)"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="remove"
                    @click="removeCookie(field.key, index)"
                  />
                </div>
              </div>
            </div>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            icon="add"
            label="添加Cookie"
            @click="addCookie(field.key)"
            class="q-mt-xs"
          />
        </template>

        <!-- 参数列表 -->
        <template v-else-if="field.type === 'param-list'">
          <div class="text-caption q-mb-sm">{{ field.label }}</div>
          <div
            v-for="(param, index) in fieldValue[field.key] || []"
            :key="index"
            class="row q-col-gutter-sm q-mb-sm"
          >
            <div class="col-10">
              <q-input
                v-model="fieldValue[field.key][index]"
                label="参数值"
                dense
                outlined
                @update:model-value="
                  updateValue(field.key, fieldValue[field.key])
                "
              />
            </div>
            <div class="col-2">
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="remove"
                @click="removeParam(field.key, index)"
              />
            </div>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            icon="add"
            label="添加参数"
            @click="addParam(field.key)"
          />
        </template>

        <!-- 文件列表 -->
        <template v-else-if="field.type === 'file-list'">
          <div class="row q-col-gutter-sm">
            <div
              v-for="(file, index) in fieldValue[field.key] || []"
              :key="index"
              class="col-12"
            >
              <div class="row q-col-gutter-sm">
                <div class="col">
                  <q-input
                    v-model="fieldValue[field.key][index]"
                    label="文件路径"
                    dense
                    outlined
                    @update:model-value="
                      updateValue(field.key, fieldValue[field.key])
                    "
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="remove"
                    @click="removeFile(field.key, index)"
                  />
                </div>
              </div>
            </div>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            icon="add"
            label="添加文件"
            @click="addFile(field.key)"
            class="q-mt-xs"
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
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { get, set } from "lodash";

export default defineComponent({
  name: "UBrowserOperation",
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

    // Cookie列表相关方法
    addCookie(key) {
      if (!this.fieldValue[key]) {
        this.fieldValue[key] = [];
      }
      this.fieldValue[key].push({ name: "", value: "" });
      this.updateValue(key, this.fieldValue[key]);
    },
    removeCookie(key, index) {
      this.fieldValue[key].splice(index, 1);
      if (this.fieldValue[key].length === 0) {
        this.fieldValue[key].push({ name: "", value: "" });
      }
      this.updateValue(key, this.fieldValue[key]);
    },
    updateCookieList(key) {
      this.updateValue(key, this.fieldValue[key]);
    },

    // 参数列表相关方法
    addParam(key) {
      if (!this.fieldValue[key]) {
        this.fieldValue[key] = [];
      }
      this.fieldValue[key].push("");
      this.updateValue(key, this.fieldValue[key]);
    },
    removeParam(key, index) {
      this.fieldValue[key].splice(index, 1);
      this.updateValue(key, this.fieldValue[key]);
    },

    // 文件列表相关方法
    addFile(key) {
      if (!this.fieldValue[key]) {
        this.fieldValue[key] = [];
      }
      this.fieldValue[key].push("");
      this.updateValue(key, this.fieldValue[key]);
    },
    removeFile(key, index) {
      this.fieldValue[key].splice(index, 1);
      this.updateValue(key, this.fieldValue[key]);
    },
  },
  watch: {
    // 监听配置变化
    configs: {
      deep: true,
      handler() {
        this.fields.forEach((field) => {
          const value = get(this.configs[this.action], field.key);
          if (value !== undefined) {
            this.fieldValue[field.key] = value;
          }
        });
      },
    },
  },
});
</script>

<style scoped>
.button-group-container {
  position: relative;
}

.button-group {
  flex: 1;
  padding: 0 10px;
}

.button-group :deep(.q-btn) {
  min-height: 24px;
  font-size: 12px;
}
</style>
