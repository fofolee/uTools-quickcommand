<template>
  <div class="file-operation-editor">
    <!-- 操作类型选择 -->
    <div class="tabs-container">
      <q-tabs
        v-model="operation"
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
        v-model="filePath"
        label="文件路径"
        :command="{ icon: 'folder' }"
        class="col-grow"
        @update:model-value="updateConfig"
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
    <template v-if="operation === 'read'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="encoding"
          :options="encodingOptions"
          label="编码"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
        />
        <q-select
          v-model="readMode"
          :options="readModeOptions"
          label="读取模式"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
        />
        <q-select
          v-model="readFlag"
          :options="readFlagOptions"
          label="读取标志"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <VariableInput
          v-if="readMode === 'start'"
          v-model="start"
          label="起始位置"
          :command="{ icon: 'first_page', inputType: 'number' }"
          class="col-grow"
        />
        <VariableInput
          v-if="readMode === 'start'"
          v-model="length"
          label="读取长度"
          :command="{ icon: 'last_page', inputType: 'number' }"
          class="col-grow"
        />
      </div>
    </template>

    <!-- 写入操作配置 -->
    <template v-if="operation === 'write'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="encoding"
          :options="encodingOptions"
          label="编码"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
        />
        <q-select
          v-model="writeMode"
          :options="writeModeOptions"
          label="写入模式"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <q-select
          v-model="writeFlag"
          :options="writeFlagOptions"
          label="文件权限"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
      </div>
      <div class="row q-gutter-sm">
        <VariableInput
          v-model="content"
          label="写入内容"
          :command="{ icon: 'edit' }"
          class="col-12"
          @update:model-value="updateConfig"
        />
      </div>
    </template>

    <!-- 删除操作配置 -->
    <template v-if="operation === 'delete'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <q-checkbox
          v-model="recursive"
          label="递归删除"
          v-if="targetType === 'directory'"
          dense
          class="col-grow"
        />
        <q-checkbox v-model="force" label="强制删除" dense class="col-grow" />
      </div>
    </template>

    <!-- 管理操作配置 -->
    <template v-if="operation === 'manage'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <q-select
          v-model="manageOperation"
          :options="manageOperationOptions"
          label="操作类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
        />
      </div>

      <!-- 重命名操作 -->
      <template v-if="manageOperation === 'rename'">
        <div class="row q-gutter-sm">
          <VariableInput
            v-model="newPath"
            label="新路径"
            :command="{ icon: 'drive_file_rename_outline' }"
            class="col-grow"
            @update:model-value="updateConfig"
          />
        </div>
      </template>

      <!-- 修改权限操作 -->
      <template v-if="manageOperation === 'chmod'">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <div class="text-caption q-mb-xs">所有者</div>
                <q-option-group
                  v-model="ownerMode"
                  :options="permissionOptions"
                  type="checkbox"
                  inline
                  dense
                  @update:model-value="updateMode"
                />
              </div>
              <div class="col-4">
                <div class="text-caption q-mb-xs">用户组</div>
                <q-option-group
                  v-model="groupMode"
                  :options="permissionOptions"
                  type="checkbox"
                  inline
                  dense
                  @update:model-value="updateMode"
                />
              </div>
              <div class="col-4">
                <div class="text-caption q-mb-xs">其他用户</div>
                <q-option-group
                  v-model="otherMode"
                  :options="permissionOptions"
                  type="checkbox"
                  inline
                  dense
                  @update:model-value="updateMode"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md items-center q-mt-xs">
              <div style="font-size: 12px">权限值: {{ mode }}</div>
              <q-checkbox
                v-model="recursive"
                label="递归修改"
                v-if="targetType === 'directory'"
                dense
                class="col-grow"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 修改所有者操作 -->
      <template v-if="manageOperation === 'chown'">
        <div class="row q-col-gutter-sm">
          <VariableInput
            v-model="uid"
            label="用户ID"
            :command="{ icon: 'person', inputType: 'number' }"
            class="col-grow"
          />
          <VariableInput
            v-model="gid"
            label="组ID"
            :command="{ icon: 'group', inputType: 'number' }"
            class="col-grow"
          />
          <q-checkbox
            v-model="recursive"
            label="递归修改"
            v-if="targetType === 'directory'"
            dense
            class="col-grow"
          />
        </div>
      </template>
    </template>

    <!-- 列目录操作配置 -->
    <template v-if="operation === 'list'">
      <div class="row q-gutter-sm q-px-xs">
        <q-checkbox
          v-model="recursive"
          label="递归列出子目录"
          dense
          class="col-grow"
        />
        <q-checkbox
          v-model="showHidden"
          label="显示隐藏文件"
          dense
          class="col-grow"
        />
      </div>
    </template>

    <!-- 状态操作配置 -->
    <template v-if="operation === 'stat'">
      <div class="row q-gutter-sm">
        <q-select
          v-model="targetType"
          :options="targetTypeOptions"
          label="目标类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <q-select
          v-model="statMode"
          :options="statModeOptions"
          label="检查类型"
          dense
          filled
          class="col-grow"
          emit-value
          map-options
          @update:model-value="updateConfig"
        />
        <q-checkbox
          v-model="followSymlinks"
          label="跟随符号链接"
          v-if="statMode === 'status'"
          dense
          class="col-grow"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../ui/VariableInput.vue";
