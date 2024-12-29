<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础配置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            v-model="localConfig.method"
            :options="[
              'GET',
              'POST',
              'PUT',
              'DELETE',
              'PATCH',
              'HEAD',
              'OPTIONS',
            ]"
            label="请求方法"
            dense
            filled
            emit-value
            map-options
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="send" />
            </template>
          </q-select>
        </div>
        <div class="col">
          <VariableInput
            v-model="localConfig.url"
            label="请求地址"
            :command="{ icon: 'link' }"
            @update:model-value="updateConfig"
          />
        </div>
      </div>
    </div>

    <!-- Headers -->
    <div class="col-12">
      <HeaderEditor
        :headers="localConfig.headers"
        @input="
          (val) => {
            localConfig.headers = val;
            updateConfig();
          }
        "
      />
    </div>

    <!-- 请求参数 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfig.params"
        label="URL参数"
        :command="{ icon: 'link' }"
        @update:model-value="updateConfig"
      />
    </div>

    <!-- 请求体 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfig.data"
        label="请求体"
        :command="{ icon: 'data_object' }"
        @update:model-value="updateConfig"
      />
    </div>

    <!-- 超时设置 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfig.timeout"
        label="超时时间(ms)"
        :command="{ icon: 'timer', inputType: 'number' }"
        @update:model-value="updateConfig"
      />
    </div>

    <!-- 其他选项 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-checkbox
            v-model="localConfig.withCredentials"
            label="发送凭证"
            @update:model-value="updateConfig"
          />
        </div>
        <div class="col-6">
          <q-checkbox
            v-model="localConfig.decompress"
            label="自动解压"
            @update:model-value="updateConfig"
          />
        </div>
      </div>
    </div>

    <!-- 响应类型 -->
    <div class="col-12">
      <q-select
        v-model="localConfig.responseType"
        :options="['json', 'text', 'blob', 'arraybuffer']"
        label="响应类型"
        dense
        filled
        emit-value
        map-options
        @update:model-value="updateConfig"
      >
        <template v-slot:prepend>
          <q-icon name="data_object" />
        </template>
      </q-select>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../VariableInput.vue";
import HeaderEditor from "./HeaderEditor.vue";
import { formatJsonVariables } from "js/composer/formatString";

export default defineComponent({
  name: "AxiosConfigEditor",
  components: {
    VariableInput,
    HeaderEditor,
  },
  props: {
    modelValue: {
      type: [Object, String],
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  data() {
    let initialConfig = {};
    if (typeof this.modelValue === "string") {
      try {
        // 尝试从代码字符串中提取配置对象
        const match = this.modelValue.match(
          /axios\.\w+\([^{]*({\s*[^]*})\s*\)/
        );
        if (match) {
          initialConfig = JSON.parse(match[1]);
        }
      } catch (e) {
        console.warn("Failed to parse config from code string");
      }
    } else {
      initialConfig = this.modelValue;
    }

    return {
      localConfig: {
        url: "",
        method: "GET",
        headers: {},
        params: "",
        data: "",
        timeout: 0,
        withCredentials: false,
        responseType: "json",
        decompress: true,
        ...initialConfig,
      },
    };
  },
  created() {
    // 将headers对象转换为数组形式
    this.headers = Object.entries(this.localConfig.headers || {}).map(
      ([name, value]) => ({ name, value })
    );
  },
  methods: {
    updateConfig() {
      // 移除空值
      const config = { ...this.localConfig };
      Object.keys(config).forEach((key) => {
        if (
          config[key] === "" ||
          config[key] === null ||
          config[key] === undefined
        ) {
          delete config[key];
        }
      });

      // 生成代码
      const { method = "GET", url, data, ...restConfig } = config;
      if (!url) return;
      let code = "";
      const variableFields = ["headers", "timeout", "params", "data"];
      if (method.toUpperCase() === "GET") {
        code = `axios.get(${url}${
          Object.keys(restConfig).length
            ? `, ${formatJsonVariables(restConfig, variableFields)}`
            : ""
        })`;
      } else {
        const { data: reqData, ...configWithoutData } = restConfig;
        code = `axios.${method.toLowerCase()}(${url}${
          reqData ? `, ${reqData}` : ", undefined"
        }${
          Object.keys(configWithoutData).length
            ? `, ${formatJsonVariables(restConfig, variableFields)}`
            : ""
        })`;
      }

      this.$emit("update:modelValue", code);
    },
    addHeader() {
      this.headers.push({ name: "", value: "" });
    },
    removeHeader(index) {
      this.headers.splice(index, 1);
      this.updateHeaders();
    },
    updateHeaders() {
      this.localConfig.headers = this.headers.reduce((acc, header) => {
        if (header.name) {
          // 如果值是变量引用（不带引号），直接使用
          if (
            header.value &&
            !header.value.startsWith('"') &&
            !header.value.endsWith('"')
          ) {
            acc[header.name] = header.value;
          } else {
            // ��则尝试解析JSON，如果失败则使用原始值
            try {
              acc[header.name] = JSON.parse(header.value);
            } catch (e) {
              acc[header.name] = header.value;
            }
          }
        }
        return acc;
      }, {});
      this.updateConfig();
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newValue) {
        if (typeof newValue === "string") {
          // 如果是字符串，明是编辑现有的配置
          try {
            const config = JSON.parse(newValue);
            this.localConfig = {
              ...this.localConfig,
              ...config,
            };
            this.headers = Object.entries(config.headers || {}).map(
              ([name, value]) => ({ name, value })
            );
          } catch (e) {
            // 如果解析失败，保持当前状态
          }
        } else {
          this.localConfig = {
            ...this.localConfig,
            ...newValue,
          };
          this.headers = Object.entries(this.localConfig.headers || {}).map(
            ([name, value]) => ({ name, value })
          );
        }
      },
    },
  },
});
</script>
