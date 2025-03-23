<template>
  <div class="row q-col-gutter-sm axios-config-editor">
    <!-- 基础配置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            v-model="argvs.method"
            :options="methods"
            label="请求方法"
            dense
            filled
            emit-value
            map-options
            options-dense
            @update:model-value="updateArgvs('method', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="send" />
            </template>
          </q-select>
        </div>
        <div class="col">
          <VariableInput
            :model-value="argvs.url"
            @update:model-value="updateArgvs('url', $event)"
            label="请求地址"
            icon="link"
            class="col-grow"
          />
        </div>
      </div>
    </div>
    <!-- 响应设置 -->
    <div class="col-12">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey q-py-none"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        inline-label
      >
        <q-tab
          v-for="tab in visibleTabs"
          :key="tab.name"
          :name="tab.name"
          class="q-px-xs text-caption"
          style="min-height: 32px"
        >
          <template v-slot:default>
            <div class="row items-center no-wrap">
              <q-icon :name="tab.icon" size="16px" />
              <div class="text-caption q-ml-xs" style="font-size: 11px">
                {{ tab.label }}
              </div>
            </div>
          </template>
        </q-tab>
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="q-px-none">
        <!-- Headers tab -->
        <q-tab-panel name="headers" class="q-pa-none q-pt-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-select
                v-model="argvs.headers['Content-Type']"
                label="Content-Type"
                dense
                filled
                emit-value
                map-options
                options-dense
                :options="contentTypes"
                @update:model-value="
                  updateArgvs('headers.Content-Type', $event)
                "
              >
                <template v-slot:prepend>
                  <q-icon name="data_object" />
                </template>
              </q-select>
            </div>

            <div class="col">
              <VariableInput
                :model-value="argvs.headers['User-Agent']"
                @update:model-value="updateArgvs('headers.User-Agent', $event)"
                label="User Agent"
                :options="{
                  items: userAgentOptions,
                }"
                icon="devices"
                class="col-grow"
              />
            </div>

            <div class="col-12">
              <DictEditor
                v-model="argvs.otherHeaders"
                :options="{
                  optionKeys: commonHeaderOptions,
                }"
                @update:model-value="updateHeaders"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 请求体和URL参数 tabs -->
        <q-tab-panel
          v-if="hasRequestData"
          name="data"
          class="q-pa-none q-pt-sm"
        >
          <div class="row q-col-gutter-sm">
            <div class="col-auto">
              <span class="text-caption">RAW</span>
              <q-toggle
                v-model="argvs.isReqDataRaw"
                @update:model-value="handleReqRawUpdate"
              />
            </div>
            <div class="col">
              <VariableInput
                v-model="argvs.data"
                v-if="argvs.isReqDataRaw"
                label="原始请求体"
                icon="text_fields"
                @update:model-value="updateArgvs('data', $event)"
              />
              <DictEditor
                v-model="argvs.data"
                @update:model-value="updateArgvs('data', $event)"
                v-else
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="params" class="q-pa-none q-pt-sm">
          <DictEditor
            v-model="argvs.params"
            @update:model-value="updateArgvs('params', $event)"
          />
        </q-tab-panel>

        <!-- 其他通用 panels -->
        <template v-for="panel in commonPanels" :key="panel.name">
          <q-tab-panel :name="panel.name" class="q-pa-none q-pt-sm">
            <div class="row q-col-gutter-sm">
              <div
                v-for="field in panel.fields"
                :key="field.key"
                :class="field.colClass || 'col-4'"
              >
                <component
                  :is="field.component"
                  :model-value="getFieldValue(field.key)"
                  v-bind="field.props"
                  @update:model-value="(val) => setFieldValue(field.key, val)"
                />
              </div>
            </div>
          </q-tab-panel>
        </template>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import { stringifyArgv } from "js/composer/formatString";
import {
  userAgent,
  commonHeaders,
  contentTypes,
  methods,
  responseTypes,
} from "js/options/httpOptions";
import { newVarInputVal } from "js/composer/varInputValManager";

