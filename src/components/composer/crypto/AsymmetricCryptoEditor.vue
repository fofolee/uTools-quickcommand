<template>
  <div class="asymmetric-crypto-editor">
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
        class="col-12"
        @update:model-value="updateConfig"
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
        class="col-grow"
        emit-value
        map-options
      />
      <!-- RSA填充选择 -->
      <q-select
        v-if="algorithm === 'RSA'"
        v-model="padding"
        :options="paddings"
        label="填充方式"
        dense
        filled
        class="col-grow"
        emit-value
        map-options
      />
      <!-- SM2密文格式选择 -->
      <q-select
        v-if="algorithm === 'SM2'"
        v-model="cipherMode"
        :options="[
          { label: 'C1C3C2', value: 1 },
          { label: 'C1C2C3', value: 0 },
        ]"
        label="密文格式"
        dense
        filled
        class="col-grow"
        emit-value
        map-options
      />
      <!-- 格式选择 -->
      <q-select
        v-model="format"
        :options="operation === 'encrypt' ? outputFormats : inputFormats"
        :label="operation === 'encrypt' ? '输出格式' : '输入格式'"
        dense
        filled
        class="col-grow"
        emit-value
        map-options
      />
    </div>

    <div class="row">
      <!-- 密钥输入区域 -->
      <div class="col-6 key-input">
        <div class="key-wrapper">
          <q-input
            v-model="publicKey"
            type="textarea"
            filled
            autogrow
            label="公钥"
            class="key-textarea"
            @update:model-value="updateConfig"
          />
          <q-btn-dropdown
            flat
            dense
            :label="publicKeyCodec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="publicKeyCodec = codec.value"
              >
                <q-item-section>
                  <q-item-label>{{ codec.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
      <div class="col-6 key-input">
        <div class="key-wrapper">
          <q-input
            v-model="privateKey"
            type="textarea"
            filled
            autogrow
            label="私钥"
            class="key-textarea"
            @update:model-value="updateConfig"
          />
          <q-btn-dropdown
            flat
            dense
            :label="privateKeyCodec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="privateKeyCodec = codec.value"
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
import VariableInput from "components/composer/ui/VariableInput.vue";
import { formatJsonVariables } from "js/composer/formatString";

export default defineComponent({
  name: "AsymmetricCryptoEditor",
  components: {
    VariableInput,
  },
  data() {
    return {
      operation: "encrypt",
      text: "",
      algorithm: "RSA",
      padding: "RSAES-PKCS1-V1_5",
      cipherMode: 1,
      publicKey: "",
      privateKey: "",
      publicKeyCodec: "Pem",
      privateKeyCodec: "Pem",
      format: "Base64",
      algorithms: [
        { label: "RSA", value: "RSA" },
        { label: "SM2", value: "SM2" },
      ],
      paddings: [
        { label: "PKCS#1 v1.5", value: "RSAES-PKCS1-V1_5" },
        { label: "OAEP", value: "RSA-OAEP" },
        { label: "OAEP/SHA-256", value: "RSA-OAEP-256" },
      ],
      keyCodecs: [
        { label: "PEM", value: "Pem" },
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
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
  props: {
    command: {
      type: Object,
    },
  },
  methods: {
    updateConfig() {
      const code = `${this.command.value}(${formatJsonVariables(
        {
          text: this.text,
          algorithm: this.algorithm,
          operation: this.operation,
          format: this.format,
          publicKey: {
            key: this.publicKey,
            codec: this.publicKeyCodec,
          },
          privateKey: {
            key: this.privateKey,
            codec: this.privateKeyCodec,
          },
          padding: this.algorithm === "RSA" ? this.padding : undefined,
          cipherMode: this.algorithm === "SM2" ? this.cipherMode : undefined,
        },
        ["text"]
      )})`;

      this.$emit("update:model-value", code);
    },
  },
  watch: {
    operation() {
      this.format = "Base64";
      this.updateConfig();
    },
    algorithm() {
      if (this.algorithm === "RSA") {
        this.padding = "PKCS#1";
      } else {
        this.cipherMode = 1;
      }
      this.updateConfig();
    },
    // 监听所有可能改变的值
    text() {
      this.updateConfig();
    },
    padding() {
      this.updateConfig();
    },
    cipherMode() {
      this.updateConfig();
    },
    publicKey() {
      this.updateConfig();
    },
    privateKey() {
      this.updateConfig();
    },
    publicKeyCodec() {
      this.updateConfig();
    },
    privateKeyCodec() {
      this.updateConfig();
    },
    format() {
      this.updateConfig();
    },
  },
});
</script>

<style scoped>
.asymmetric-crypto-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.col-grow {
  flex: 1 1 0;
  min-width: 150px;
}

/* 密钥输入区域样式 */
.key-input {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: calc(50% - 8px);
  max-width: calc(50% - 8px);
}

.key-wrapper {
  position: relative;
  height: 100%;
}

.key-textarea {
  height: 100%;
  width: 100%;
}

/* 确保输入框占满容器 */
.key-textarea :deep(.q-field) {
  width: 100%;
  height: 100%;
}

/* 确保文本区域占满输入框 */
.key-textarea :deep(.q-field__native) {
  min-height: 120px;
  resize: none;
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

/* 确保选择器行在空间不够时换行美观 */
@media (max-width: 600px) {
  .col-grow {
    flex: 1 1 calc(50% - 8px);
    max-width: none;
  }

  .key-input {
    min-width: 100%;
    max-width: 100%;
    margin-bottom: 8px;
  }
}

.q-btn-toggle {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.body--dark .q-btn-toggle {
  border-color: rgba(255, 255, 255, 0.12);
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
