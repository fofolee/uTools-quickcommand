<template>
  <div class="match-rule-editor">
    <!-- JSON编辑模式 -->
    <div v-if="showJson" class="json-editor">
      <q-input
        :model-value="jsonText"
        @update:model-value="updateJsonText($event)"
        type="textarea"
        filled
        autogrow
      />
    </div>

    <!-- 可视化编辑模式 -->
    <div v-else class="visual-editor">
      <!-- 规则类型选择按钮组 -->
      <div class="rule-type-buttons q-mb-sm q-mt-xs">
        <div
          v-for="type in ruleTypeOptions"
          :key="type.value"
          class="col-auto rule-type-btn-wrapper"
        >
          <div class="btn-container">
            <!-- 默认显示的类型按钮 -->
            <q-btn
              :label="type.label"
              :icon="type.icon"
              :color="type.color"
              outline
              dense
              class="rule-type-btn"
              :class="{ 'btn-hidden': isHovering[type.value] }"
              @mouseenter="setHovering(type.value, true)"
            >
              <q-badge
                v-if="ruleTypeCounts[type.value]"
                floating
                :label="ruleTypeCounts[type.value]"
              />
            </q-btn>

            <!-- 悬浮时显示的按钮组 -->
            <div
              class="hover-buttons"
              :class="{ 'buttons-visible': isHovering[type.value] }"
              @mouseleave="setHovering(type.value, false)"
            >
              <q-btn
                dense
                outline
                :color="type.color"
                icon="add"
                class="hover-btn"
                @click="addRuleByType(type.value)"
              >
                <q-badge
                  v-if="ruleTypeCounts[type.value]"
                  floating
                  :label="ruleTypeCounts[type.value]"
                />
              </q-btn>
              <q-btn
                dense
                outline
                :color="
                  !ruleTypeCounts[type.value] || modelValue.length === 1
                    ? 'grey'
                    : type.color
                "
                icon="remove"
                class="hover-btn"
                @click="removeLastRuleByType(type.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 规则列表 -->
      <div class="rules-container">
        <!-- 关键词匹配规则组 -->
        <div v-if="keyRules.length" class="key-rules-row">
          <div
            v-for="(rule, index) in keyRules"
            :key="'key-' + index"
            class="key-input-wrapper"
          >
            <q-input
              :model-value="rule"
              @update:model-value="updateModelValueByIndex($event, index)"
              dense
              filled
              :label="`关键词 ${index + 1}`"
            >
              <template v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop="removeRule(index)"
                  size="12px"
                  class="cursor-pointer text-grey"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- 其他类型规则 -->
        <div
          v-for="(rule, index) in nonKeyRules"
          :key="'other-' + index"
          class="rule-item"
        >
          <div class="row items-center">
            <div class="col-auto q-mr-sm">
              <q-field dense filled>
                <template v-slot:control>
                  <q-icon :name="commandTypes[rule.type].icon" />
                  <div class="q-mx-xs" style="user-select: none">
                    {{ commandTypes[rule.type].label }}
                  </div>
                  <q-icon
                    name="cancel"
                    @click.stop="removeRule(index + keyRules.length)"
                    size="12px"
                    class="cursor-pointer text-grey"
                  />
                </template>
              </q-field>
            </div>

            <!-- 正则匹配 -->
            <template v-if="rule.type === 'regex'">
              <div class="col row q-gutter-sm">
                <q-input
                  v-model="rule.match"
                  dense
                  filled
                  label="匹配文本正则表达式"
                  placeholder="例：/xxx/，任意匹配的正则会被 uTools 忽略"
                  class="col"
                  @blur="validateRegex('match', rule)"
                />
                <q-input
                  v-model.number="rule.minLength"
                  type="number"
                  dense
                  filled
                  label="最小长度"
                  placeholder="可选"
                  style="width: 65px"
                />
                <q-input
                  v-model.number="rule.maxLength"
                  type="number"
                  dense
                  filled
                  label="最大长度"
                  placeholder="可选"
                  style="width: 65px"
                />
              </div>
            </template>

            <!-- 文件匹配 -->
            <template v-else-if="rule.type === 'files'">
              <div class="col row q-gutter-sm">
                <q-input
                  v-model="rule.match"
                  dense
                  filled
                  label="匹配文件(夹)名正则表达式"
                  placeholder="可选，例：/xxx/"
                  class="col"
                  @blur="validateRegex('match', rule)"
                />
                <q-select
                  :model-value="rule.fileType || 'file'"
                  @update:model-value="rule.fileType = $event"
                  :options="[
                    { label: '文件', value: 'file' },
                    { label: '文件夹', value: 'directory' },
                  ]"
                  label="文件类型"
                  dense
                  options-dense
                  filled
                  emit-value
                  map-options
                  class="col-2"
                  popup-content-class="file-type-popup"
                />
                <q-input
                  v-model.number="rule.minLength"
                  type="number"
                  dense
                  filled
                  label="最小数量"
                  placeholder="可选"
                  style="width: 65px"
                />
                <q-input
                  v-model.number="rule.maxLength"
                  type="number"
                  dense
                  filled
                  label="最大数量"
                  placeholder="可选"
                  style="width: 65px"
                />
              </div>
            </template>

            <!-- 窗口匹配 -->
            <template v-else-if="rule.type === 'window'">
              <div class="col row q-gutter-sm">
                <q-input
                  :model-value="rule.match.app.join(',')"
                  @update:model-value="
                    rule.match.app = getArrayFromString($event)
                  "
                  dense
                  filled
                  class="col"
                  label="程序/应用名，逗号隔开"
                  placeholder="例：xxx.exe,xxx.app"
                />
                <q-input
                  v-model="rule.match.title"
                  dense
                  filled
                  label="匹配窗口标题正则表达式"
                  placeholder="可选，例：/xxx/"
                  class="col-5"
                  @blur="validateRegex('match.title', rule)"
                />
              </div>
            </template>

            <!-- 图片匹配 -->
            <template v-else-if="rule.type === 'img'">
              <q-field v-model="rule.label" dense filled class="col">
                <template v-slot:control>
                  <div>无需配置</div>
                </template>
              </q-field>
            </template>

            <!-- 所有文本匹配 -->
            <template v-else-if="rule.type === 'over'">
              <div class="col row q-gutter-sm">
                <q-input
                  v-model="rule.exclude"
                  dense
                  filled
                  label="排除的正则表达式字符串"
                  placeholder="可选，例：/xxx/"
                  class="col"
                  @blur="validateRegex('exclude', rule)"
                />
                <q-input
                  v-model.number="rule.minLength"
                  type="number"
                  dense
                  filled
                  label="最小长度"
                  placeholder="可选"
                  style="width: 65px"
                />
                <q-input
                  v-model.number="rule.maxLength"
                  type="number"
                  dense
                  filled
                  label="最大长度"
                  placeholder="可选"
                  style="width: 65px"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import commandTypes from "js/options/commandTypes.js";