export default defineComponent({
  name: "AxiosConfigEditor",
  components: {
    VariableInput,
    DictEditor,
    NumberInput,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      methods,
      userAgentOptions: userAgent,
      contentTypes,
      commonHeaderOptions: commonHeaders
        .filter((h) => !["User-Agent", "Content-Type"].includes(h.value))
        .map((h) => h.value),
      activeTab: "headers",
      defaultArgvs: {
        url: newVarInputVal("str"),
        method: "GET",
        headers: {
          "User-Agent": newVarInputVal("str", userAgent[0].value),
          "Content-Type": contentTypes[0].value,
        },
        otherHeaders: {},
        params: {},
        data: {},
        isReqDataRaw: false,
        timeout: 0,
        maxRedirects: 5,
        responseType: "json",
        auth: {
          username: newVarInputVal("str"),
          password: newVarInputVal("str"),
        },
      },
      proxy: {
        host: newVarInputVal("str"),
        port: null,
        auth: {
          username: newVarInputVal("str"),
          password: newVarInputVal("str"),
        },
      },
      commonPanels: [
        {
          name: "response",
          fields: [
            {
              key: "responseType",
              component: "q-select",
              props: {
                label: "响应类型",
                filled: true,
                dense: true,
                "emit-value": true,
                "map-options": true,
                options: responseTypes,
                "prepend-icon": "data_object",
              },
            },
            {
              key: "maxRedirects",
              component: "NumberInput",
              props: {
                label: "最大重定向次数",
                icon: "repeat",
              },
            },
            {
              key: "timeout",
              component: "NumberInput",
              props: {
                label: "超时时间(ms)",
                icon: "timer",
              },
            },
          ],
        },
        {
          name: "auth",
          fields: [
            {
              key: "auth.username",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "用户名",
                icon: "person",
                class: "col-grow",
              },
            },
            {
              key: "auth.password",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "密码",
                icon: "password",
                class: "col-grow",
              },
            },
          ],
        },
        {
          name: "proxy",
          fields: [
            {
              key: "proxy.host",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "主机",
                icon: "dns",
                class: "col-grow",
              },
            },
            {
              key: "proxy.port",
              component: "NumberInput",
              colClass: "col-6",
              props: {
                label: "端口",
                icon: "router",
                class: "col-grow",
              },
            },
            {
              key: "proxy.auth.username",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "用户名",
                icon: "person",
                class: "col-grow",
              },
            },
            {
              key: "proxy.auth.password",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "密码",
                icon: "password",
                class: "col-grow",
              },
            },
          ],
        },
      ],
      tabs: [
        {
          name: "headers",
          icon: "list_alt",
          label: "请求头",
        },
        {
          name: "data",
          icon: "data_object",
          label: "请求体",
          condition: () => this.hasRequestData,
        },
        {
          name: "params",
          icon: "link",
          label: "URL参数",
        },
        {
          name: "response",
          icon: "settings",
          label: "响应",
        },
        {
          name: "auth",
          icon: "security",
          label: "认证",
        },
        {
          name: "proxy",
          icon: "dns",
          label: "代理",
        },
      ],
    };
  },
  computed: {
    argvs() {
      return this.modelValue.argvs || this.defaultArgvs;
    },
    hasRequestData() {
      return ["PUT", "POST", "PATCH"].includes(this.argvs.method);
    },
    visibleTabs() {
      return this.tabs.filter((tab) => !tab.condition || tab.condition());
    },
  },
  methods: {
    // 从参数生成代码
    generateCode(argvs = this.argvs) {
      const { url, method, data, isReqDataRaw, otherHeaders, ...restConfig } =
        argvs;
      restConfig.headers = {
        ...restConfig.headers,
        ...otherHeaders,
      };
      if (!url) return;

      const configStr = Object.keys(restConfig).length
        ? `, ${stringifyArgv(restConfig)}`
        : "";

      return `${this.modelValue.value}.${method.toLowerCase()}(${stringifyArgv(
        url
      )}${this.hasRequestData ? `, ${stringifyArgv(data)}` : ""}${configStr})`;
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs };
      const keys = key.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], argvs);
      target[lastKey] = value;

      // 特殊处理
      if (key === "method") {
        if (!this.hasRequestData) {
          argvs.data = {};
        }
      }

      this.updateModelValue(argvs);
    },
    updateHeaders(headers) {
      // 保留 Content-Type 和 User-Agent
      const { "Content-Type": contentType, "User-Agent": userAgent } =
        this.argvs.headers;

      // 将普通字符串值转换为对象格式
      const formattedHeaders = Object.entries(headers).reduce(
        (acc, [key, value]) => {
          acc[key] =
            typeof value === "string" ? newVarInputVal("str", value) : value;
          return acc;
        },
        {}
      );

      // 重置 headers，只保留特殊字段
      const newHeaders = {
        "Content-Type": contentType,
        ...(userAgent ? { "User-Agent": userAgent } : {}),
        ...formattedHeaders,
      };

      this.updateArgvs("headers", newHeaders);
    },
    setUserAgent(value) {
      this.updateArgvs("headers.User-Agent", newVarInputVal("str", value));
    },
    getFieldValue(path) {
      return path.split(".").reduce((obj, key) => obj?.[key], this.argvs);
    },
    setFieldValue(path, value) {
      this.updateArgvs(path, value);
    },
    getSummary(argvs) {
      return argvs.method + " " + argvs.url.value;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        argvs,
        code: this.generateCode(argvs),
      });
    },
    handleReqRawUpdate(isRaw) {
      isRaw
        ? this.updateArgvs("data", newVarInputVal("str"))
        : this.updateArgvs("data", {});
    },
  },
  mounted() {
    const argvs = this.modelValue.argvs || this.defaultArgvs;
    if (!this.modelValue.code) {
      this.updateModelValue(argvs);
    }
  },
});
</script>

<style scoped>
.axios-config-editor :deep(.q-tab-panel) {
  overflow: hidden;
}
</style>
