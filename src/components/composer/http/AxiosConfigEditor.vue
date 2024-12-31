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
    <!-- 响应设置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            v-model="localConfig.responseType"
            filled
            dense
            emit-value
            map-options
            :options="['json', 'text', 'blob', 'arraybuffer']"
            label="响应类型"
            @update:model-value="updateConfig"
          >
            <template v-slot:prepend>
              <q-icon name="data_object" />
            </template>
          </q-select>
        </div>
        <div class="col">
          <VariableInput
            v-model="localConfig.maxRedirects"
            label="最大重定向次数"
            :command="{ icon: 'repeat', inputType: 'number' }"
            @update:model-value="updateConfig"
          />
        </div>
        <div class="col">
          <VariableInput
            v-model="localConfig.timeout"
            label="超时时间(ms)"
            :command="{ icon: 'timer', inputType: 'number' }"
            @update:model-value="updateConfig"
          />
        </div>
      </div>
    </div>

    <!-- Headers -->
    <!-- Content-Type -->
    <q-select
      v-model="localConfig.headers['Content-Type']"
      label="Content-Type"
      dense
      filled
      emit-value
      map-options
      :options="contentTypes"
      class="col-12"
      @update:model-value="updateConfig"
    >
      <template v-slot:prepend>
        <q-icon name="data_object" />
      </template>
    </q-select>
    <!-- User-Agent -->
    <div class="col-12 row q-col-gutter-sm">
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
    </div>

    <!-- 请求体 -->
    <div v-if="hasRequestData" class="col-12">
      <BorderLabel label="请求体" :modelValue="false">
        <DictEditor
          v-model="localConfig.data"
          @update:model-value="updateConfig"
        />
      </BorderLabel>
    </div>

    <!-- Other Headers -->
    <div class="col-12">
      <BorderLabel label="Headers">
        <DictEditor
          v-model="otherHeaders"
          :options="{
            items: commonHeaderOptions,
          }"
          @update:model-value="updateHeaders"
        />
      </BorderLabel>
    </div>

    <!-- 请求参数 -->
    <div class="col-12">
      <BorderLabel label="URL参数">
        <DictEditor
          v-model="localConfig.params"
          @update:model-value="updateConfig"
        />
      </BorderLabel>
    </div>

    <!-- 认证信息 -->
    <div class="col-12">
      <BorderLabel label="HTTP认证">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <VariableInput
              v-model="localConfig.auth.username"
              label="用户名"
              :command="{ icon: 'person' }"
              @update:model-value="updateConfig"
            />
          </div>
          <div class="col-6">
            <VariableInput
              v-model="localConfig.auth.password"
              label="密码"
              :command="{ icon: 'password' }"
              @update:model-value="updateConfig"
            />
          </div>
        </div>
      </BorderLabel>
    </div>

    <!-- 代理设置 -->
    <div class="col-12">
      <BorderLabel label="代理设置">
        <div class="row q-col-gutter-sm">
          <div class="col-3">
            <VariableInput
              v-model="localConfig.proxy.host"
              label="主机"
              :command="{ icon: 'dns' }"
              @update:model-value="updateConfig"
            />
          </div>
          <div class="col-3">
            <VariableInput
              v-model="localConfig.proxy.port"
              label="端口"
              :command="{ icon: 'router', inputType: 'number' }"
              @update:model-value="updateConfig"
            />
          </div>
          <div class="col-3">
            <VariableInput
              v-model="localConfig.proxy.auth.username"
              label="用户名"
              :command="{ icon: 'person' }"
              @update:model-value="updateConfig"
            />
          </div>
          <div class="col-3">
            <VariableInput
              v-model="localConfig.proxy.auth.password"
              label="密码"
              :command="{ icon: 'password' }"
              @update:model-value="updateConfig"
            />
          </div>
        </div>
      </BorderLabel>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/ui/VariableInput.vue";
import DictEditor from "components/composer/ui/DictEditor.vue";
import { formatJsonVariables } from "js/composer/formatString";
import { userAgent, commonHeaders, contentTypes } from "js/options/httpHeaders";
import BorderLabel from "components/composer/ui/BorderLabel.vue";

export default defineComponent({
  name: "AxiosConfigEditor",
  components: {
    VariableInput,
    DictEditor,
    BorderLabel,
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
          "Content-Type": "application/x-www-form-urlencoded",
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
      userAgentOptions: userAgent,
      contentTypes,
      commonHeaderOptions: commonHeaders
        .filter((h) => !["User-Agent", "Content-Type"].includes(h.value))
        .map((h) => h.value),
      otherHeaders: {},
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
