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
        <q-tab name="transfer" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="drive_file_move" size="16px" />
            <div class="q-ml-xs">复制移动</div>
          </div>
        </q-tab>
        <q-tab name="permission" no-caps>
          <div class="row items-center no-wrap">
            <q-icon name="security" size="16px" />
            <div class="q-ml-xs">权限</div>
          </div>
        </q-tab>
      </q-tabs>
      <q-separator />
    </div>

    <!-- 文件路径输入 -->
    <VariableInput
      :model-value="argvs.filePath"
      @update:model-value="updateArgvs('filePath', $event)"
      label="文件路径"
      icon="folder"
      class="col-grow"
      :options="{
        dialog: {
          options: {
            title: '选择文件',
            properties: [
              argvs.operation === 'list' ? 'openDirectory' : 'openFile',
              'showHiddenFiles',
            ],
          },
        },
      }"
    />

    <!-- 读取操作配置 -->
    <template v-if="argvs.operation === 'read'">
      <div class="row q-gutter-sm">
        <q-select
          :model-value="argvs.encoding || 'Buffer'"
          :options="encodingOptions"
          label="编码"
          dense
          options-dense
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
          options-dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateArgvs('readMode', $event)"
        />
        <NumberInput
          v-if="argvs.readMode === 'start'"
          :model-value="argvs.start"
          @update:model-value="updateArgvs('start', $event)"
          label="起始位置"
          icon="first_page"
          class="col"
        />
        <NumberInput
          v-if="argvs.readMode === 'start'"
          :model-value="argvs.length"
          @update:model-value="updateArgvs('length', $event)"
          label="读取长度"
          icon="last_page"
          class="col"
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
          options-dense
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
          options-dense
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
          options-dense
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
          class="col-grow"
        />
      </div>
    </template>

    <!-- 删除操作配置 -->
    <template v-if="argvs.operation === 'delete'">
      <div class="row q-gutter-sm">
        <CheckButton
          v-model="argvs.recursive"
          label="递归删除"
          class="col"
          @update:model-value="updateArgvs('recursive', $event)"
        />
        <CheckButton
          v-model="argvs.force"
          label="强制删除"
          class="col"
          @update:model-value="updateArgvs('force', $event)"
        />
      </div>
    </template>

    <!-- 列目录操作配置 -->
    <template v-if="argvs.operation === 'list'">
      <div class="row q-gutter-sm">
        <CheckButton
          v-model="argvs.recursive"
          label="递归列出子目录"
          class="col"
          @update:model-value="updateArgvs('recursive', $event)"
        />
        <CheckButton
          v-model="argvs.showHidden"
          label="显示隐藏文件"
          class="col"
          @update:model-value="updateArgvs('showHidden', $event)"
        />
      </div>
    </template>

    <!-- 状态操作配置 -->
    <template v-if="argvs.operation === 'stat'">
      <div class="row q-gutter-sm">
        <CheckButton
          v-model="argvs.followSymlinks"
          label="跟随符号链接"
          @update:model-value="updateArgvs('followSymlinks', $event)"
          class="col-grow"
        />
      </div>
    </template>

    <!-- 复制移动操作配置 -->
    <template v-if="argvs.operation === 'transfer'">
      <div class="row q-gutter-sm">
        <div class="col-6">
          <VariableInput
            :model-value="argvs.newPath"
            @update:model-value="updateArgvs('newPath', $event)"
            label="目标路径（含被复制/移动的文件名）"
            icon="drive_file_rename_outline"
            :options="{
              dialog: {
                options: {
                  title: '选择文件',
                  properties: ['openFile', 'showHiddenFiles'],
                },
              },
            }"
            class="col-6"
          />
        </div>
        <div class="col">
          <ButtonGroup
            v-model="argvs.transferOperation"
            :options="transferOperationOptions"
            height="36px"
            @update:model-value="updateArgvs('transferOperation', $event)"
          />
        </div>
      </div>
    </template>

    <!-- 权限操作配置 -->
    <template v-if="argvs.operation === 'permission'">
      <div class="row q-gutter-sm">
        <ButtonGroup
          v-model="argvs.operationType"
          class="col"
          :options="operationTypeOptions"
          @update:model-value="updateArgvs('operationType', $event)"
        />
      </div>

      <!-- 修改权限操作 -->
      <template v-if="argvs.operationType === 'chmod'">
        <div class="row q-gutter-sm">
          <q-select
            v-model="argvs.mode"
            :options="writeFlagOptions"
            label="文件权限"
            dense
            options-dense
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
          <CheckButton
            v-model="argvs.recursive"
            label="递归修改"
            class="col-grow"
            @update:model-value="updateArgvs('recursive', $event)"
          />
        </div>
      </template>

      <!-- 修改所有者操作 -->
      <template v-if="argvs.operationType === 'chown'">
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
          <CheckButton
            v-model="argvs.recursive"
            label="递归修改"
            class="col-grow"
            @update:model-value="updateArgvs('recursive', $event)"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import CheckButton from "components/composer/common/CheckButton.vue";
