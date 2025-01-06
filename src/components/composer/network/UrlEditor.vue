<template>
  <div class="url-editor">
    <!-- 操作类型选择 -->
    <OperationCard
      :model-value="argvs.operation"
      @update:model-value="(val) => updateArgvs('operation', val)"
      :options="operations"
    />

    <!-- 操作配置 -->
    <div class="operation-options q-mt-sm">
      <div class="options-container">
        <!-- URL 输入 -->
        <template v-if="needsUrlInput">
          <VariableInput
            :model-value="argvs.url"
            @update:model-value="(val) => updateArgvs('url', val)"
            label="URL"
            icon="link"
          />
        </template>

        <!-- 查询字符串输入 -->
        <template
          v-if="
            argvs.operation === 'parseQuery' ||
            argvs.operation === 'formatQuery'
          "
        >
          <template v-if="argvs.operation === 'parseQuery'">
            <VariableInput
              :model-value="argvs.query"
              @update:model-value="(val) => updateArgvs('query', val)"
              label="查询字符串"
              icon="search"
            />
          </template>
          <template v-else>
            <DictEditor
              :model-value="argvs.queryParams"
              @update:model-value="(val) => updateArgvs('queryParams', val)"
            />
          </template>
        </template>

        <!-- 参数操作的参数输入 -->
        <template
          v-if="
            ['getQueryParam', 'addQueryParam', 'removeQueryParam'].includes(
              argvs.operation
            )
          "
        >
          <VariableInput
            :model-value="argvs.param"
            @update:model-value="(val) => updateArgvs('param', val)"
            label="参数名"
            icon="key"
            class="q-mt-sm"
          />
          <template v-if="argvs.operation === 'addQueryParam'">
            <div class="q-mt-sm">
              <VariableInput
                :model-value="argvs.value"
                @update:model-value="(val) => updateArgvs('value', val)"
                label="参数值"
                icon="text_fields"
              />
            </div>
          </template>
        </template>

        <!-- 主机名输入 -->
        <template v-if="argvs.operation === 'parseHost'">
          <VariableInput
            :model-value="argvs.host"
            @update:model-value="(val) => updateArgvs('host', val)"
            label="主机名"
            icon="dns"
          />
        </template>

        <!-- 路径输入 -->
        <template v-if="argvs.operation === 'parsePath'">
          <VariableInput
            :model-value="argvs.path"
            @update:model-value="(val) => updateArgvs('path', val)"
            label="路径"
            icon="folder"
          />
        </template>

        <!-- URL 对象输入 -->
        <template v-if="argvs.operation === 'format'">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.protocol"
                @update:model-value="(val) => updateUrlObject('protocol', val)"
                label="协议"
                icon="security"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.auth"
                @update:model-value="(val) => updateUrlObject('auth', val)"
                label="认证信息"
                icon="person"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.hostname"
                @update:model-value="(val) => updateUrlObject('hostname', val)"
                label="主机名"
                icon="dns"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.port"
                @update:model-value="(val) => updateUrlObject('port', val)"
                label="端口"
                icon="settings_ethernet"
              />
            </div>
            <div class="col-12">
              <VariableInput
                :model-value="argvs.urlObject.pathname"
                @update:model-value="(val) => updateUrlObject('pathname', val)"
                label="路径"
                icon="folder"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.search"
                @update:model-value="(val) => updateUrlObject('search', val)"
                label="查询字符串"
                icon="search"
              />
            </div>
            <div class="col-12 col-sm-6">
              <VariableInput
                :model-value="argvs.urlObject.hash"
                @update:model-value="(val) => updateUrlObject('hash', val)"
                label="锚点"
                icon="tag"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyArgv, parseFunction } from "js/composer/formatString";
import VariableInput from "components/composer/common/VariableInput.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import OperationCard from "components/composer/common/OperationCard.vue";

