<template>
  <div class="symmetric-crypto-editor">
    <!-- 加密/解密切换 -->
    <div class="tabs-container">
      <q-tabs
        :model-value="argvs.operation"
        @update:model-value="updateArgvs('operation', $event)"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        inline-label
      >
        <q-tab name="encrypt" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="enhanced_encryption" size="16px" />
            <div class="q-ml-xs">加密</div>
          </div>
        </q-tab>
        <q-tab name="decrypt" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="no_encryption" size="16px" />
            <div class="q-ml-xs">解密</div>
          </div>
        </q-tab>
      </q-tabs>
      <q-separator />
    </div>

    <!-- 文本输入 -->
    <div class="row q-mt-xs">
      <VariableInput
        :model-value="argvs.text"
        @update:model-value="updateArgvs('text', $event)"
        :label="argvs.operation === 'encrypt' ? '要加密的文本' : '要解密的文本'"
        :icon="argvs.operation === 'encrypt' ? 'text_fields' : 'password'"
        class="col-8"
      />
      <q-select
        :model-value="argvs.format"
        @update:model-value="updateArgvs('format', $event)"
        :options="argvs.operation === 'encrypt' ? outputFormats : inputFormats"
        :label="argvs.operation === 'encrypt' ? '输出格式' : '输入格式'"
        dense
        options-dense
        filled
        class="col-4"
        emit-value
        map-options
      />
    </div>

    <div class="row">
      <!-- 算法选择 -->
      <q-select
        :model-value="argvs.algorithm"
        @update:model-value="updateArgvs('algorithm', $event)"
        :options="algorithms"
        label="加密算法"
        dense
        filled
        options-dense
        class="col-select"
        emit-value
        map-options
      />
      <!-- AES密钥长度选择 -->
      <q-select
        v-if="showKeyLength"
        :model-value="argvs.keyLength"
        @update:model-value="updateArgvs('keyLength', $event)"
        :options="[
          { label: '128位', value: 128 },
          { label: '192位', value: 192 },
          { label: '256位', value: 256 },
        ]"
        label="密钥长度"
        dense
        filled
        class="col-select"
        emit-value
        map-options
        options-dense
      />
      <!-- 模式选择 -->
      <q-select
        :model-value="argvs.mode"
        @update:model-value="updateArgvs('mode', $event)"
        :options="modes"
        label="加密模式"
        dense
        filled
        class="col-select"
        emit-value
        map-options
        options-dense
      />
      <!-- Padding选择 -->
      <q-select
        :model-value="argvs.padding"
        @update:model-value="updateArgvs('padding', $event)"
        :options="paddings"
        label="填充方式"
        dense
        filled
        class="col-select"
        emit-value
        map-options
        options-dense
      />
    </div>

    <div class="row">
      <!-- 密钥输入区域 -->
      <div class="col-grow key-input">
        <div class="key-wrapper">
          <q-input
            :model-value="argvs.key.value"
            @update:model-value="
              updateArgvs('key', { ...argvs.key, value: $event })
            "
            filled
            label="密钥"
            class="key-input"
          />
          <q-btn-dropdown
            flat
            dense
            :label="argvs.key.codec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="
                  updateArgvs('key', { ...argvs.key, codec: codec.value })
                "
              >
                <q-item-section>
                  <q-item-label>{{ codec.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
      <!-- IV输入区域 -->
      <div v-if="showIV" class="col-grow key-input">
        <div class="key-wrapper">
          <q-input
            :model-value="argvs.iv.value"
            @update:model-value="
              updateArgvs('iv', { ...argvs.iv, value: $event })
            "
            filled
            label="IV"
            class="key-input"
          />
          <q-btn-dropdown
            flat
            dense
            :label="argvs.iv.codec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="updateArgvs('iv', { ...argvs.iv, codec: codec.value })"
              >
                <q-item-section>
                  <q-item-label>{{ codec.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import { stringifyArgv } from "js/composer/formatString";
import { newVarInputVal } from "js/composer/varInputValManager";

export default defineComponent({
  name: "SymmetricCryptoEditor",
  components: {
    VariableInput,
  },
  props: {
    modelValue: Object,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      defaultArgvs: {
        operation: "encrypt",
        text: newVarInputVal("str"),
        algorithm: "AES",
        keyLength: 128,
        mode: "CBC",
        padding: "Pkcs7",
        key: {
          value: "",
          codec: "Utf8",
        },
        iv: {
          value: "",
          codec: "Utf8",
        },
        format: "Base64",
      },
    };
  },
  computed: {
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
    keyCodecs() {
      return [
        { label: "UTF-8", value: "Utf8" },
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ];
    },
    algorithms() {
      return [
        { label: "AES", value: "AES" },
        { label: "SM4", value: "SM4" },
      ];
    },
    outputFormats() {
      return [
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ];
    },
    inputFormats() {
      return [
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ];
    },
    modes() {
      if (this.argvs.algorithm === "SM4") {
        return [
          { label: "ECB", value: "ECB" },
          { label: "CBC", value: "CBC" },
        ];
      }
      return [
        { label: "ECB", value: "ECB" },
        { label: "CBC", value: "CBC" },
        { label: "CFB", value: "CFB" },
        { label: "OFB", value: "OFB" },
        { label: "CTR", value: "CTR" },
        { label: "GCM", value: "GCM" },
      ];
    },
    paddings() {
      if (this.argvs.algorithm === "SM4") {
        return [
          { label: "PKCS#7", value: "pkcs#7" },
          { label: "None", value: "none" },
        ];
      }
      return [
        { label: "PKCS7", value: "Pkcs7" },
        { label: "Zero Padding", value: "ZeroPadding" },
        { label: "No Padding", value: "NoPadding" },
        { label: "ISO-10126", value: "Iso10126" },
        { label: "ANSI X.923", value: "AnsiX923" },
        { label: "ISO-97971", value: "Iso97971" },
      ];
    },
    showIV() {
      return this.argvs.mode !== "ECB";
    },
    showKeyLength() {
      return this.argvs.algorithm === "AES";
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value}(${stringifyArgv({
        text: argvs.text,
        algorithm: argvs.algorithm,
        mode: argvs.mode,
        padding: argvs.padding,
        key: argvs.key,
        keyLength: argvs.keyLength,
        operation: argvs.operation,
        format: argvs.format,
        iv: argvs.mode !== "ECB" ? argvs.iv : undefined,
      })})`;
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };

      if (key === "operation") {
        argvs.format = "Base64";
      } else if (key === "algorithm") {
        if (value === "SM4") {
          argvs.mode = "ECB";
          argvs.padding = "pkcs#7";
        } else {
          argvs.mode = "CBC";
          argvs.padding = "Pkcs7";
        }
      }

      this.updateModelValue(argvs);
    },
    getSummary(argvs) {
      const text = window.lodashM.truncate(argvs.text.value, {
        length: 30,
        omission: "...",
      });
      return argvs.operation === "encrypt"
        ? "加密" + " " + text
        : "解密" + " " + text;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
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
.symmetric-crypto-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabs-container {
  position: relative;
}

.tabs-container .q-tabs {
  min-height: 32px;
}

.tabs-container .q-tab {
  min-height: 32px;
  padding: 0 12px;
}

.tabs-container .q-tab__content {
  min-height: 32px;
}

.tabs-container .q-separator {
  position: relative;
  z-index: 0;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.col-select {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.col-grow {
  flex: 1 1 0;
  min-width: 150px;
}

/* 确保第一行的输入框和格式选择器的比例固定 */
.row:first-of-type .col-8 {
  flex: 4;
  min-width: 200px;
}

.row:first-of-type .col-4 {
  flex: 1;
  min-width: 120px;
}

/* 确保选择器行在空间不够时换行美观 */
@media (max-width: 600px) {
  .col-select {
    flex: 1 1 calc(50% - 8px);
    max-width: none;
  }
}

.key-input {
  position: relative;
}

.key-wrapper {
  position: relative;
}

/* 编码选择下拉按钮样式 */
.codec-dropdown {
  min-width: 45px;
  max-width: 45px;
  font-size: 10px;
  padding: 2px 4px;
  height: 20px;
  line-height: 16px;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.6);
  z-index: 1;
  position: absolute;
  right: 8px;
  bottom: 8px;
}

/* 下拉菜单项样式 */
.codec-dropdown :deep(.q-btn-dropdown__arrow) {
  font-size: 10px;
  margin-left: 1px;
}

.codec-dropdown :deep(.q-list) {
  min-width: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.codec-dropdown :deep(.q-item) {
  min-height: 24px;
  padding: 2px 6px;
}

.codec-dropdown :deep(.q-item__label) {
  font-size: 10px;
}

.body--dark .codec-dropdown {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .codec-dropdown :deep(.q-list) {
  background: #1d1d1d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 确保下拉按钮内容垂直居中 */
.codec-dropdown :deep(.q-btn__content) {
  min-height: unset;
  padding: 0;
}

/* 调整下拉按钮的内容间距 */
.codec-dropdown :deep(.q-btn__wrapper) {
  padding: 0 4px;
  min-height: unset;
}
</style>