import { stringifyArgv } from "js/composer/formatString";
import { newVarInputVal } from "js/composer/varInputValManager";

// 静态选项数据
const ENCODING_OPTIONS = [
  { label: "UTF-8", value: "utf8" },
  { label: "UTF-16", value: "utf16le" },
  { label: "GB2312", value: "gb2312" },
  { label: "GBK", value: "gbk" },
  { label: "GB18030", value: "gb18030" },
  { label: "Buffer", value: null },
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

const TARGET_TYPE_OPTIONS = [
  { label: "文件", value: "file" },
  { label: "目录", value: "directory" },
];

const OPERATION_TYPE_OPTIONS = [
  { label: "修改权限", value: "chmod", icon: "lock" },
  { label: "修改所有者", value: "chown", icon: "person" },
];

const TRANSFER_OPERATION_OPTIONS = [
  { label: "移动/重命名", value: "rename", icon: "drive_file_rename_outline" },
  { label: "复制", value: "copy", icon: "content_copy" },
];

export default defineComponent({
  name: "FileOperationEditor",
  components: {
    VariableInput,
    NumberInput,
    ButtonGroup,
    CheckButton,
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
      writeModeOptions: WRITE_MODE_OPTIONS,
      writeFlagOptions: WRITE_FLAG_OPTIONS,
      targetTypeOptions: TARGET_TYPE_OPTIONS,
      operationTypeOptions: OPERATION_TYPE_OPTIONS,
      transferOperationOptions: TRANSFER_OPERATION_OPTIONS,
      defaultArgvs: {
        operation: "read",
        filePath: newVarInputVal("str"),
        encoding: "utf8",
        readMode: "all",
        start: 0,
        length: 100,
        targetType: "file",
        writeMode: "write",
        writeFlag: "644",
        followSymlinks: true,
        mode: "644",
        recursive: false,
        force: false,
        showHidden: false,
        operationType: "chmod",
        transferOperation: "rename",
      },
    };
  },
  computed: {
    argvs() {
      return this.modelValue.argvs || this.defaultArgvs;
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
          params.showHidden = argvs.showHidden;
          break;

        case "delete":
          params.force = argvs.force;
          params.recursive = argvs.recursive;
          break;

        case "stat":
          params.followSymlinks = argvs.followSymlinks;
          break;

        case "permission":
          params.operationType = argvs.operationType;
          if (argvs.operationType === "chmod") {
            params.mode = argvs.mode;
          } else {
            params.uid = argvs.uid;
            params.gid = argvs.gid;
          }
          params.recursive = argvs.recursive;
          break;

        case "transfer":
          params.transferOperation = argvs.transferOperation;
          params.newPath = argvs.newPath;
          break;
      }

      return `${this.modelValue.value}(${stringifyArgv(params)})`;
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

      this.updateModelValue(argvs);
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
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        argvs,
        code: this.generateCode(argvs),
      });
    },
    getSummary(argvs) {
      const operationDict = {
        read: "读取",
        write: "写入",
        list: "列目录",
        delete: "删除",
        stat: "获取状态",
        transfer: "复制移动",
        permission: "设置权限",
      };
      let operationInfo = operationDict[argvs.operation] + " ";
      return operationInfo + argvs.filePath.value;
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
