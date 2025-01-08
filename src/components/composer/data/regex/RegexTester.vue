<template>
  <transition
    name="tester"
    @enter="(el) => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })"
  >
    <div class="regex-tester" v-if="shouldShowPreview">
      <div class="matches">
        <div class="section-title">
          <q-icon name="format_list_bulleted" size="14px" class="q-mr-xs" />
          匹配结果
        </div>
        <div v-if="!matches.length" class="no-matches">
          <q-icon name="sentiment_dissatisfied" size="14px" class="q-mr-xs" />
          未匹配到任何结果
        </div>
        <div v-else class="match-list">
          <q-chip
            v-for="(match, index) in matches"
            :key="index"
            dense
            square
            color="primary"
            text-color="white"
            class="match-chip"
            size="sm"
          >
            {{ match }}
          </q-chip>
        </div>
      </div>
      <div v-if="isReplace" class="preview">
        <div class="section-title">
          <q-icon name="find_replace" size="14px" class="q-mr-xs" />
          替换预览
        </div>
        <div class="preview-text">
          {{ replacedText }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";

export default defineComponent({
  name: "RegexTester",
  props: {
    text: {
      type: Object,
      default: () => newVarInputVal("var"),
    },
    regex: {
      type: String,
      default: "",
    },
    flags: {
      type: Object,
      required: true,
    },
    replace: {
      type: Object,
      default: () => newVarInputVal("var"),
    },
    isReplace: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    shouldShowPreview() {
      return this.text.value && this.text.isString;
    },
    matches() {
      if (!this.shouldShowPreview || !this.regex) return [];
      try {
        const flagStr = Object.entries(this.flags)
          .filter(([_, value]) => value)
          .map(([key]) => key.charAt(0))
          .join("");
        const re = new RegExp(this.regex, flagStr);
        return this.text.value.match(re) || [];
      } catch {
        return [];
      }
    },
    highlightedText() {
      if (!this.shouldShowPreview || !this.regex) return this.text.value;
      try {
        const flagStr = Object.entries(this.flags)
          .filter(([_, value]) => value)
          .map(([key]) => key.charAt(0))
          .join("");
        const re = new RegExp(this.regex, flagStr);
        return this.text.value.replace(re, '<span class="highlight">$&</span>');
      } catch {
        return this.text.value;
      }
    },
    replacedText() {
      if (!this.shouldShowPreview || !this.regex || !this.isReplace)
        return this.text.value;
      try {
        const flagStr = Object.entries(this.flags)
          .filter(([_, value]) => value)
          .map(([key]) => key.charAt(0))
          .join("");
        const re = new RegExp(this.regex, flagStr);
        return this.text.value.replace(re, this.replace.value);
      } catch {
        return this.text.value;
      }
    },
  },
});
</script>

<style scoped>
.regex-tester {
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transform-origin: top;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--q-primary);
  opacity: 0.8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.match-list,
.no-matches {
  min-height: 23px;
  padding: 0px 8px;
  margin-bottom: 8px;
}

.no-matches {
  font-size: 12px;
  opacity: 0.6;
}

.match-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.match-chip {
  min-width: 30px;
  transition: all 0.3s ease;
}

.match-chip :deep(.q-chip__content) {
  flex: 1;
  justify-content: center;
}

.preview-text {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin: 0 8px;
}

.preview-text :deep(.highlight) {
  background-color: rgba(var(--q-primary-rgb), 0.2);
  border-radius: 2px;
  padding: 0 2px;
  transition: all 0.3s ease;
}

/* 暗色模式适配 */
.body--dark .regex-tester {
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .preview-text {
  background: rgba(0, 0, 0, 0.2);
}

.tester-enter-active,
.tester-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tester-enter-from,
.tester-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>
