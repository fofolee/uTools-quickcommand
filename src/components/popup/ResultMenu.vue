<template>
  <q-btn-group :stretch="stretch" class="text-primary result-menu">
    <q-btn
      icon="image"
      label="转图片"
      @click="dataUrlToImg"
      v-show="imagebtn"
      dense
      size="sm"
    ></q-btn>
    <q-btn
      icon="data_object"
      @click="updateStringifyResult"
      v-show="textbtn && hasObject"
      :label="!dense ? '格式化' : ''"
      dense
      size="sm"
    >
      <q-tooltip v-if="!dense">格式化JSON</q-tooltip>
    </q-btn>
    <q-btn
      icon="pivot_table_chart"
      @click="updateTableResult"
      v-show="textbtn && hasTable"
      :label="!dense ? '转表格' : ''"
      dense
      size="sm"
    >
    </q-btn>
    <q-btn
      icon="content_paste"
      @click="copyResult"
      v-show="textbtn"
      dense
      size="sm"
      ><q-tooltip v-if="!dense">复制到剪贴板</q-tooltip></q-btn
    >
    <q-btn icon="send" size="sm" @click="sendResult" v-show="textbtn" dense
      ><q-tooltip v-if="!dense">发送到活动窗口</q-tooltip></q-btn
    >
    <q-btn icon="save" v-if="!dense" size="sm" @click="saveResult" dense
      ><q-tooltip>保存到文件</q-tooltip></q-btn
    >
    <q-btn icon="close" v-close-popup v-show="closebtn" dense size="sm" />
  </q-btn-group>
</template>

