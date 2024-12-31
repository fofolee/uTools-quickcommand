<template>
  <div class="regex-editor">
    <div class="row q-col-gutter-xs">
      <div :class="mode === 'replace' ? 'col-6' : 'col-12'">
        <div class="row items-center q-col-gutter-xs">
          <div class="col-auto">
            <q-btn
              flat
              dense
              color="grey"
              :icon="mode === 'extract' ? 'content_cut' : 'find_replace'"
              @click="mode = mode === 'extract' ? 'replace' : 'extract'"
            >
              <q-tooltip>{{
                mode === "extract" ? "提取模式" : "替换模式"
              }}</q-tooltip>
            </q-btn>
          </div>
          <div class="col">
            <!-- 输入文本区域 -->
            <VariableInput
              v-model="textValue"
              label="要处理的文本"
              :command="command"
              @update:model-value="updateValue"
            />
          </div>
        </div>
      </div>

      <div class="col-6" v-if="mode === 'replace'">
        <!-- 替换文本区域 -->
        <VariableInput
          v-model="replaceValue"
          label="替换为"
          :command="command"
          @update:model-value="updateValue"
        />
      </div>
    </div>

    <!-- 正则表达式编辑器 -->
    <div class="regex-input-section">
      <div class="row items-center q-col-gutter-xs">
        <div class="col-auto">
          <q-btn
            flat
            dense
            icon="auto_fix_high"
            @click="showBuilder = !showBuilder"
            :color="showBuilder ? 'primary' : 'grey'"
          >
            <q-tooltip>正则表达式构建工具</q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <RegexInput
            v-model="regexValue"
            @update:model-value="updateValue"
            :flags="flags"
            @update:flags="updateFlags"
            ref="regexInput"
          />
        </div>
      </div>
    </div>

    <!-- 测试预览 -->
    <RegexTester
      :text="textValue"
      :regex="regexValue"
      :flags="flags"
      :replace="replaceValue"
    />

    <!-- 正则表达式构建工具 -->
    <transition
      name="builder"
      @enter="el => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })"
    >
      <div v-if="showBuilder" class="builder-container">
        <RegexBuilder :selection="selection" @insert="insertPattern" />
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../ui/VariableInput.vue";
import RegexInput from "./RegexInput.vue";
import RegexBuilder from "./RegexBuilder.vue";
import RegexTester from "./RegexTester.vue";

export default defineComponent({
  name: "RegexEditor",
  components: {
    VariableInput,
    RegexInput,
    RegexBuilder,
    RegexTester,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    command: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      textValue: "",
      regexValue: "",
      replaceValue: "",
      mode: "extract",
      showBuilder: false,
      flags: {
        ignoreCase: false,
        multiline: false,
        global: true,
      },
      selection: {
        start: 0,
        end: 0,
      },
    };
  },
  methods: {
    updateValue() {
      const flagStr = Object.entries(this.flags)
        .filter(([_, value]) => value)
        .map(([key]) => key.charAt(0))
        .join("");
      const output = [this.textValue, `/${this.regexValue}/${flagStr}`];
      if (this.mode === "replace") {
        output.push(this.replaceValue || '""');
      }
      this.$emit(
        "update:modelValue",
        `${this.command.value}(${output.join(",")})`
      );
    },
    updateFlags(newFlags) {
      this.flags = newFlags;
      this.updateValue();
    },
    insertPattern(pattern) {
      // 获取 RegexInput 组件实例
      const regexInput = this.$refs.regexInput;
      if (regexInput) {
        // 确保输入框获得焦点
        const editor = regexInput.$refs.editor;
        editor.focus();

        // 获取当前选区
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // 检查光标是否在编辑器内部
        if (!editor.contains(range.startContainer)) {
          // 如果光标不在编辑器内，将光标移到末尾
          range.selectNodeContents(editor);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // 获取当前光标位置
        const start = range.startOffset;
        const content = editor.textContent;

        // 在光标位置插入文本
        const newContent =
          content.slice(0, start) + pattern + content.slice(start);
        editor.textContent = newContent;
        this.regexValue = newContent;

        // 设置新的光标位置到插入内容后面
        this.$nextTick(() => {
          const newRange = document.createRange();
          const textNode = editor.firstChild || editor;
          const newPosition = start + pattern.length;

          try {
            newRange.setStart(textNode, newPosition);
            newRange.setEnd(textNode, newPosition);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (error) {
            console.warn("Failed to set cursor position:", error);
          }
        });

        // 触发更新
        this.updateValue();
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          // 从函数调用格式中提取参数
          const match = val.match(/^.*?\((.*)\)$/);
          if (!match) return;
          const params = match[1];
          const parts = params.split(",");
          const text = parts[0];
          const regexPart = parts[1];
          const replace = parts[2];
          if (regexPart) {
            const [_, pattern, flags] = regexPart.match(/\/(.*?)\/(.*)/) || [];
            this.textValue = text;
            this.regexValue = pattern;
            this.replaceValue = replace || "";
            this.flags = {
              ignoreCase: flags.includes("i"),
              multiline: flags.includes("m"),
              global: flags.includes("g"),
            };
          }
        }
      },
    },
    mode() {
      // 切换到提取模式时清空替换值
      if (this.mode === "extract") {
        this.replaceValue = "";
      }
      this.updateValue();
    },
  },
});
</script>

<style scoped>
.regex-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.builder-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 8px;
  overflow: hidden;
}

.builder-enter-active,
.builder-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.builder-enter-from,
.builder-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0 8px;
}

/* 暗色模式适配 */
.body--dark .builder-container {
  background: rgba(255, 255, 255, 0.03);
}
</style>