export default defineComponent({
  name: "MatchRuleEditor",
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    showJson: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      ruleTypeOptions: Object.values(commandTypes).map((type) => ({
        label: type.label,
        value: type.name,
        icon: type.icon,
        color: type.color,
      })),
      commandTypes,
      isHovering: {},
    };
  },

  computed: {
    localRules() {
      return [...this.keyRules, ...this.nonKeyRules];
    },

    // 关键词规则
    keyRules() {
      return this.modelValue.filter((rule) => typeof rule === "string");
    },

    // 非关键词规则
    nonKeyRules() {
      return this.modelValue.filter((rule) => typeof rule !== "string");
    },

    // JSON文本
    jsonText() {
      return JSON.stringify(this.modelValue, null, 2);
    },

    // 计算每种规则类型的数量
    ruleTypeCounts() {
      return this.localRules.reduce((counts, rule) => {
        const type = typeof rule === "string" ? "key" : rule.type;
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {});
    },
  },

  methods: {
    validateRegex(keyPath, rule) {
      const keys = keyPath.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], rule);

      const matchValue = target[lastKey];
      if (!matchValue) return;

      try {
        if (!matchValue.startsWith("/")) {
          target[lastKey] = `/${matchValue}/`;
        }
        new RegExp(matchValue.replace(/^\/|\/[gimuy]*$/g, ""));
      } catch (e) {
        target[lastKey] = "/./";
      }
    },

    removeRule(index) {
      const newRules = [...this.localRules];
      newRules.splice(index, 1);
      if (newRules.length == 0) {
        return quickcommand.showMessageBox("请至少保留一个规则", "error");
      }
      this.updateModelValue(newRules);
    },

    updateJsonText(newJsonText) {
      try {
        const parsed = JSON.parse(newJsonText);
        const validConfig = parsed.filter((rule) => {
          if (typeof rule === "string") return true;
          return Object.values(commandTypes).some(
            (type) => type.name === rule.type
          );
        });
        this.updateModelValue(validConfig);
      } catch (_) {}
    },

    updateModelValue(newRules) {
      this.$emit("update:modelValue", newRules);
    },

    updateModelValueByIndex(newValue, index) {
      const newRules = [...this.localRules];
      newRules[index] = newValue;
      this.updateModelValue(newRules);
    },

    getArrayFromString(str) {
      return str
        .split(",")
        .filter(Boolean)
        .map((item) => item.trim());
    },

    // 根据类型添加新规则
    addRuleByType(type) {
      const newRules = [...this.localRules];

      if (type === "key") {
        // 在所有关键词后面插入新的关键词
        newRules.splice(this.keyRules.length, 0, "");
      } else {
        // 非关键词类型，直接添加到末尾
        newRules.push({
          type,
          match: {
            window: { app: [] },
            regex: "",
          }[type],
        });
      }

      this.updateModelValue(newRules);
    },

    setHovering(type, value) {
      this.isHovering = {
        ...this.isHovering,
        [type]: value,
      };
    },

    removeLastRuleByType(type) {
      const newRules = [...this.localRules];
      if (newRules.length === 1) return;
      const lastIndex = newRules.findLastIndex((rule) =>
        type === "key" ? typeof rule === "string" : rule.type === type
      );

      if (lastIndex === -1) return;
      newRules.splice(lastIndex, 1);
      this.updateModelValue(newRules);
    },
  },
});
</script>

