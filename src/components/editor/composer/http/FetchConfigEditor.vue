<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础配置 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfig.url"
        label="请求地址"
        :command="{ icon: 'link' }"
        @update:model-value="updateConfig"
      />
    </div>

    <div class="col-12">
      <q-select
        v-model="localConfig.method"
        :options="['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']"
        label="请求方法"
        dense
        outlined
        emit-value
        map-options
        @update:model-value="updateConfig"
      >
        <template v-slot:prepend>
          <q-icon name="send" />
        </template>
      </q-select>
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

    <!-- 请求体 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfig.body"
        label="请求体"
        :command="{ icon: 'data_object' }"
        @update:model-value="updateConfig"
      />
    </div>

    <!-- 重定向策略 -->
    <div class="col-12">
      <q-select
        v-model="localConfig.redirect"
        :options="['follow', 'error', 'manual']"
        label="重定向策略"
        dense
        outlined
        emit-value
        map-options
        @update:model-value="updateConfig"
      >
        <template v-slot:prepend>
          <q-icon name="alt_route" />
        </template>
      </q-select>
    </div>

    <!-- 其他选项 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <VariableInput
            v-model="localConfig.follow"
            label="最大重定向次数"
            :command="{ icon: 'repeat', inputType: 'number' }"
            @update:model-value="updateConfig"
          />
        </div>
        <div class="col-6">
          <VariableInput
            v-model="localConfig.timeout"
            label="超时时间(ms)"
            :command="{ icon: 'timer', inputType: 'number' }"
            @update:model-value="updateConfig"
          />
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <VariableInput
            v-model="localConfig.size"
            label="最大响应大小(bytes)"
            :command="{ icon: 'data_usage', inputType: 'number' }"
            @update:model-value="updateConfig"
          />
        </div>
        <div class="col-6">
          <q-checkbox
            v-model="localConfig.compress"
            label="启用压缩"
            @update:model-value="updateConfig"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../VariableInput.vue";
import HeaderEditor from "./HeaderEditor.vue";

export default defineComponent({
  name: "FetchConfigEditor",
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
        const match = this.modelValue.match(/fetch\([^{]*({\s*[^]*})\s*\)/);
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
        body: "",
        redirect: "follow",
        follow: 20,
        timeout: 0,
        size: 0,
        compress: true,
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
      const { url, body, headers, ...init } = config;
      if (!url) return;

      // 处理请求体
      if (body) {
        init.body = body;
      }

      // 处理headers
      if (headers && Object.keys(headers).length) {
        init.headers = headers;
      }

      const variableFields = [
        "headers",
        "body",
        "redirect",
        "follow",
        "timeout",
        "size",
      ];
      const code = `fetch(${url}${
        Object.keys(init).length
          ? `, ${formatJsonVariables(init, variableFields)}`
          : ""
      })`;

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
            // 否则尝试解析JSON，如果失败则使用原始值
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
          // 如果是字符串，说明是编辑现有的配置
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
