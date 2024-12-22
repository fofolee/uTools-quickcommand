<template>
  <div class="composer-card q-mb-sm">
    <q-card flat bordered>
      <q-card-section horizontal class="q-pa-sm">
        <!-- 拖拽手柄 -->
        <div class="drag-handle cursor-move q-mr-sm">
          <q-icon name="drag_indicator" size="24px" class="text-grey-6" />
        </div>

        <div class="col">
          <!-- 命令标题和描述 -->
          <div class="row items-center q-mb-sm">
            <div class="text-subtitle1">{{ command.label }}</div>
            <q-space />
            <!-- 输出开关 -->
            <q-toggle
              v-if="hasOutput"
              v-model="saveOutputLocal"
              label="保存输出"
              dense
            />
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="$emit('remove')"
            />
          </div>

          <!-- 参数输入 -->
          <div class="row items-center">
            <!-- 使用上一个命令的输出 -->
            <template v-if="canUseOutput && availableOutputs.length > 0">
              <q-select
                v-model="useOutputLocal"
                :options="availableOutputs"
                dense
                outlined
                class="col"
                emit-value
                map-options
                clearable
                :label="placeholder"
                @clear="handleClearOutput"
              >
                <template v-slot:prepend>
                  <q-icon name="input" />
                </template>
                <template v-slot:selected-item="scope">
                  <div class="row items-center">
                    <q-icon name="output" color="primary" size="xs" class="q-mr-xs" />
                    {{ scope.opt.label }}
                  </div>
                </template>
              </q-select>
            </template>
            <!-- 按键编辑器 -->
            <template v-else-if="command.hasKeyRecorder">
              <KeyEditor v-model="argvLocal" class="col" />
            </template>
            <!-- 普通参数输入 -->
            <template v-else>
              <q-input
                v-model="argvLocal"
                dense
                outlined
                class="col"
                :label="placeholder"
              >
                <template v-slot:prepend>
                  <q-icon name="code" />
                </template>
              </q-input>
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import KeyEditor from './KeyEditor.vue'

export default defineComponent({
  name: 'ComposerCard',
  components: {
    KeyEditor
  },
  props: {
    command: {
      type: Object,
      required: true
    },
    hasOutput: {
      type: Boolean,
      default: false
    },
    canUseOutput: {
      type: Boolean,
      default: false
    },
    availableOutputs: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showKeyRecorder: false
    }
  },
  emits: ['remove', 'toggle-output', 'update:argv', 'update:use-output'],
  computed: {
    saveOutputLocal: {
      get() {
        return this.command.saveOutput
      },
      set(value) {
        this.$emit('toggle-output')
      }
    },
    argvLocal: {
      get() {
        return this.command.argv
      },
      set(value) {
        this.$emit('update:argv', value)
      }
    },
    useOutputLocal: {
      get() {
        return this.command.useOutput
      },
      set(value) {
        this.$emit('update:use-output', value)
      }
    }
  },
  methods: {
    handleClearOutput() {
      this.$emit('update:use-output', null)
    },
    handleKeyRecord(keys) {
      this.showKeyRecorder = false;
      // 从keyTap("a","control")格式中提取参数
      const matches = keys.match(/keyTap\((.*)\)/)
      if (matches && matches[1]) {
        this.$emit('update:argv', matches[1]);
      }
    }
  }
})
</script>

<style scoped>
.composer-card {
  transition: all 0.3s ease;
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.drag-handle:hover {
  color: var(--q-primary);
}
</style>
