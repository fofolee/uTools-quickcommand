<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="dict-editor">
      <div
        v-for="(item, index) in allItems"
        :key="`${item.type}-${index}`"
        class="row items-center"
      >
        <div class="col-4 q-pr-sm">
          <template v-if="item.type === 'fixed'">
            <q-input
              :model-value="item.key"
              :label="getKeyLabel(item.key)"
              dense
              filled
              readonly
              disable
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-input
              v-if="options?.optionKeys"
              :model-value="item.key"
              label="名称"
              dense
              filled
              @update:model-value="(val) => handleInput(val, index)"
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
              <template v-slot:append>
                <q-btn dense flat icon="menu">
                  <q-menu>
                    <q-list dense>
                      <q-item
                        v-for="opt in normalizedOptionKeys"
                        :key="opt.value"
                        clickable
                        v-close-popup
                        @click="handleSelect(opt, index)"
                      >
                        <q-item-section>
                          {{ getKeyLabel(opt) }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
            </q-input>
            <q-input
              v-else
              :model-value="item.key"
              label="名称"
              dense
              filled
              @update:model-value="(val) => handleInput(val, index)"
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
            </q-input>
          </template>
        </div>
        <div class="col">
          <VariableInput
            :model-value="item.value"
            label="值"
            icon="code"
            class="col-grow"
            @update:model-value="(val) => updateItemValue(val, index)"
          />
        </div>
        <div v-if="item.type !== 'fixed' && !options?.disableAdd">
          <div class="btn-container">
            <template v-if="localItems.length === 1">
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                class="center-btn"
                @click="addItem"
              />
            </template>
            <template v-else-if="index === allItems.length - 1">
              <q-btn
                flat
                dense
                size="sm"
                icon="remove"
                class="top-btn"
                @click="removeItem(index)"
              />
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                class="bottom-btn"
                @click="addItem"
              />
            </template>
            <template v-else>
              <q-btn
                flat
                dense
                size="sm"
                icon="remove"
                class="center-btn"
                @click="removeItem(index)"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";

export default defineComponent({
  name: "DictEditor",
  components: {
    VariableInput,
    BorderLabel,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    isCollapse: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  created() {
    if (
      (!this.modelValue || Object.keys(this.modelValue).length === 0) &&
      !this.options?.disableAdd
    ) {
      this.$emit("update:modelValue", { "": newVarInputVal("str") });
    }
  },
  data() {
    return {
      inputValue: "",
    };
  },
  computed: {
    modelEntries() {
      return Object.entries(this.modelValue || {});
    },
    fixedItems() {
      const fixedKeys = this.normalizeKeys(this.options?.fixedKeys || []);
      return fixedKeys.map((key) => ({
        type: "fixed",
        key: key.value,
        value:
          this.modelEntries.find(([k]) => k === key.value)?.[1] ||
          newVarInputVal("str"),
      }));
    },
    localItems() {
      return this.modelEntries
        .filter(
          ([key]) =>
            !this.normalizeKeys(this.options?.fixedKeys || []).some(
              (k) => k.value === key
            )
        )
        .map(([key, value]) => ({
          type: "editable",
          key,
          value,
        }));
    },
    allItems() {
      return [...this.fixedItems, ...this.localItems];
    },
    normalizedOptionKeys() {
      return this.normalizeKeys(this.options?.optionKeys || []);
    },
  },
  methods: {
    normalizeKeys(keys) {
      return keys.map((key) =>
        typeof key === "string" ? { value: key, label: key } : key
      );
    },
    getKeyLabel(key) {
      if (typeof key === "object") return key.label;
      const allKeys = [
        ...this.normalizeKeys(this.options?.fixedKeys || []),
        ...this.normalizedOptionKeys,
      ];
      return allKeys.find((k) => k.value === key)?.label || key;
    },
    updateItemValue(val, index) {
      const item = this.allItems[index];
      const dict = { ...this.modelValue };
      dict[item.key] = val;
      this.$emit("update:modelValue", dict);
    },
    addItem() {
      if (this.options?.disableAdd) return;
      const dict = { ...this.modelValue };
      if (dict[""]) {
        quickcommand.showMessageBox("名称不能为空");
        return;
      }
      dict[""] = newVarInputVal("str");
      this.$emit("update:modelValue", dict);
    },
    removeItem(index) {
      const item = this.localItems[index];
      const dict = { ...this.modelValue };
      delete dict[item.key];

      // 如果删除后没有条目，添加一个空行
      if (Object.keys(dict).length === 0) {
        dict[""] = newVarInputVal("str");
      }

      this.$emit("update:modelValue", dict);
    },
    handleInput(val, index) {
      this.inputValue = val;
      const item = this.allItems[index];
      if (val in this.modelValue && val !== item.key) {
        return;
      }
      const dict = { ...this.modelValue };
      delete dict[item.key];
      dict[val] = item.value;
      this.$emit("update:modelValue", dict);
    },
    handleSelect(val, index) {
      this.inputValue = "";
      const value = val?.value || val;
      const item = this.allItems[index];
      if (value in this.modelValue && value !== item.key) {
        return;
      }
      const dict = { ...this.modelValue };
      delete dict[item.key];
      dict[value] = item.value;
      this.$emit("update:modelValue", dict);
    },
    handleBlur() {
      this.inputValue = "";
    },
  },
});
</script>

<style scoped>
.dict-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 防止输入框换行 */
:deep(.q-field__native) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-container {
  position: relative;
  width: 16px;
  height: 32px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-container .q-btn {
  position: absolute;
  width: 16px;
  height: 16px;
  min-height: 16px;
  padding: 0;
}

.btn-container .center-btn {
  position: relative;
}

.btn-container .top-btn {
  top: 0;
}

.btn-container .bottom-btn {
  bottom: 0;
}

:deep(.q-btn .q-icon) {
  font-size: 14px;
}

:deep(.q-btn.q-btn--dense) {
  padding: 0;
  min-height: 16px;
}
</style>