<style scoped>
.rule-type-buttons {
  display: flex;
  gap: 8px;
}

/* 合并按钮基础样式 */
.rule-type-buttons :deep(.q-btn),
.hover-btn {
  padding: 2px;
  font-size: 12px;
  height: 24px;
}

.body--dark .rule-type-count {
  background-color: rgba(255, 255, 255, 0.9);
}

/* 合并容器样式 */
.rules-container,
.key-rules-row {
  display: flex;
  gap: 8px;
}

.rules-container {
  flex-direction: column;
  margin-bottom: -4px;
}

.key-input-wrapper {
  flex: 1;
  min-width: 0;
}

/* 合并图标样式 */
.key-input-wrapper :deep(.q-field__append) {
  padding: 0 4px;
}

.key-input-wrapper :deep(.q-icon) {
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.key-input-wrapper :deep(.q-icon:hover) {
  opacity: 1;
}

/* 合并编辑器样式 */
.json-editor,
.json-editor :deep(.q-field__native) {
  font-family: consolas, Monaco, monospace;
}

.json-editor :deep(.q-field__native) {
  min-height: 200px;
}

/* 隐藏数字输入框箭头 */
.match-rule-editor :deep(input[type="number"]::-webkit-outer-spin-button),
.match-rule-editor :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* 按钮容器样式 */
.rule-type-btn-wrapper,
.btn-container {
  position: relative;
  height: 24px;
  flex: 1;
}

.btn-container {
  width: 100%;
  height: 100%;
}

/* 按钮状态样式 */
.rule-type-btn {
  width: 100%;
  position: absolute;
  transition: opacity 0.2s ease;
}

.btn-hidden {
  opacity: 0;
  pointer-events: none;
}

/* 悬浮按钮组样式 */
.hover-buttons {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 4px;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

.hover-buttons :deep(.q-btn-group) {
  width: 100%;
}

.hover-buttons :deep(.q-btn) {
  flex: 1;
}

.buttons-visible {
  opacity: 1;
  pointer-events: auto;
}
</style>
