<template>
  <div class="regex-builder">
    <!-- 基础字符类和量词 -->
    <div class="row q-col-gutter-sm">
      <!-- 字符类 -->
      <div class="col-6">
        <div class="pattern-section">
          <div class="section-title q-mb-xs">字符类</div>
          <div class="patterns-grid">
            <q-btn
              v-for="pattern in characterClasses"
              :key="pattern.value"
              flat
              no-caps
              dense
              class="pattern-btn"
              @click="insertPattern(pattern.value)"
            >
              <q-tooltip class="pattern-tooltip">
                <div
                  v-for="(line, index) in pattern.desc.split('\n')"
                  :key="index"
                >
                  {{ line }}
                </div>
              </q-tooltip>
              {{ pattern.label }}
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 量词 -->
      <div class="col-6">
        <div class="pattern-section">
          <div class="section-title q-mb-xs">量词</div>
          <div class="patterns-grid">
            <q-btn
              v-for="pattern in quantifiers"
              :key="pattern.value"
              flat
              no-caps
              dense
              class="pattern-btn"
              @click="insertPattern(pattern.value)"
            >
              <q-tooltip class="pattern-tooltip">
                <div
                  v-for="(line, index) in pattern.desc.split('\n')"
                  :key="index"
                >
                  {{ line }}
                </div>
              </q-tooltip>
              {{ pattern.label }}
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 锚点和断言 -->
      <div class="col-6">
        <div class="pattern-section">
          <div class="section-title q-mb-xs">锚点和断言</div>
          <div class="patterns-grid">
            <q-btn
              v-for="pattern in anchors"
              :key="pattern.value"
              flat
              no-caps
              dense
              class="pattern-btn"
              @click="insertPattern(pattern.value)"
            >
              <q-tooltip class="pattern-tooltip">
                <div
                  v-for="(line, index) in pattern.desc.split('\n')"
                  :key="index"
                >
                  {{ line }}
                </div>
              </q-tooltip>
              {{ pattern.label }}
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 分组和引用 -->
      <div class="col-6">
        <div class="pattern-section">
          <div class="section-title q-mb-xs">分组和引用</div>
          <div class="patterns-grid">
            <q-btn
              v-for="pattern in groups"
              :key="pattern.value"
              flat
              no-caps
              dense
              class="pattern-btn"
              @click="insertPattern(pattern.value)"
            >
              <q-tooltip class="pattern-tooltip">
                <div
                  v-for="(line, index) in pattern.desc.split('\n')"
                  :key="index"
                >
                  {{ line }}
                </div>
              </q-tooltip>
              {{ pattern.label }}
            </q-btn>
          </div>
        </div>
      </div>

      <!-- 常用模式 -->
      <div class="col-12">
        <div class="pattern-section">
          <div class="section-title q-mb-xs">常用模式</div>
          <div class="patterns-grid">
            <q-btn
              v-for="pattern in commonPatterns"
              :key="pattern.value"
              flat
              no-caps
              dense
              class="pattern-btn"
              @click="insertPattern(pattern.value)"
            >
              <q-tooltip class="pattern-tooltip">
                <div
                  v-for="(line, index) in pattern.desc.split('\n')"
                  :key="index"
                >
                  {{ line }}
                </div>
              </q-tooltip>
              {{ pattern.label }}
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "RegexBuilder",
  props: {
    selection: {
      type: Object,
      default: () => ({ start: 0, end: 0 }),
    },
  },
  emits: ["insert"],
  data() {
    return {
      commonPatterns: [
        {
          label: "字母",
          value: "[a-zA-Z]+",
          desc: "匹配一个或多个字母\n示例：[a-zA-Z]+ 匹配'Hello123'中的'Hello'",
        },
        {
          label: "字母数字",
          value: "[a-zA-Z0-9]+",
          desc: "匹配一个或多个字母或数字\n示例：[a-zA-Z0-9]+ 匹配'Test_123!'中的'Test'和'123'",
        },
        {
          label: "中文",
          value: "[\\u4e00-\\u9fa5]+",
          desc: "匹配一个或多个中文字符\n示例：[\\u4e00-\\u9fa5]+ 匹配'你好hello世界'中的'你好'和'世界'",
        },
        {
          label: "非中文",
          value: "[^\\u4e00-\\u9fa5]+",
          desc: "匹配一个或多个非中文字符\n示例：[^\\u4e00-\\u9fa5]+ 匹配'Hello世界'中的'Hello'",
        },
        {
          label: "键盘字符",
          value: "[\\x20-\\x7e]+",
          desc: "匹配一个或多个可打印的键盘字符(包含空格)\n示例：[\\x20-\\x7e]+ 匹配'Hello 世界@123'中的'Hello '和'@123'",
        },
        {
          label: "真·任意字符",
          value: "[\\s\\S]*",
          desc: "匹配包含换行的任意字符\n示例：[\\s\\S]* 匹配整个文本，包括换行符",
        },
        {
          label: "强口令",
          value: "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$",
          desc: "至少8位，包含大小写字母和数字\n示例：Test123456 匹配，test123不匹配",
        },
        {
          label: "IP地址",
          value: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
          desc: "匹配IP地址格式\n示例：192.168.1.1 匹配，256.1.2.3 不匹配",
        },
        {
          label: "手机号",
          value: "1[3-9]\\d{9}",
          desc: "匹配中国大陆手机号\n示例：13812345678 匹配，12345678901 不匹配",
        },
        {
          label: "邮箱",
          value: "[\\w.-]+@[\\w.-]+\\.\\w+",
          desc: "匹配电子邮箱地址\n示例：test@example.com 匹配，@test.com 不匹配",
        },
        {
          label: "域名",
          value:
            "(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]",
          desc: "匹配域名格式\n示例：example.com 匹配，example..com 不匹配",
        },
        {
          label: "网址",
          value: "https?://[\\w.-]+\\.\\w+",
          desc: "匹配网址\n示例：https://example.com 匹配，ftp://test.com 不匹配",
        },
        {
          label: "日期",
          value: "\\d{4}-\\d{2}-\\d{2}",
          desc: "匹配日期格式 YYYY-MM-DD\n示例：2024-03-15 匹配，2024/03/15 不匹配",
        },
        {
          label: "时间",
          value: "(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d",
          desc: "匹配时间格式 HH:MM:SS\n示例：23:59:59 匹配，24:00:00 不匹配",
        },
        {
          label: "身份证",
          value: "\\d{17}[\\dXx]",
          desc: "匹配18位身份证号\n示例：110101199001011234 匹配，1234567890 不匹配",
        },
        {
          label: "MAC地址",
          value: "([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})",
          desc: "匹配MAC地址(xx:xx:xx:xx:xx:xx格式)\n示例：00:1B:44:11:3A:B7 匹配，00-1B-44-11-3A-B7 也匹配",
        },
        {
          label: "车牌号",
          value:
            "[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4,5}[A-Z0-9挂学警港澳]",
          desc: "匹配中国车牌号\n示例：京A12345 匹配，京123456 不匹配",
        },
        {
          label: "IPv6",
          value: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",
          desc: "匹配IPv6地址\n示例：2001:0db8:85a3:0000:0000:8a2e:0370:7334 匹配",
        },
      ],
      characterClasses: [
        {
          label: "数字",
          value: "\\d",
          desc: "匹配任意数字字符 (0-9)\n示例：\\d 匹配'5'，\\d+ 匹配'123'",
        },
        {
          label: "非数字",
          value: "\\D",
          desc: "匹配任意非数字字符\n示例：\\D 匹配'a'、'@'等非数字字符",
        },
        {
          label: "单词字符",
          value: "\\w",
          desc: "匹配单个英文字母、数字或下划线字符\n示例：\\w 匹配'a'、'1'、'_'，\\w+ 匹配'abc123'",
        },
        {
          label: "非单词字符",
          value: "\\W",
          desc: "匹配除英文字母、数字和下划线以外的字符\n示例：\\W 匹配'@'、'#'、空格等特殊字符",
        },
        {
          label: "空白",
          value: "\\s",
          desc: "匹配任意空白字符（包括空格、制表符、换行符等）\n示例：\\s+ 匹配连续的空白字符",
        },
        {
          label: "非空白",
          value: "\\S",
          desc: "匹配非空白字符\n示例：\\S+ 匹配一串连续的非空白字符",
        },
        {
          label: "任意字符",
          value: ".",
          desc: "匹配除换行符外的任意字符\n示例：.+ 匹配除换行外的所有字符，a.c 匹配'abc'、'adc'等",
        },
        {
          label: "字符集",
          value: "[]",
          desc: "匹配字符集中的任意一个字符\n示例：[aeiou] 匹配任意一个元音字母，[0-9a-f] 匹配一个十六进制数字",
        },
        {
          label: "排除字符",
          value: "[^]",
          desc: "匹配不在字符集中的任意字符\n示例：[^0-9] 匹配任意非数字字符，[^aeiou] 匹配任意非元音字母",
        },
        {
          label: "范围",
          value: "[a-z]",
          desc: "匹配指定范围内的任意字符\n示例：[a-z] 匹配小写字母，[A-Z0-9] 匹配大写字母和数字",
        },
        {
          label: "Unicode",
          value: "\\u",
          desc: "匹配Unicode字符\n示例：\\u4e00-\\u9fa5 匹配中文字符，\\u0041 匹配'A'",
        },
      ],
      quantifiers: [
        {
          label: "零或一",
          value: "?",
          desc: "匹配零次或一次（可选项）\n示例：colou?r 匹配'color'或'colour'",
        },
        {
          label: "零或多",
          value: "*",
          desc: "匹配零次或多次（任意次数）\n示例：ab* 匹配'a'、'ab'、'abb'等",
        },
        {
          label: "一或多",
          value: "+",
          desc: "匹配一次或多次（至少一次）\n示例：ab+ 匹配'ab'、'abb'等，但不匹配'a'",
        },
        {
          label: "非贪婪",
          value: "?",
          desc: "在量词后添加?使其变为非贪婪模式（最小匹配）\n示例：a.*?b 匹配'acb'中的'acb'，而不是'acb...b'中的全部",
        },
        {
          label: "恰好n次",
          value: "{n}",
          desc: "匹配恰好n次\n示例：a{3} 只匹配恰好3个连续的'a'",
        },
        {
          label: "至少n次",
          value: "{n,}",
          desc: "匹配至少n次\n示例：a{2,} 匹配2个或更多连续的'a'",
        },
        {
          label: "n到m次",
          value: "{n,m}",
          desc: "匹配n到m次\n示例：a{2,4} 匹配2到4个连续的'a'",
        },
      ],
      anchors: [
        {
          label: "行首",
          value: "^",
          desc: "匹配行的开始位置\n示例：^abc 只匹配以'abc'开头的行",
        },
        {
          label: "行尾",
          value: "$",
          desc: "匹配行的结束位置\n示例：abc$ 只匹配以'abc'结尾的行",
        },
        {
          label: "单词边界",
          value: "\\b",
          desc: "匹配单词的边界\n示例：\\bword\\b 只匹配独立的'word'，不匹配'password'",
        },
        {
          label: "非单词边界",
          value: "\\B",
          desc: "匹配非单词边界\n示例：\\Bword\\B 匹配'keyword'中的'word'，但不匹配独立的'word'",
        },
        {
          label: "断言(?=)",
          value: "(?=)",
          desc: "正向先行断言，匹配后面是指定内容的位置\n示例：foo(?=bar) 匹配后面是'bar'的'foo'",
        },
        {
          label: "断言(?!)",
          value: "(?!)",
          desc: "负向先行断言，匹配后面不是指定内容的位置\n示例：foo(?!bar) 匹配后面不是'bar'的'foo'",
        },
        {
          label: "断言(?<=)",
          value: "(?<=)",
          desc: "正向后行断言，匹配前面是指定内容的位置\n示例：(?<=foo)bar 匹配前面是'foo'的'bar'",
        },
        {
          label: "断言(?<!)",
          value: "(?<!)",
          desc: "负向后行断言，匹配前面不是指定内容的位置\n示例：(?<!foo)bar 匹配前面不是'foo'的'bar'",
        },
      ],
      groups: [
        {
          label: "捕获组",
          value: "()",
          desc: "创建一个捕获组，可以被后面引用\n示例：(\\w+)\\s+\\1 匹配重复的单词，如'hello hello'",
        },
        {
          label: "非捕获组",
          value: "(?:)",
          desc: "创建一个非捕获组，仅分组不捕获\n示例：(?:ab|cd)+ 匹配'ababcd'等，但不保存匹配结果",
        },
        {
          label: "命名组",
          value: "(?<name>)",
          desc: "创建一个命名捕获组\n示例：(?<year>\\d{4})-(?<month>\\d{2}) 可通过名称引用匹配组",
        },
        {
          label: "或",
          value: "|",
          desc: "匹配多个模式之一（或关系）\n示例：cat|dog 匹配'cat'或'dog'",
        },
        {
          label: "反向引用",
          value: "\\1",
          desc: "引用第一个捕获组的内容\n示例：(\\w+)=\\1 匹配'foo=foo'这样的重复模式",
        },
        {
          label: "命名引用",
          value: "\\k<name>",
          desc: "引用命名捕获组的内容\n示例：(?<tag>\\w+)<\\k<tag>> 匹配HTML标签对",
        },
        {
          label: "条件组",
          value: "(?(1)yes|no)",
          desc: "根据捕获组是否匹配选择不同的模式\n示例：(\\d)?[a-z](?(1)\\d|[a-z]) 根据是否有数字选择不同的匹配",
        },
      ],
    };
  },
  methods: {
    insertPattern(pattern) {
      this.$emit("insert", pattern);
    },
  },
});
</script>