import { formatJsonVariables } from "js/composer/formatString";

export default defineComponent({
  name: "FileOperationEditor",
  components: { VariableInput },

  data() {
    return {
      operation: "read",
      filePath: "",
      encoding: "utf8",
      readMode: "all",
      writeMode: "w",
      content: "",
      start: 0,
      length: 1024,
      recursive: false,
      force: false,
      showHidden: false,
      followSymlinks: false,
      manageOperation: "rename",
      newPath: "",
      mode: "644",
      uid: "",
      gid: "",
      readFlag: "r",
      writeFlag: "666",
      ownerMode: ["read", "write"],
      groupMode: ["read"],
      otherMode: ["read"],
      permissionOptions: [
        { label: "读取(r)", value: "read" },
        { label: "写入(w)", value: "write" },
        { label: "执行(x)", value: "execute" },
      ],

      encodingOptions: [
        { label: "UTF-8", value: "utf8" },
        { label: "ASCII", value: "ascii" },
        { label: "Base64", value: "base64" },
        { label: "二进制", value: "binary" },
        { label: "十六进制", value: "hex" },
      ],
      readModeOptions: [
        { label: "全部读取", value: "all" },
        { label: "指定位置读取", value: "start" },
      ],
      writeModeOptions: [
        { label: "覆盖写入", value: "w" },
        { label: "追加写入", value: "a" },
        { label: "读写", value: "w+" },
        { label: "追加读写", value: "a+" },
      ],
      manageOperationOptions: [
        { label: "重命名/移动", value: "rename" },
        { label: "修改权限", value: "chmod" },
        { label: "修改所有者", value: "chown" },
      ],
      readFlagOptions: [
        { label: "只读", value: "r" },
        { label: "读写", value: "r+" },
        { label: "同步读取", value: "rs" },
        { label: "同步读写", value: "rs+" },
      ],
      writeFlagOptions: [
        { label: "默认权限", value: "666" },
        { label: "只读", value: "444" },
        { label: "可执行", value: "755" },
        { label: "完全控制", value: "777" },
      ],
      targetType: "",
      targetTypeOptions: [
        { label: "文件", value: "file" },
        { label: "文件夹", value: "directory" },
      ],
      statMode: "exists",
      statModeOptions: [
        { label: "检查是否存在", value: "exists" },
        { label: "获取详细状态", value: "status" },
      ],
    };
  },

  created() {
    switch (this.operation) {
      case "list":
        this.targetType = "directory";
        break;
      case "stat":
      case "delete":
      case "manage":
        this.targetType = "file";
        break;
    }
  },

  methods: {
    updateConfig() {
      let config = {
        operation: this.operation,
        filePath: this.filePath,
      };

      // 定义需要处理的变量字段
      const variableFields = [
        "filePath",
        ...(this.operation === "read" && this.readMode === "start"
          ? ["start", "length"]
          : []),
        ...(this.operation === "write" ? ["content"] : []),
        ...(this.operation === "manage" && this.manageOperation === "rename"
          ? ["newPath"]
          : []),
        ...(this.operation === "manage" && this.manageOperation === "chmod"
          ? ["mode"]
          : []),
        ...(this.operation === "manage" && this.manageOperation === "chown"
          ? ["uid", "gid"]
          : []),
      ];

      let code = "";
      switch (this.operation) {
        case "read":
          config = {
            ...config,
            encoding: this.encoding,
            readMode: this.readMode,
            flag: this.readFlag,
            ...(this.readMode === "start" && {
              start: this.start,
              length: this.length,
            }),
          };
          code = `quickcomposer.file.operation(${formatJsonVariables(
            config,
            variableFields
          )})`;
          break;

        case "write":
          config = {
            ...config,
            encoding: this.encoding,
            flag: this.writeMode,
            mode: this.writeFlag,
            content: this.content,
          };
          code = `quickcomposer.file.operation(${formatJsonVariables(
            config,
            variableFields
          )})`;
          break;

        case "delete":
          config = {
            ...config,
            recursive: this.recursive,
            force: this.force,
          };
          code = `quickcomposer.file.operation(${formatJsonVariables(
            config,
            variableFields
          )})`;
          break;

        case "manage":
          config = {
            ...config,
            manageOperation: this.manageOperation,
            ...(this.manageOperation === "rename" && { newPath: this.newPath }),
            ...(this.manageOperation === "chmod" && {
              mode: this.mode,
              recursive: this.recursive,
            }),
            ...(this.manageOperation === "chown" && {
              uid: this.uid,
              gid: this.gid,
              recursive: this.recursive,
            }),
          };
          code = `quickcomposer.file.operation(${formatJsonVariables(
            config,
            variableFields
          )})`;
          break;

        case "stat":
          config = {
            ...config,
            targetType: this.targetType,
            statMode: this.statMode,
            ...(this.statMode === "status" && {
              followSymlinks: this.followSymlinks,
            }),
          };
          code = `quickcomposer.file.operation(${formatJsonVariables(
            config,
            variableFields
          )})`;
          break;
      }

      this.$emit("update:modelValue", code);
    },

    async selectFile() {
      const result = window.utools.showOpenDialog({
        title: "选择文件",
        properties: [
          this.operation === "list" ||
          (["delete", "manage", "stat"].includes(this.operation) &&
            this.targetType === "directory")
            ? "openDirectory"
            : "openFile",
          "showHiddenFiles",
        ],
        buttonLabel: "选择",
      });
      console.log(result);
      if (result && result[0]) {
        this.filePath = result[0];
        this.updateConfig();
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

      const ownerValue = calculateMode(this.ownerMode);
      const groupValue = calculateMode(this.groupMode);
      const otherValue = calculateMode(this.otherMode);

      this.mode = `${ownerValue}${groupValue}${otherValue}`;
      this.updateConfig();
    },
  },

  watch: {
    operation() {
      this.updateConfig();
    },
    encoding() {
      this.updateConfig();
    },
    readMode() {
      this.updateConfig();
    },
    writeMode() {
      this.updateConfig();
    },
    recursive() {
      this.updateConfig();
    },
    force() {
      this.updateConfig();
    },
    manageOperation() {
      this.updateConfig();
    },
    start() {
      this.updateConfig();
    },
    length() {
      this.updateConfig();
    },
    mode() {
      this.updateConfig();
    },
    uid() {
      this.updateConfig();
    },
    gid() {
      this.updateConfig();
    },
    targetType: {
      handler(newType) {
        this.filePath = "";
        this.updateConfig();
      },
    },
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
