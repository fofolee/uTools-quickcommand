<template>
  <BorderLabel
    :label="label"
    :icon="icon"
    :model-value="false"
    class="time-input"
  >
    <div class="row q-col-gutter-sm items-center">
      <!-- 时 -->
      <div class="col-4">
        <q-input
          v-model="hours"
          dense
          borderless
          :placeholder="'00'"
          @update:model-value="updateTime"
          @blur="formatInput('hours')"
          maxlength="2"
          class="time-field"
        >
          <template v-slot:append>
            <div class="text-caption">时</div>
          </template>
        </q-input>
      </div>
      <!-- 分 -->
      <div class="col-4">
        <q-input
          v-model="minutes"
          dense
          borderless
          :placeholder="'00'"
          @update:model-value="updateTime"
          @blur="formatInput('minutes')"
          maxlength="2"
          class="time-field"
        >
          <template v-slot:append>
            <div class="text-caption">分</div>
          </template>
        </q-input>
      </div>
      <!-- 秒 -->
      <div class="col-4">
        <q-input
          v-model="seconds"
          dense
          borderless
          :placeholder="'00'"
          @update:model-value="updateTime"
          @blur="formatInput('seconds')"
          maxlength="2"
          class="time-field"
        >
          <template v-slot:append>
            <div class="text-caption">秒</div>
          </template>
        </q-input>
      </div>
    </div>
  </BorderLabel>
</template>

<script>
import BorderLabel from "./BorderLabel.vue";

export default {
  name: "TimeInput",
  components: {
    BorderLabel,
  },
  props: {
    modelValue: {
      type: String,
      default: "00:00:00",
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    iconClickable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "00:00:00",
    },
  },
  data() {
    return {
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          const parts = newVal.split(":");
          if (parts.length === 3) {
            this.hours = parts[0];
            this.minutes = parts[1];
            this.seconds = parts[2];
          }
        }
      },
    },
  },
  methods: {
    // 更新时间
    updateTime() {
      const formattedTime = `${this.hours}:${this.minutes}:${this.seconds}`;
      this.$emit("update:model-value", formattedTime);
    },
    // 格式化输入
    formatInput(field) {
      const value = this[field];
      let num = parseInt(value) || 0;

      // 限制范围
      switch (field) {
        case "hours":
          num = Math.min(Math.max(num, 0), 99);
          break;
        case "minutes":
        case "seconds":
          num = Math.min(Math.max(num, 0), 59);
          break;
      }

      // 格式化为两位数
      this[field] = num.toString().padStart(2, "0");
      this.updateTime();
    },
  },
};
</script>

<style scoped>
.time-input {
  width: 100%;
  height: 36px;
}

.time-input :deep(.content) {
  padding: 0 8px;
}

.time-field {
  font-size: 13px;
}

.time-input :deep(.border-label) {
  margin-top: 0;
}

/* 文本居中显示 */
.time-input :deep(.q-field__native) {
  text-align: center;
  padding: 0;
  height: 34px;
}

.time-input :deep(.q-field__control) {
  padding: 0 4px;
  height: 34px;
}

/* 调整单位标签样式 */
.time-input :deep(.q-field__append) {
  padding-left: 0;
  height: 34px;
}
</style>
