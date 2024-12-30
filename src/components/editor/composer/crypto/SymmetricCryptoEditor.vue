<template>
  <div class="symmetric-crypto-editor q-gutter-y-sm">
    <!-- 加密/解密切换 -->
    <q-btn-toggle
      v-model="operation"
      :options="[
        { label: '加密', value: 'encrypt' },
        { label: '解密', value: 'decrypt' },
      ]"
      spread
      dense
      no-caps
      unelevated
      toggle-color="primary"
    />

    <!-- 文本输入 -->
    <div class="row">
      <VariableInput
        v-model="text"
        :label="operation === 'encrypt' ? '要加密的文本' : '要解密的文本'"
        :command="{
          icon:
            operation === 'encrypt' ? 'enhanced_encryption' : 'no_encryption',
        }"
        class="col-8"
        @update:model-value="updateConfig"
      />
      <q-select
        v-model="format"
        :options="operation === 'encrypt' ? outputFormats : inputFormats"
        :label="operation === 'encrypt' ? '输出格式' : '输入格式'"
        dense
        filled
        class="col-4"
        emit-value
        map-options
      />
    </div>

    <div class="row">
      <!-- 算法选择 -->
      <q-select
        v-model="algorithm"
        :options="algorithms"
        label="加密算法"
        dense
        filled
        class="col-select"
        emit-value
        map-options
      />
      <!-- AES密钥长度选择 -->
      <q-select
        v-if="showKeyLength"
        v-model="keyLength"
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
      />
      <!-- 模式选择 -->
      <q-select
        v-model="mode"
        :options="modes"
        label="加密模式"
        dense
        filled
        class="col-select"
        emit-value
        map-options
      />
      <!-- Padding选择 -->
      <q-select
        v-model="padding"
        :options="paddings"
        label="填充方式"
        dense
        filled
        class="col-select"
        emit-value
        map-options
      />
    </div>

    <div class="row">
      <!-- 密钥输入区域 -->
      <div class="col-grow key-input">
        <div class="key-wrapper">
          <q-input
            v-model="key"
            filled
            label="密钥"
            class="key-input"
            @update:model-value="updateConfig"
          />
          <q-btn-dropdown flat dense :label="keyCodec" class="codec-dropdown">
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="keyCodec = codec.value"
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
            v-model="iv"
            filled
            label="IV"
            class="key-input"
            @update:model-value="updateConfig"
          />
          <q-btn-dropdown flat dense :label="ivCodec" class="codec-dropdown">
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="ivCodec = codec.value"
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
import VariableInput from "../VariableInput.vue";
import { formatJsonVariables } from "js/composer/formatString";

export default defineComponent({
  name: "SymmetricCryptoEditor",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: [String, Object],
      default: "",
    },
  },
  data() {
    return {
      operation: "encrypt",
      text: "",
      algorithm: "AES",
      keyLength: 128,
      mode: "CBC",
      padding: "Pkcs7",
      key: "",
      keyCodec: "Utf8",
      iv: "",
      ivCodec: "Utf8",
      format: "Base64",
      keyCodecs: [
        { label: "UTF-8", value: "Utf8" },
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ],
      algorithms: [
        { label: "AES", value: "AES" },
        { label: "SM4", value: "SM4" },
      ],
      outputFormats: [
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ],
      inputFormats: [
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
      ],
    };
  },
  computed: {
    modes() {
      // SM4 只支持 ECB/CBC
      if (this.algorithm === "SM4") {
        return [
          { label: "ECB", value: "ECB" },
          { label: "CBC", value: "CBC" },
        ];
      }
      // AES/DES/3DES 支持更多模式
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
      // SM4 支持的填充方式
      if (this.algorithm === "SM4") {
        return [
          { label: "PKCS#7", value: "pkcs#7" },
          { label: "None", value: "none" },
        ];
      }
      // AES/DES/3DES 支持的填充方式
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
      return this.mode !== "ECB";
    },
    showKeyLength() {
      return this.algorithm === "AES";
    },
  },
  methods: {
    updateConfig() {
      const code = `quickcomposer.textProcessing.symmetricCrypto(${formatJsonVariables(
        {
          text: this.text,
          algorithm: this.algorithm,
          mode: this.mode,
          padding: this.padding,
          key: {
            value: this.key,
            codec: this.keyCodec,
          },
          keyLength: this.keyLength,
          operation: this.operation,
          format: this.format,
          iv:
            this.mode !== "ECB"
              ? {
                  value: this.iv,
                  codec: this.ivCodec,
                }
              : undefined,
        },
        ["text"]
      )})`;

      this.$emit("update:model-value", code);
    },
  },
  watch: {
    operation() {
      // 切换操作时重置格式为默认值
      this.format = "Base64";
      this.updateConfig();
    },
    text() {
      this.updateConfig();
    },
    algorithm() {
      // 切换算法时重置模式和填充
      if (this.algorithm === "SM4") {
        this.mode = "ECB";
        this.padding = "pkcs#7";
      } else {
        this.mode = "CBC";
        this.padding = "Pkcs7";
      }
      this.updateConfig();
    },
    mode() {
      this.updateConfig();
    },
    padding() {
      this.updateConfig();
    },
    format() {
      this.updateConfig();
    },
    keyLength() {
      this.updateConfig();
    },
    key() {
      this.updateConfig();
    },
    iv() {
      this.updateConfig();
    },
  },
});
</script>

<style scoped>
.crypto-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.q-btn-toggle {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.body--dark .q-btn-toggle {
  border-color: rgba(255, 255, 255, 0.12);
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
