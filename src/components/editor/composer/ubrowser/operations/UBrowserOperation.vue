<template>
  <div class="operation-item-argv q-mb-md">
    <div class="text-subtitle2 q-mb-sm">{{ title }}</div>
    <div class="row q-col-gutter-sm">
      <template v-for="(field, index) in fields" :key="index">
        <!-- 输入框 -->
        <template v-if="field.type === 'input'">
          <UBrowserInput
            :value="getFieldValue(field.key)"
            @update:modelValue="updateFieldValue(field.key, $event)"
            :label="field.label"
            :icon="field.icon"
            :type="field.inputType || 'text'"
            :width="field.width"
            v-bind="field.props || {}"
          />
        </template>

        <!-- 选择框 -->
        <template v-if="field.type === 'select'">
          <q-select
            :value="getFieldValue(field.key)"
            @update:modelValue="updateFieldValue(field.key, $event)"
            :options="field.options"
            :label="field.label"
            outlined
            dense
            class="col-12"
            v-bind="field.props || {}"
          />
        </template>

        <!-- 单个复选框 -->
        <template v-if="field.type === 'checkbox'">
          <div class="col-12">
            <q-checkbox
              :value="getFieldValue(field.key)"
              @update:modelValue="updateFieldValue(field.key, $event)"
              :label="field.label"
            />
          </div>
        </template>

        <!-- 复选框组 -->
        <template v-if="field.type === 'checkbox-group'">
          <q-option-group
            :value="getFieldValue(field.key)"
            @update:modelValue="updateFieldValue(field.key, $event)"
            :options="field.options"
            type="checkbox"
            inline
            class="col-12"
          />
        </template>

        <!-- 文本域 -->
        <template v-if="field.type === 'textarea'">
          <UBrowserInput
            :value="getFieldValue(field.key)"
            @update:modelValue="updateFieldValue(field.key, $event)"
            :label="field.label"
            :icon="field.icon"
            type="textarea"
            autogrow
            class="col-12"
          />
        </template>

        <!-- Cookie列表 -->
        <template v-if="field.type === 'cookie-list'">
          <div class="col-12">
            <div
              v-for="(item, idx) in getFieldValue(field.key)"
              :key="idx"
              class="row q-col-gutter-sm q-mb-sm"
            >
              <UBrowserInput
                :value="item.name"
                @update:modelValue="
                  updateCookieField(field.key, idx, 'name', $event)
                "
                label="名称"
                :width="5"
                icon="label"
              />
              <UBrowserInput
                :value="item.value"
                @update:modelValue="
                  updateCookieField(field.key, idx, 'value', $event)
                "
                label="值"
                :width="5"
                icon="edit"
              />
              <div class="col-2 flex items-center">
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="remove"
                  @click="removeCookie(field.key, idx)"
                  v-if="getFieldValue(field.key).length > 1"
                />
              </div>
            </div>
            <q-btn
              outline
              color="primary"
              label="添加Cookie"
              icon="add"
              @click="addCookie(field.key)"
              class="q-mt-sm"
            />
          </div>
        </template>

        <!-- 参数列表 -->
        <template v-if="field.type === 'param-list'">
          <div class="col-12">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <UBrowserInput
                v-model="newParam"
                label="参数"
                :width="10"
                icon="functions"
              />
              <q-btn flat round dense icon="add" @click="addParam(field.key)" />
            </div>
            <div v-if="getFieldValue(field.key).length > 0" class="q-mt-sm">
              <q-chip
                v-for="(param, idx) in getFieldValue(field.key)"
                :key="idx"
                removable
                @remove="removeParam(field.key, idx)"
              >
                {{ param }}
              </q-chip>
            </div>
          </div>
        </template>

        <!-- 文件列表 -->
        <template v-if="field.type === 'file-list'">
          <div class="col-12">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <UBrowserInput
                v-model="newFile"
                label="文件路径"
                :width="10"
                icon="upload_file"
              />
              <q-btn flat round dense icon="add" @click="addFile(field.key)" />
            </div>
            <div v-if="getFieldValue(field.key).length > 0" class="q-mt-sm">
              <q-chip
                v-for="(file, idx) in getFieldValue(field.key)"
                :key="idx"
                removable
                @remove="removeFile(field.key, idx)"
              >
                {{ file }}
              </q-chip>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import UBrowserInput from "./UBrowserInput.vue";

export default defineComponent({
  name: "UBrowserOperation",
  components: {
    UBrowserInput,
  },
  data() {
    return {
      newParam: "",
      newFile: "",
    };
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
    title: {
      type: String,
    },
    fields: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:configs"],
  methods: {
    addCookie(key) {
      const items = [...(this.getFieldValue(key) || [])];
      items.push({ name: "", value: "" });
      this.updateFieldValue(key, items);
    },
    removeCookie(key, index) {
      const items = [...this.getFieldValue(key)];
      items.splice(index, 1);
      this.updateFieldValue(key, items);
    },
    updateCookieField(key, index, field, value) {
      const items = [...this.getFieldValue(key)];
      items[index] = {
        ...items[index],
        [field]: value,
      };
      this.updateFieldValue(key, items);
    },
    addParam(key) {
      if (this.newParam) {
        const params = [...(this.getFieldValue(key) || [])];
        params.push(this.newParam);
        this.updateFieldValue(key, params);
        this.newParam = "";
      }
    },
    removeParam(key, index) {
      const params = [...this.getFieldValue(key)];
      params.splice(index, 1);
      this.updateFieldValue(key, params);
    },
    addFile(key) {
      if (this.newFile) {
        const files = [...(this.getFieldValue(key) || [])];
        files.push(this.newFile);
        this.updateFieldValue(key, files);
        this.newFile = "";
      }
    },
    removeFile(key, index) {
      const files = [...this.getFieldValue(key)];
      files.splice(index, 1);
      this.updateFieldValue(key, files);
    },
    getFieldValue(key) {
      return this.configs[this.action][key];
    },
    updateFieldValue(key, value) {
      this.$emit("update:configs", {
        ...this.configs,
        [this.action]: {
          ...this.configs[this.action],
          [key]: value,
        },
      });
    },
  },
});
</script>

<style scoped>
.operation-item-argv {
  padding: 0 4px;
}
</style>
