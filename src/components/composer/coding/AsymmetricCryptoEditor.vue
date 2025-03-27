<template>
  <div class="asymmetric-crypto-editor">
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
    <div class="row">
      <VariableInput
        :model-value="argvs.text"
        @update:model-value="updateArgvs('text', $event)"
        :label="argvs.operation === 'encrypt' ? '要加密的文本' : '要解密的文本'"
        :icon="argvs.operation === 'encrypt' ? 'text_fields' : 'password'"
        class="col-12"
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
        class="col-grow"
        emit-value
        map-options
      />
      <!-- RSA填充选择 -->
      <q-select
        v-if="argvs.algorithm === 'RSA'"
        :model-value="argvs.padding"
        @update:model-value="updateArgvs('padding', $event)"
        :options="paddings"
        label="填充方式"
        dense
        filled
        class="col-grow"
        options-dense
        emit-value
        map-options
      />
      <!-- SM2密文格式选择 -->
      <q-select
        v-if="argvs.algorithm === 'SM2'"
        :model-value="argvs.cipherMode"
        @update:model-value="updateArgvs('cipherMode', $event)"
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
        options-dense
      />
      <!-- 格式选择 -->
      <q-select
        :model-value="argvs.format"
        @update:model-value="updateArgvs('format', $event)"
        :options="argvs.operation === 'encrypt' ? outputFormats : inputFormats"
        :label="argvs.operation === 'encrypt' ? '输出格式' : '输入格式'"
        dense
        filled
        class="col-grow"
        emit-value
        map-options
        options-dense
      />
    </div>

    <div class="row">
      <!-- 密钥输入区域 -->
      <div class="col-6 key-input">
        <div class="key-wrapper">
          <q-input
            :model-value="argvs.publicKey.key"
            @update:model-value="
              (key) => updateArgvs('publicKey', { ...argvs.publicKey, key })
            "
            type="textarea"
            filled
            autogrow
            label="公钥"
            class="key-textarea"
          />
          <q-btn-dropdown
            flat
            dense
            :label="argvs.publicKey.codec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="
                  updateArgvs('publicKey', {
                    ...argvs.publicKey,
                    codec: codec.value,
                  })
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
      <div class="col-6 key-input">
        <div class="key-wrapper">
          <q-input
            :model-value="argvs.privateKey.key"
            @update:model-value="
              (key) => updateArgvs('privateKey', { ...argvs.privateKey, key })
            "
            type="textarea"
            filled
            autogrow
            label="私钥"
            class="key-textarea"
          />
          <q-btn-dropdown
            flat
            dense
            :label="argvs.privateKey.codec"
            class="codec-dropdown"
          >
            <q-list>
              <q-item
                v-for="codec in keyCodecs"
                :key="codec.value"
                clickable
                v-close-popup
                @click="
                  updateArgvs('privateKey', {
                    ...argvs.privateKey,
                    codec: codec.value,
                  })
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
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import { stringifyArgv } from "js/composer/formatString";
import { newVarInputVal } from "js/composer/varInputValManager";
export default defineComponent({
  name: "AsymmetricCryptoEditor",
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
        algorithm: "RSA",
        keyLength: 1024,
        padding: "RSAES-PKCS1-V1_5",
        cipherMode: 1,
        publicKey: {
          key: "",
          codec: "Pem",
        },
        privateKey: {
          key: "",
          codec: "Pem",
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
    algorithms() {
      return [
        { label: "RSA", value: "RSA" },
        { label: "SM2", value: "SM2" },
      ];
    },
    paddings() {
      return [
        { label: "PKCS#1 v1.5", value: "RSAES-PKCS1-V1_5" },
        { label: "OAEP", value: "RSA-OAEP" },
        { label: "OAEP/SHA-256", value: "RSA-OAEP-256" },
      ];
    },
    keyCodecs() {
      return [
        { label: "PEM", value: "Pem" },
        { label: "Base64", value: "Base64" },
        { label: "Hex", value: "Hex" },
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
  },
  methods: {
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value}(${stringifyArgv({
        text: argvs.text,
        algorithm: argvs.algorithm,
        operation: argvs.operation,
        format: argvs.format,
        publicKey: argvs.publicKey,
        privateKey: argvs.privateKey,
        padding: argvs.algorithm === "RSA" ? argvs.padding : undefined,
        cipherMode: argvs.algorithm === "SM2" ? argvs.cipherMode : undefined,
      })})`;
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };

      // 特殊处理
      if (key === "operation") {
        argvs.format = "Base64";
      } else if (key === "algorithm") {
        if (value === "RSA") {
          argvs.padding = "PKCS#1";
        } else {
          argvs.cipherMode = 1;
        }
      }

      this.updateModelValue(argvs);
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        argvs,
        code: this.generateCode(argvs),
      });
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
  },
  mounted() {
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.asymmetric-crypto-editor {
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
