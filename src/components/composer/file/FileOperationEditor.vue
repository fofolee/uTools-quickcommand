<template>
  <div class="file-operation-editor">
    <!-- 操作类型选择 -->
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
        <q-tab name="read" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="file_open" size="16px" />
            <div class="q-ml-xs">读取</div>
          </div>
        </q-tab>
        <q-tab name="write" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="save" size="16px" />
            <div class="q-ml-xs">写入</div>
          </div>
        </q-tab>
        <q-tab name="list" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="folder_open" size="16px" />
            <div class="q-ml-xs">列目录</div>
          </div>
        </q-tab>
        <q-tab name="stat" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="info" size="16px" />
            <div class="q-ml-xs">状态</div>
          </div>
        </q-tab>
        <q-tab name="delete" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="delete" size="16px" />
            <div class="q-ml-xs">删除</div>
          </div>
        </q-tab>
        <q-tab name="manage" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="settings" size="16px" />
            <div class="q-ml-xs">管理</div>
          </div>
        </q-tab>
      </q-tabs>
      <q-separator />
    </div>

    <!-- 文件路径输入 -->
    <div class="row q-gutter-sm">
      <VariableInput
        :model-value="argvs.filePath"
        @update:model-value="updateArgvs('filePath', $event)"
        label="文件路径"
        icon="folder"
        class="col-grow"
      />
      <q-btn
        flat
        dense
        round
        icon="folder_open"
        class="self-center"
        @click="selectFile"
      >
        <q-tooltip>选择文件</q-tooltip>
      </q-btn>
    </div>

    <!-- 读取操作配置 -->
    <template v-if="argvs.operation === 'read'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="argvs.encoding"
          :options="encodingOptions"
          label="编码"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('encoding', $event)"
        />
        <q-select
          v-model="argvs.readMode"
          :options="readModeOptions"
          label="读取模式"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('readMode', $event)"
        />
        <q-select
          v-model="argvs.readFlag"
          :options="readFlagOptions"
          label="读取标志"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('readFlag', $event)"
        />
        <NumberInput
          v-if="argvs.readMode === 'start'"
          :model-value="argvs.start"
          @update:model-value="updateArgvs('start', $event)"
          label="起始位置"
          icon="first_page"
          class="col-grow"
        />
        <NumberInput
          v-if="argvs.readMode === 'start'"
          :model-value="argvs.length"
          @update:model-value="updateArgvs('length', $event)"
          label="读取长度"
          icon="last_page"
          class="col-grow"
        />
      </div>
    </template>

    <!-- 写入操作配置 -->
    <template v-if="argvs.operation === 'write'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="argvs.encoding"
          :options="encodingOptions"
          label="编码"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('encoding', $event)"
        />
        <q-select
          v-model="argvs.writeMode"
          :options="writeModeOptions"
          label="写入模式"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('writeMode', $event)"
        />
        <q-select
          v-model="argvs.writeFlag"
          :options="writeFlagOptions"
          label="文件权限"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('writeFlag', $event)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.hint }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="row q-gutter-sm">
        <VariableInput
          :model-value="argvs.content"
          @update:model-value="updateArgvs('content', $event)"
          label="写入内容"
          icon="edit"
          class="col-12"
        />
      </div>
    </template>

    <!-- 删除操作配置 -->
    <template v-if="argvs.operation === 'delete'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="argvs.targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('targetType', $event)"
        />
        <q-checkbox
          v-model="argvs.recursive"
          label="递归删除"
          v-if="argvs.targetType === 'directory'"
          dense
          class="col-grow"
          @update:model-value="updateArgvs('recursive', $event)"
        />
        <q-checkbox
          v-model="argvs.force"
          label="强制删除"
          dense
          class="col-grow"
          @update:model-value="updateArgvs('force', $event)"
        />
      </div>
    </template>

    <!-- 管理操作配置 -->
    <template v-if="argvs.operation === 'manage'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="argvs.targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('targetType', $event)"
        />
        <q-select
          v-model="argvs.manageOperation"
          :options="manageOperationOptions"
          label="管理操作"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('manageOperation', $event)"
        />
      </div>

      <!-- 重命名操作 -->
      <template v-if="argvs.manageOperation === 'rename'">
        <div class="row q-gutter-sm">
          <VariableInput
            :model-value="argvs.newPath"
            @update:model-value="updateArgvs('newPath', $event)"
            label="新路径"
            icon="drive_file_rename_outline"
            class="col-grow"
          />
        </div>
      </template>

      <!-- 修改权限操作 -->
      <template v-if="argvs.manageOperation === 'chmod'">
        <div class="row q-gutter-sm">
          <q-select
            v-model="argvs.mode"
            :options="writeFlagOptions"
            label="文件权限"
            dense
            filled
            class="col-grow"
            emit-value
            map-options
            @update:model-value="updateArgvs('mode', $event)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.hint }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-checkbox
            v-model="argvs.recursive"
            label="递归修改"
            v-if="argvs.targetType === 'directory'"
            dense
            class="col-grow"
            @update:model-value="updateArgvs('recursive', $event)"
          />
        </div>
      </template>

      <!-- 修改所有者操作 -->
      <template v-if="argvs.manageOperation === 'chown'">
        <div class="row q-gutter-sm">
          <NumberInput
            :model-value="argvs.uid"
            @update:model-value="updateArgvs('uid', $event)"
            label="用户ID"
            icon="person"
            class="col-grow"
          />
          <NumberInput
            :model-value="argvs.gid"
            @update:model-value="updateArgvs('gid', $event)"
            label="组ID"
            icon="group"
            class="col-grow"
          />
          <q-checkbox
            v-model="argvs.recursive"
            label="递归修改"
            v-if="argvs.targetType === 'directory'"
            dense
            class="col-grow"
            @update:model-value="updateArgvs('recursive', $event)"
          />
        </div>
      </template>
    </template>

    <!-- 列目录操作配置 -->
    <template v-if="argvs.operation === 'list'">
      <div class="row q-gutter-sm q-px-xs">
        <q-checkbox
          v-model="argvs.recursive"
          label="递归列出子目录"
          dense
          class="col-grow"
          @update:model-value="updateArgvs('recursive', $event)"
        />
        <q-checkbox
          v-model="argvs.showHidden"
          label="显示隐藏文件"
          dense
          class="col-grow"
          @update:model-value="updateArgvs('showHidden', $event)"
        />
      </div>
    </template>

    <!-- 状态操作配置 -->
    <template v-if="argvs.operation === 'stat'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="argvs.targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('targetType', $event)"
        />
        <q-select
          v-model="argvs.statMode"
          :options="statModeOptions"
          label="检查类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('statMode', $event)"
        />
        <q-checkbox
          v-model="argvs.followSymlinks"
          label="跟随符号链接"
          v-if="argvs.statMode === 'status'"
          @update:model-value="updateArgvs('followSymlinks', $event)"
          dense
          class="col-grow"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/ui/VariableInput.vue";