<style scoped>
.pattern-section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  padding: 6px;
  height: 100%;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--q-primary);
  opacity: 0.8;
  padding-left: 4px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.pattern-btn {
  font-size: 12px;
  height: 24px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  transition: all 0.3s ease;
  min-height: 24px;
  padding: 0 4px;
}

.pattern-btn:hover {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-color: rgba(var(--q-primary-rgb), 0.2);
  transform: translateY(-1px);
}

/* 暗色模式适配 */
.body--dark .pattern-section {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .pattern-btn {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .pattern-btn:hover {
  background: rgba(var(--q-primary-rgb), 0.15);
  border-color: rgba(var(--q-primary-rgb), 0.3);
}

/* Tooltip 样式优化 */
:deep(.q-tooltip) {
  font-size: 12px;
  padding: 4px 8px;
}

/* 常用模式使用四列布局 */
.col-12 .patterns-grid {
  grid-template-columns: repeat(6, 1fr);
}

/* Tooltip 样式优化 */
.regex-builder :deep(.pattern-tooltip) {
  max-width: 300px;
  padding: 8px 12px;
  white-space: pre-line;
}

.regex-builder :deep(.pattern-tooltip div) {
  line-height: 1.4;
}

.regex-builder :deep(.pattern-tooltip div + div) {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