<script>
export default {
  props: {
    dense: Boolean,
    stretch: Boolean,
    textbtn: Boolean,
    imagebtn: Boolean,
    closebtn: Boolean,
    runResult: Array,
    selectText: String,
  },
  emits: ["updateResult", "showImg"],
  computed: {
    /**
     * 处理运行结果数据，同时完成以下任务：
     * 1. 查找符合表格显示条件的数组数据（数组元素都是对象）
     * 2. 格式化所有数据项（对象转JSON，处理null等特殊情况）
     *
     * @returns {Object} 处理后的数据对象
     * - items: 格式化后的所有数据项数组，每项包含:
     *   - raw: 原始数据
     *   - formatted: 格式化后的字符串
     * - tableData: 找到的第一个可转换为表格的数组，如果没有则为null
     */
    processedData() {
      // 空数据处理
      if (!this.runResult) return { items: [], tableData: null };

      let tableData = null;
      const items = this.runResult.map((item, index) => {
        // 1. 表格数据检测
        // 如果还没找到表格数据，且当前项是非空数组，则检查是否可以作为表格数据
        if (!tableData && Array.isArray(item) && item.length > 0) {
          // 检查数组的每个元素是否都是非null的普通对象（非数组）
          const isValidTable = item.every(
            (elem) =>
              typeof elem === "object" && elem !== null && !Array.isArray(elem)
          );
          // 如果是有效的表格数据，保存起来
          if (isValidTable) {
            tableData = item;
          }
        }

        // 2. 数据格式化
        // 2.1 处理非对象类型：直接返回原值
        if (typeof item !== "object") {
          return { raw: item, formatted: item };
        }
        // 2.2 处理 null：转换为字符串 "null"
        if (item === null) {
          return { raw: null, formatted: "null" };
        }
        // 2.3 处理对象类型
        try {
          // 尝试将对象转换为格式化的JSON字符串
          return {
            raw: item,
            formatted: JSON.stringify(item, null, 2),
          };
        } catch (error) {
          // 如果JSON转换失败，则使用toString()方法
          return {
            raw: item,
            formatted: item.toString(),
          };
        }
      });

      // 返回处理后的数据
      return { items, tableData };
    },
    formattedItems() {
      return this.processedData.items;
    },
    validTableData() {
      return this.processedData.tableData;
    },
    hasObject() {
      return this.formattedItems.some(
        (item) => typeof item.raw === "object" && item.raw !== null
      );
    },
    hasTable() {
      return this.validTableData !== null;
    },
  },
  methods: {
    copyResult() {
      window.utools.copyText(this.selectText || this.getFormattedContent());
      quickcommand.showMessageBox("已复制到剪贴板");
    },
    sendResult() {
      window.utools.hideMainWindowPasteText(
        this.selectText || this.getFormattedContent()
      );
    },
    dataUrlToImg() {
      const imagePattern = /data:image\/.*?;base64,.*/g;
      const imageUrls = this.getFormattedContent()
        .match(imagePattern)
        ?.map(
          (dataUrl) => `<img src="${dataUrl}" style="max-width: 100%;"><br>`
        );

      if (!imageUrls) {
        return quickcommand.showMessageBox("dataUrl 格式不正确！");
      }
      this.$emit("showImg", imageUrls);
    },
    saveResult() {
      const saveOptions = {
        defaultPath: "quickcommand-result.txt",
        filters: [{ name: "txt", extensions: ["txt"] }],
      };
      window.saveFile(this.getFormattedContent(), saveOptions);
    },
    getFormattedContent() {
      return this.formattedItems.map((item) => item.formatted).join("\n");
    },
    updateStringifyResult() {
      this.updateResult([this.getFormattedContent()]);
    },
    updateTableResult() {
      const tableData = this.validTableData;
      if (!tableData) return;

      const headers = [
        ...new Set(tableData.flatMap((obj) => Object.keys(obj))),
      ];
      if (!headers.length) return;

      // 计算字符串显示宽度的辅助函数
      const getDisplayWidth = (str) => {
        return String(str)
          .split("")
          .reduce((width, char) => {
            // 判断是否为全角字符
            // 包括：中文字符、全角标点符号、全角空格、日韩字符等
            return (
              width +
              (/[\u2E80-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3200-\u32FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/.test(
                char
              )
                ? 2
                : 1)
            );
          }, 0);
      };

      const formatValue = (value) => {
        const liteView = (obj) => {
          if (Array.isArray(obj)) {
            return `[${obj.slice(0, 3).join(",")} ${
              obj.length > 3 ? "..." : ""
            }]`;
          }
          const keys = Object.keys(obj);
          return `{${keys.slice(0, 3).join(",")} ${
            keys.length > 3 ? "..." : ""
          }}`;
        };

        if (value == null) return "";

        switch (typeof value) {
          case "string":
            return value.replace(/\n/g, "\\n");
          case "object":
            return liteView(value);
          default:
            return String(value);
        }
      };

      // 计算每列的最大宽度
      const columnWidths = headers.map((header) => {
        const maxDataWidth = Math.max(
          getDisplayWidth(header),
          ...tableData.map((obj) => {
            const value = obj[header];
            return value === undefined || value === null
              ? 0
              : getDisplayWidth(formatValue(value));
          })
        );
        return maxDataWidth;
      });

      // 生成对齐的行
      const createAlignedRow = (cells) =>
        "| " +
        cells
          .map((cell, index) => {
            const cellStr = String(cell);
            const displayWidth = getDisplayWidth(cellStr);
            const padding = " ".repeat(
              Math.max(0, columnWidths[index] - displayWidth)
            );
            return cellStr + padding;
          })
          .join(" | ") +
        " |";

      const rows = [
        // 表头行
        createAlignedRow(headers),
        // 分隔行
        "| " +
          headers.map((_, i) => "-".repeat(columnWidths[i])).join(" | ") +
          " |",
        // 数据行
        ...tableData.map((obj) =>
          createAlignedRow(
            headers.map((header) => {
              const value = obj[header];
              return value === undefined || value === null
                ? ""
                : formatValue(value);
            })
          )
        ),
      ];

      this.updateResult([rows.join("\n")]);
    },
    updateResult(result) {
      this.$emit("updateResult", result);
    },
  },
};
</script>
<style scoped>
.result-menu {
  gap: 4px;
}
</style>