export default defineComponent({
  name: "UrlEditor",
  components: {
    VariableInput,
    DictEditor,
    OperationCard,
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
      operations: [
        { value: "parse", label: "解析URL", icon: "link_off" },
        { value: "format", label: "格式化URL", icon: "link" },
        { value: "parseQuery", label: "解析查询字符串", icon: "search" },
        { value: "formatQuery", label: "格式化查询字符串", icon: "edit" },
        { value: "parsePath", label: "解析路径", icon: "folder_open" },
        { value: "parseHost", label: "解析主机名", icon: "dns" },
        { value: "getQueryParam", label: "获取参数", icon: "find_in_page" },
        { value: "addQueryParam", label: "添加参数", icon: "add_circle" },
        { value: "removeQueryParam", label: "移除参数", icon: "remove_circle" },
        { value: "isAbsolute", label: "检查绝对URL", icon: "check_circle" },
        { value: "parseComponents", label: "解析组成部分", icon: "category" },
      ],
      defaultArgvs: {
        operation: "parse",
        url: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        query: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        queryParams: {},
        param: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        value: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        host: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        path: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        urlObject: {
          protocol: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          auth: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          hostname: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          port: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          pathname: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          search: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
          hash: {
            value: "",
            isString: true,
            __varInputVal__: true,
          },
        },
      },
    };
  },
  computed: {
    argvs: {
      get() {
        return (
          this.modelValue.argvs ||
          this.parseCodeToArgvs(this.modelValue.code) || {
            ...this.defaultArgvs,
          }
        );
      },
      set(value) {
        this.updateModelValue(value);
      },
    },
    needsUrlInput() {
      return [
        "parse",
        "getQueryParam",
        "addQueryParam",
        "removeQueryParam",
        "isAbsolute",
        "parseComponents",
      ].includes(this.argvs.operation);
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      switch (argvs.operation) {
        case "parse":
        case "isAbsolute":
        case "parseComponents":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.url
          )})`;

        case "format":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.urlObject
          )})`;

        case "parseQuery":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.query
          )})`;

        case "formatQuery":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.queryParams
          )})`;

        case "parsePath":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.path
          )})`;

        case "parseHost":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.host
          )})`;

        case "getQueryParam":
        case "removeQueryParam":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.url
          )}, ${stringifyArgv(argvs.param)})`;

        case "addQueryParam":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyArgv(
            argvs.url
          )}, ${stringifyArgv(argvs.param)}, ${stringifyArgv(argvs.value)})`;

        default:
          return `${this.modelValue.value}.${argvs.operation}()`;
      }
    },
    parseCodeToArgvs(code) {
      if (!code) return null;

      try {
        const variableFormatPaths = ["arg*", "arg*.**"];

        const result = parseFunction(code, { variableFormatPaths });
        if (!result) return this.defaultArgvs;

        const operation = result.name.split(".").pop();
        const [firstArg, secondArg, thirdArg] = result.argvs;

        const newArgvs = {
          ...this.defaultArgvs,
          operation,
        };

        switch (operation) {
          case "parse":
          case "isAbsolute":
          case "parseComponents":
            newArgvs.url = firstArg;
            break;

          case "format":
            newArgvs.urlObject = firstArg || this.defaultArgvs.urlObject;
            break;

          case "parseQuery":
            newArgvs.query = firstArg;
            break;

          case "formatQuery":
            if (firstArg) {
              newArgvs.queryParams = firstArg;
            }
            break;

          case "parsePath":
            newArgvs.path = firstArg;
            break;

          case "parseHost":
            newArgvs.host = firstArg;
            break;

          case "getQueryParam":
          case "removeQueryParam":
            newArgvs.url = firstArg;
            newArgvs.param = secondArg;
            break;

          case "addQueryParam":
            newArgvs.url = firstArg;
            newArgvs.param = secondArg;
            newArgvs.value = thirdArg;
            break;
        }

        return newArgvs;
      } catch (e) {
        console.error("解析URL参数失败:", e);
        return this.defaultArgvs;
      }
    },
    updateArgvs(key, value) {
      this.argvs = {
        ...this.argvs,
        [key]: value,
      };
    },
    updateUrlObject(key, value) {
      this.updateArgvs("urlObject", {
        ...this.argvs.urlObject,
        [key]: value,
      });
    },
    getSummary(argvs) {
      const op = this.operations.find(
        (op) => op.value === argvs.operation
      )?.label;
      return op + " " + argvs.url.value;
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
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.defaultArgvs);
    }
  },
});
</script>

<style scoped>
.url-editor {
  display: flex;
  flex-direction: column;
}

.options-container {
  min-height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
