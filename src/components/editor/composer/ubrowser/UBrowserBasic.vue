<template>
  <div class="row q-col-gutter-sm">
    <!-- UserAgent -->
    <div class="col-12">
      <UBrowserInput
        :value="configs.useragent.value"
        @update:modelValue="updateConfig('useragent.value', $event)"
        label="UserAgent"
        icon="person"
      />
    </div>

    <!-- URL -->
    <div class="col-12">
      <UBrowserInput
        :value="configs.goto.url"
        @update:modelValue="updateConfig('goto.url', $event)"
        label="URL"
        icon="link"
      />
    </div>

    <!-- Headers -->
    <div class="col-12">
      <div class="text-subtitle2 q-mb-sm">请求头</div>
      <UBrowserInput
        :value="configs.goto.headers.Referer"
        @update:modelValue="updateConfig('goto.headers.Referer', $event)"
        label="Referer"
        icon="link"
        class="q-mb-sm"
      />
      <UBrowserInput
        :value="configs.goto.headers.userAgent"
        @update:modelValue="updateConfig('goto.headers.userAgent', $event)"
        label="User-Agent"
        icon="person"
      />
    </div>

    <!-- Timeout -->
    <div class="col-12">
      <UBrowserInput
        :value="configs.goto.timeout"
        @update:modelValue="updateConfig('goto.timeout', $event)"
        type="number"
        label="超时时间(ms)"
        icon="timer"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import UBrowserInput from './operations/UBrowserInput.vue';

export default defineComponent({
  name: 'UBrowserBasic',
  components: {
    UBrowserInput
  },
  props: {
    configs: {
      type: Object,
      required: true
    }
  },
  emits: ['update:configs'],
  methods: {
    updateConfig(path, value) {
      const newConfigs = { ...this.configs };
      const keys = path.split('.');
      let current = newConfigs;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      this.$emit('update:configs', newConfigs);
    }
  }
});
</script>
