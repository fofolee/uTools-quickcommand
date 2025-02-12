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
        <div v-for="type in ruleTypeOptions" :key="type.value" class="col-auto">
          <q-btn
            :label="type.label"
            :icon="type.icon"
            :color="type.color"
            outline
            dense
            class="rule-type-btn"
            @click="addRuleByType(type.value)"
          >
            <q-badge
              v-if="ruleTypeCounts[type.value]"
              floating
              :label="ruleTypeCounts[type.value]"
            />
          </q-btn>
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
                  @click="removeRule(index)"
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
                    @click="removeRule(index + keyRules.length)"
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
                  @blur="validateRegex(rule)"
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
                  @blur="validateRegex(rule)"
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
                  @blur="validateRegex({ match: rule.match.title })"
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
                  @blur="validateRegex({ match: rule.exclude })"
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
      ruleTypeOptions: Object.values(commandTypes)
        .filter((type) => type.name !== "professional")
        .map((type) => ({
          label: type.label,
          value: type.name,
          icon: type.icon,
          color: type.color,
        })),
      commandTypes,
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
    validateRegex(rule) {
      const matchValue = rule.match;
      if (!matchValue) return;

      try {
        if (!matchValue.startsWith("/")) {
          rule.match = `/${matchValue}/`;
        }
        new RegExp(matchValue.replace(/^\/|\/[gimuy]*$/g, ""));
      } catch (e) {
        rule.match = "/./";
      }
    },

    removeRule(index) {
      const newRules = [...this.localRules];
      newRules.splice(index, 1);
      if (newRules.length == 0) {
        return;
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
  },
});
</script>

<style scoped>
.rule-type-buttons {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.rule-type-buttons :deep(.q-btn) {
  padding: 0;
  font-size: 12px;
  height: 24px;
  min-width: 85px;
}

.body--dark .rule-type-count {
  background-color: rgba(255, 255, 255, 0.9);
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: -4px;
}

.key-rules-row {
  display: flex;
  gap: 8px;
}

.key-input-wrapper {
  flex: 1;
  min-width: 0;
}

.key-input-wrapper :deep(.q-field__append) {
  padding: 0 4px;
}

.key-input-wrapper :deep(.q-icon) {
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.key-input-wrapper :deep(.q-icon:hover) {
  opacity: 1;
}

.json-editor {
  font-family: monospace;
}

.json-editor :deep(.q-field__native) {
  min-height: 200px;
  font-family: monospace;
}

/* 隐藏默认的数字输入框箭头 - Chrome, Safari, Edge, Opera */
.match-rule-editor :deep(input[type="number"]::-webkit-outer-spin-button),
.match-rule-editor :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
