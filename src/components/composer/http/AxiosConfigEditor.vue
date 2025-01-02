<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础配置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            v-model="localConfig.method"
            :options="methods"
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
        <q-tab-panel name="headers" class="q-pa-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-select
                v-model="localConfig.headers['Content-Type']"
                label="Content-Type"
                dense
                filled
                emit-value
                map-options
                :options="contentTypes"
                @update:model-value="updateConfig"
              >
                <template v-slot:prepend>
                  <q-icon name="data_object" />
                </template>
              </q-select>
            </div>

            <div class="col">
              <VariableInput
                v-model="localConfig.headers['User-Agent']"
                label="User Agent"
                :command="{ icon: 'devices' }"
                @update:model-value="updateConfig"
              />
            </div>
            <div class="col-auto flex items-center">
              <q-btn-dropdown flat dense dropdown-icon="menu">
                <q-list>
                  <q-item
                    v-for="ua in userAgentOptions"
                    :key="ua.value"
                    clickable
                    v-close-popup
                    @click="setUserAgent(ua.value)"
                  >
                    <q-item-section>
                      <q-item-label>{{ ua.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <div class="col-12">
              <DictEditor
                v-model="otherHeaders"
                :options="{
                  items: commonHeaderOptions,
                }"
                @update:model-value="updateHeaders"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 请求体和URL参数 tabs -->
        <q-tab-panel v-if="hasRequestData" name="data" class="q-pa-sm">
          <DictEditor
            v-model="localConfig.data"
            @update:model-value="updateConfig"
          />
        </q-tab-panel>

        <q-tab-panel name="params" class="q-pa-sm">
          <DictEditor
            v-model="localConfig.params"
            @update:model-value="updateConfig"
          />
        </q-tab-panel>

        <!-- 其他通用 panels -->
        <template v-for="panel in commonPanels" :key="panel.name">
          <q-tab-panel :name="panel.name" class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <div
                v-for="field in panel.fields"
                :key="field.key"
                :class="field.colClass || 'col-4'"
              >
                <component
                  :is="field.component"
                  :modelValue="getFieldValue(field.key)"
                  v-bind="field.props"
                  @update:modelValue="(val) => setFieldValue(field.key, val)"
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
import VariableInput from "components/composer/ui/VariableInput.vue";
import DictEditor from "components/composer/ui/DictEditor.vue";
import { formatJsonVariables } from "js/composer/formatString";
import {
  userAgent,
  commonHeaders,
  contentTypes,
  methods,
  responseTypes,
} from "js/options/httpOptions";

export default defineComponent({
  name: "AxiosConfigEditor",
  components: {
    VariableInput,
    DictEditor,
  },
  props: {
    modelValue: {
      type: [Object, String],
      default: () => ({}),
    },
    command: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  data() {
    let initialConfig = {};
    if (typeof this.modelValue === "string") {
      try {
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
        headers: {
          "User-Agent": userAgent[0].value,
          "Content-Type": contentTypes[0].value,
        },
        params: {},
        data: {},
        timeout: 0,
        maxRedirects: 5,
        responseType: "json",
        auth: {
          username: "",
          password: "",
        },
        proxy: {
          host: "",
          port: "",
          auth: {
            username: "",
            password: "",
          },
        },
        ...initialConfig,
      },
      methods,
      userAgentOptions: userAgent,
      contentTypes,
      commonHeaderOptions: commonHeaders
        .filter((h) => !["User-Agent", "Content-Type"].includes(h.value))
        .map((h) => h.value),
      otherHeaders: {},
      activeTab: "headers",
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
              component: "VariableInput",
              props: {
                label: "最大重定向次数",
                command: { icon: "repeat", inputType: "number" },
              },
            },
            {
              key: "timeout",
              component: "VariableInput",
              props: {
                label: "超时时间(ms)",
                command: { icon: "timer", inputType: "number" },
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
                command: { icon: "person" },
              },
            },
            {
              key: "auth.password",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "密码",
                command: { icon: "password" },
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
                command: { icon: "dns" },
              },
            },
            {
              key: "proxy.port",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "端口",
                command: { icon: "router", inputType: "number" },
              },
            },
            {
              key: "proxy.auth.username",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "用户名",
                command: { icon: "person" },
              },
            },
            {
              key: "proxy.auth.password",
              component: "VariableInput",
              colClass: "col-6",
              props: {
                label: "密码",
                command: { icon: "password" },
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
  created() {
    // 将headers对象转换为数组形式
    this.headers = Object.entries(this.localConfig.headers || {}).map(
      ([name, value]) => ({ name, value })
    );
  },
  computed: {
    hasRequestData() {
      return ["PUT", "POST", "PATCH"].includes(this.localConfig.method);
    },
    visibleTabs() {
      return this.tabs.filter((tab) => !tab.condition || tab.condition());
    },
  },
  methods: {
    updateConfig() {
      // 生成代码
      const { method = "GET", url, data, ...restConfig } = this.localConfig;
      if (!url) return;

      // 这两个字段非VariableInput获取，不进行处理
      const excludeFields = ["headers.Content-Type", "responseType"];
      const configStr = Object.keys(restConfig).length
        ? `, ${formatJsonVariables(restConfig, null, excludeFields)}`
        : "";

      const code = `${this.command.value}(${url}${
        this.hasRequestData ? `, ${formatJsonVariables(data)}` : ""
      }${configStr})`;

      this.$emit("update:modelValue", code);
    },
    updateHeaders(headers) {
      // 保留 Content-Type 和 User-Agent
      const { "Content-Type": contentType, "User-Agent": userAgent } =
        this.localConfig.headers;
      // 重置 headers，只保留特殊字段
      this.localConfig.headers = {
        "Content-Type": contentType,
        ...(userAgent ? { "User-Agent": userAgent } : {}),
        ...headers,
      };
      this.updateConfig();
    },
    setUserAgent(value) {
      this.localConfig.headers["User-Agent"] = value;
      this.updateConfig();
    },
    getFieldValue(path) {
      return path.split(".").reduce((obj, key) => obj?.[key], this.localConfig);
    },
    setFieldValue(path, value) {
      const keys = path.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], this.localConfig);
      target[lastKey] = value;
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

<style scoped>
.body--dark .q-tab,
.body--dark .q-tab-panel {
  background-color: #303133;
}
</style>