import NumberInput from "components/composer/ui/NumberInput.vue";
import { stringifyObject, parseFunction } from "js/composer/formatString";

// 静态选项数据
const ENCODING_OPTIONS = [
  { label: "UTF-8", value: "utf8" },
  { label: "UTF-16", value: "utf16le" },
  { label: "GB2312", value: "gb2312" },
  { label: "GBK", value: "gbk" },
  { label: "GB18030", value: "gb18030" },
  { label: "Big5", value: "big5" },
  { label: "ASCII", value: "ascii" },
  { label: "Latin1", value: "latin1" },
  { label: "Base64", value: "base64" },
  { label: "Hex", value: "hex" },
];

const READ_MODE_OPTIONS = [
  { label: "全部读取", value: "all" },
  { label: "指定位置", value: "start" },
  { label: "按行读取", value: "line" },
];

const READ_FLAG_OPTIONS = [
  { label: "同步读取", value: "sync" },
  { label: "异步读取", value: "async" },
];

const WRITE_MODE_OPTIONS = [
  { label: "覆盖写入", value: "write" },
  { label: "追加写入", value: "append" },
];

const WRITE_FLAG_OPTIONS = [
  { label: "644", value: "644", hint: "用户读写，组读，其他读" },
  { label: "666", value: "666", hint: "所有人读写" },
  { label: "755", value: "755", hint: "用户读写执行，组和其他读执行" },
  { label: "777", value: "777", hint: "所有人读写执行" },
];

const STAT_MODE_OPTIONS = [
  { label: "检查存在", value: "exists" },
  { label: "完整状态", value: "status" },
];

const TARGET_TYPE_OPTIONS = [
  { label: "文件", value: "file" },
  { label: "目录", value: "directory" },
];

const MANAGE_OPERATION_OPTIONS = [
  { label: "重命名", value: "rename" },
  { label: "修改权限", value: "chmod" },
  { label: "修改所有者", value: "chown" },
];

