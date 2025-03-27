<template>
  <div class="regex-editor">
    <div class="row q-col-gutter-xs">
      <div :class="argvs.isReplace ? 'col-6' : 'col-12'">
        <div class="row items-center q-col-gutter-xs">
          <div class="col-auto">
            <q-btn
              flat
              dense
              color="grey"
              :icon="argvs.isReplace ? 'content_cut' : 'find_replace'"
              @click="handleModeChange"
            >
              <q-tooltip>{{
                argvs.isReplace ? "提取模式" : "替换模式"
              }}</q-tooltip>
            </q-btn>
          </div>
          <div class="col">
            <!-- 输入文本区域 -->
            <VariableInput
              :model-value="argvs.textValue"
              @update:model-value="updateArgvs('textValue', $event)"
              icon="text_fields"
              label="要处理的文本"
            />
          </div>
        </div>
      </div>

      <div class="col-6" v-if="argvs.isReplace">
        <!-- 替换文本区域 -->
        <VariableInput
          :model-value="argvs.replaceValue"
          @update:model-value="updateArgvs('replaceValue', $event)"
          label="替换为"
          icon="text_fields"
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
            @click="
              showBuilder = !showBuilder;
              updateArgvs('showBuilder', showBuilder);
            "
            :color="showBuilder ? 'primary' : 'grey'"
          >
            <q-tooltip>正则表达式构建工具</q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <RegexInput
            :model-value="argvs.regexValue"
            @update:model-value="updateArgvs('regexValue', $event)"
            :flags="argvs.flags"
            @update:flags="updateArgvs('flags', $event)"
            ref="regexInput"
          />
        </div>
      </div>
    </div>

    <!-- 测试预览 -->
    <RegexTester
      :text="argvs.textValue"
      :regex="argvs.regexValue"
      :flags="argvs.flags"
      :replace="argvs.replaceValue"
      :is-replace="argvs.isReplace"
    />

    <!-- 正则表达式构建工具 -->
    <transition
      name="builder"
      @enter="
        (el) => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      "
    >
      <div v-if="showBuilder" class="builder-container">
        <RegexBuilder :selection="selection" @insert="insertPattern" />
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import RegexInput from "./RegexInput.vue";
import RegexBuilder from "./RegexBuilder.vue";
import RegexTester from "./RegexTester.vue";
import { newVarInputVal } from "js/composer/varInputValManager";

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
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selection: {
        start: 0,
        end: 0,
      },
      showBuilder: false,
      defaultArgvs: {
        textValue: newVarInputVal("str"),
        regexValue: "",
        replaceValue: newVarInputVal("str"),
        isReplace: false,
        flags: {
          ignoreCase: false,
          multiline: false,
          global: true,
        },
      },
    };
  },
  computed: {
    command() {
      return this.modelValue;
    },
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
  },
  methods: {
    handleModeChange() {
      this.argvs.isReplace = !this.argvs.isReplace;
      if (!this.argvs.isReplace) {
        this.argvs.replaceValue = "";
      }
      const argvs = {
        ...this.argvs,
        isReplace: this.argvs.isReplace,
        replaceValue: this.argvs.replaceValue,
      };
      this.updateModelValue(argvs);
    },
    updateArgvs(key, value) {
      const argvs = { ...this.argvs, [key]: value };
      this.updateModelValue(argvs);
    },
    generateCode(argvs) {
      const flagStr = Object.entries(argvs.flags)
        .filter(([_, value]) => value)
        .map(([key]) => key.charAt(0))
        .join("");
      const text = argvs.textValue.isString
        ? `"${argvs.textValue.value}"`
        : argvs.textValue.value;
      const output = [text, `/${argvs.regexValue}/${flagStr}`];
      if (argvs.isReplace) {
        const replace = argvs.replaceValue.isString
          ? `"${argvs.replaceValue.value}"`
          : argvs.replaceValue.value;
        output.push(replace);
      }
      return `${this.command.value}(${output.join(",")})`;
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
        this.updateArgvs("regexValue", newContent);
      }
    },
    getSummary(argvs) {
      return argvs.isReplace
        ? argvs.textValue.value +
            " 匹配 " +
            argvs.regexValue +
            " 替换为 " +
            argvs.replaceValue.value
        : argvs.textValue.value + " 匹配 " + argvs.regexValue;
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
    this.updateModelValue(this.argvs);
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
