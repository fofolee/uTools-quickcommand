<template>
  <div class="dns-editor">
    <!-- 操作类型选择 -->
    <div class="operation-cards">
      <div
        v-for="op in operations"
        :key="op.name"
        :class="['operation-card', { active: argvs.operation === op.name }]"
        @click="updateArgvs('operation', op.name)"
        :data-value="op.name"
      >
        <q-icon
          :name="op.icon"
          size="16px"
          :color="argvs.operation === op.name ? 'primary' : 'grey'"
        />
        <div class="text-caption">{{ op.label }}</div>
      </div>
    </div>

    <!-- 操作配置 -->
    <div class="operation-options">
      <div class="options-container row">
        <!-- 主机名输入 -->
        <VariableInput
          :model-value="argvs.hostname"
          @update:model-value="(val) => updateArgvs('hostname', val)"
          label="主机名"
          icon="dns"
          class="col"
        />

        <!-- IP地址输入 -->
        <VariableInput
          :model-value="argvs.ip"
          @update:model-value="(val) => updateArgvs('ip', val)"
          label="IP地址"
          icon="router"
          v-if="argvs.operation === 'reverseResolve'"
        />

        <!-- lookup 选项 -->
        <div
          class="row items-center col-5"
          v-if="argvs.operation === 'lookupHost'"
        >
          <div class="col-6">
            <q-select
              :model-value="argvs.options.family"
              @update:model-value="(val) => updateArgvs('options.family', val)"
              :options="families"
              label="IP版本"
              dense
              filled
              emit-value
              map-options
              options-dense
            />
          </div>
          <div class="col-6 q-px-sm">
            <q-toggle
              :model-value="argvs.options.all"
              @update:model-value="(val) => updateArgvs('options.all', val)"
              label="返回所有地址"
              dense
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { stringifyObject, parseFunction } from "js/composer/formatString";
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "DnsEditor",
  components: {
    VariableInput,
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
        { name: "lookupHost", label: "DNS查询", icon: "search" },
        { name: "resolveAll", label: "解析所有记录", icon: "all_inclusive" },
        { name: "resolveIpv4", label: "解析IPv4", icon: "filter_4" },
        { name: "resolveIpv6", label: "解析IPv6", icon: "filter_6" },
        { name: "resolveMxRecords", label: "解析MX记录", icon: "mail" },
        {
          name: "resolveTxtRecords",
          label: "解析TXT记录",
          icon: "text_fields",
        },
        { name: "resolveNsRecords", label: "解析NS记录", icon: "dns" },
        { name: "resolveCnameRecords", label: "解析CNAME记录", icon: "link" },
        { name: "reverseResolve", label: "反向解析", icon: "swap_horiz" },
      ],
      families: [
        { label: "自动", value: 0 },
        { label: "IPv4", value: 4 },
        { label: "IPv6", value: 6 },
      ],
      defaultArgvs: {
        operation: "lookupHost",
        hostname: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        ip: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        options: {
          family: 0,
          all: false,
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
    needsHostname() {
      return this.argvs.operation !== "reverseResolve";
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      switch (argvs.operation) {
        case "lookupHost":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyObject(
            argvs.hostname
          )}, ${stringifyObject(argvs.options)})`;

        case "reverseResolve":
          return `${this.modelValue.value}.${argvs.operation}(${stringifyObject(
            argvs.ip
          )})`;

        default:
          return `${this.modelValue.value}.${argvs.operation}(${stringifyObject(
            argvs.hostname
          )})`;
      }
    },
    parseCodeToArgvs(code) {
      if (!code) return null;

      try {
        // 定义需要使用variable格式的路径
        const variableFormatPaths = [
          "arg0", // 主机名/IP参数
          "arg1.**", // options对象的所有属性
        ];

        // 使用 parseFunction 解析代码
        const result = parseFunction(code, { variableFormatPaths });
        if (!result) return this.defaultArgvs;

        const operation = result.name.split(".").pop();
        const [firstArg, secondArg] = result.args;

        const newArgvs = {
          ...this.defaultArgvs,
          operation,
        };

        if (operation === "reverseResolve") {
          newArgvs.ip = firstArg;
        } else {
          newArgvs.hostname = firstArg;
          if (operation === "lookupHost" && secondArg) {
            newArgvs.options = {
              family: secondArg.family ?? this.defaultArgvs.options.family,
              all: secondArg.all ?? this.defaultArgvs.options.all,
            };
          }
        }

        return newArgvs;
      } catch (e) {
        console.error("解析DNS参数失败:", e);
        return this.defaultArgvs;
      }
    },
    updateArgvs(key, value) {
      this.argvs = {
        ...this.argvs,
        [key]: value,
      };
    },
    getSummary(argvs) {
      const op = this.operations.find(
        (op) => op.name === argvs.operation
      )?.label;
      return op === "反向解析"
        ? "反向解析 " + argvs.ip.value
        : op + " " + argvs.hostname.value;
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
  watch: {
    "argvs.operation": {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          document
            .querySelector(`.operation-card[data-value="${newVal}"]`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
        });
      },
    },
  },
});
</script>

<style scoped>
.dns-editor {
  display: flex;
  flex-direction: column;
}

.options-container {
  min-height: 32px;
  gap: 8px;
  padding-top: 8px;
}

.command-composer .operation-card {
  min-width: 95px;
}
</style>