export default defineComponent({
  name: "FileOperationEditor",
  components: {
    VariableInput,
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
      encodingOptions: ENCODING_OPTIONS,
      readModeOptions: READ_MODE_OPTIONS,
      readFlagOptions: READ_FLAG_OPTIONS,
      writeModeOptions: WRITE_MODE_OPTIONS,
      writeFlagOptions: WRITE_FLAG_OPTIONS,
      statModeOptions: STAT_MODE_OPTIONS,
      targetTypeOptions: TARGET_TYPE_OPTIONS,
      manageOperationOptions: MANAGE_OPERATION_OPTIONS,
      defaultArgvs: {
        operation: "read",
        filePath: {
          value: "",
          isString: true,
          __varInputVal__: true,
        },
        encoding: "utf8",
        readMode: "all",
        readFlag: "async",
        start: 0,
        length: 100,
        targetType: "file",
        writeMode: "write",
        writeFlag: "644",
        statMode: "exists",
        followSymlinks: false,
        recursive: false,
        force: false,
        showHidden: false,
        manageOperation: "rename",
      },
    };
  },
  computed: {
    argvs: {
      get() {
        return (
          this.modelValue.argvs || this.parseCodeToArgvs(this.modelValue.code)
        );
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          argvs: value,
        });
      },
    },
    shouldSelectDirectory() {
      return (
        this.argvs.operation === "list" ||
        (this.argvs.targetType === "directory" &&
          ["delete", "manage", "stat"].includes(this.argvs.operation))
      );
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      const params = {
        operation: argvs.operation,
        filePath: argvs.filePath,
      };

      // 根据不同操作类型添加特定参数
      switch (argvs.operation) {
        case "read":
          params.encoding = argvs.encoding;
          params.readFlag = argvs.readFlag;
          params.readMode = argvs.readMode;
          if (argvs.readMode === "start") {
            params.start = Number(argvs.start) || 0;
            params.length = Number(argvs.length) || 100;
          }
          break;

        case "write":
          params.encoding = argvs.encoding;
          params.content = argvs.content;
          params.flag = argvs.writeMode === "append" ? "a" : "w";
          params.mode = argvs.writeFlag;
          break;

        case "list":
          params.targetType = "directory";
          params.recursive = argvs.recursive;
          break;

        case "delete":
          params.targetType = argvs.targetType;
          params.force = argvs.force;
          params.recursive =
            argvs.recursive && argvs.targetType === "directory";
          break;

        case "manage":
          params.targetType = argvs.targetType;
          params.manageOperation = argvs.manageOperation;
          if (argvs.manageOperation === "rename") {
            params.newPath = argvs.newPath;
          } else {
            if (argvs.mode) params.mode = argvs.mode;
            if (argvs.uid) params.uid = argvs.uid;
            if (argvs.gid) params.gid = argvs.gid;
          }
          break;

        case "stat":
          params.targetType = argvs.targetType;
          params.statMode = argvs.statMode;
          params.followSymlinks = argvs.followSymlinks;
          break;
      }

      return `${this.modelValue.value}(${stringifyObject(params)})`;
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs };
      // 确保数字类型字段的值为数字
      if (key === "start" || key === "length") {
        argvs[key] = Number(value) || 0;
      } else {
        argvs[key] = value;
      }

      // 特殊处理
      if (key === "operation") {
        switch (value) {
          case "list":
            argvs.targetType = "directory";
            break;
          case "stat":
          case "delete":
          case "manage":
            argvs.targetType = "file";
            break;
        }
      }

      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs,
        code: this.generateCode(argvs),
      });
    },
    async selectFile() {
      const result = window.utools.showOpenDialog({
        title: "选择文件",
        properties: [
          this.shouldSelectDirectory ? "openDirectory" : "openFile",
          "showHiddenFiles",
        ],
        buttonLabel: "选择",
      });
      if (result && result[0]) {
        this.updateArgvs("filePath", {
          value: result[0],
          isString: true,
          __varInputVal__: true,
        });
      }
    },
    updateMode() {
      const modeMap = {
        read: 4,
        write: 2,
        execute: 1,
      };

      const calculateMode = (perms) => {
        return perms.reduce((sum, perm) => sum + modeMap[perm], 0);
      };

      const ownerValue = calculateMode(this.argvs.ownerMode);
      const groupValue = calculateMode(this.argvs.groupMode);
      const otherValue = calculateMode(this.argvs.otherMode);

      this.argvs.mode = `${ownerValue}${groupValue}${otherValue}`;
      this.updateArgvs();
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      try {
        const variableFormatPaths = [
          "arg0.filePath",
          "arg0.content",
          "arg0.newPath",
        ];
        const result = parseFunction(code, { variableFormatPaths });
        let params = result.args[0];

        // 根据不同操作类型处理特定参数
        switch (params.operation) {
          case "read":
            if (params.readMode === "start") {
              params.start = Number(params.start) || 0;
              params.length = Number(params.length) || 100;
            }
            break;

          case "write":
            // 将 flag 转换回 writeMode
            params.writeMode = params.flag === "a" ? "append" : "write";
            // 将 mode 转换回 writeFlag
            params.writeFlag = params.mode;
            break;

          case "list":
            params.targetType = "directory";
            break;

          case "delete":
          case "manage":
          case "stat":
            // 这些操作的参数可以直接使用
            break;
        }

        return params;
      } catch (e) {
        console.error("解析文件操作参数失败:", e);
      }
      return argvs;
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs: this.defaultArgvs,
        code: this.generateCode(this.defaultArgvs),
      });
    }
  },
});
</script>

<style scoped>
.file-operation-editor {
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

.col-grow {
  flex: 1 1 0;
  min-width: 150px;
}

@media (max-width: 600px) {
  .col-grow {
    flex: 1 1 calc(50% - 8px);
    max-width: none;
  }
}
</style>
