<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础配置 -->
    <div class="col-12">
      <VariableInput
        v-model="localConfigs.goto.url"
        label="网址"
        icon="link"
        @update:model-value="updateConfigs"
      />
    </div>

    <!-- Headers配置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <VariableInput
            v-model="localConfigs.goto.headers.Referer"
            label="Referer"
            icon="link"
            @update:model-value="updateConfigs"
          />
        </div>
        <div class="col-12">
          <div class="row q-col-gutter-sm">
            <div class="col">
              <VariableInput
                v-model="localConfigs.goto.headers.userAgent"
                label="User-Agent"
                icon="devices"
                @update:model-value="updateConfigs"
              />
            </div>
            <div class="col-auto">
              <q-select
                v-model="selectedUA"
                :options="userAgentOptions"
                label="常用 UA"
                dense
                filled
                emit-value
                map-options
                options-dense
                style="min-width: 150px"
              >
                <template v-slot:prepend>
                  <q-icon name="list" />
                </template>
              </q-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 超时配置 -->
    <div class="col-12">
      <NumberInput
        v-model="localConfigs.goto.timeout"
        icon="timer"
        label="超时时间(ms)"
        @update:model-value="updateConfigs"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { defaultUBrowserConfigs } from "js/composer/ubrowserConfig";
import { userAgent } from "js/options/httpOptions";
import VariableInput from "components/composer/ui/VariableInput.vue";
import NumberInput from "components/composer/ui/NumberInput.vue";
export default defineComponent({
  name: "UBrowserBasic",
  components: {
    VariableInput,
    NumberInput,
  },
  props: {
    configs: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedUA: null,
      localConfigs: defaultUBrowserConfigs.goto,
      userAgentOptions: userAgent,
    };
  },
  created() {
    // 初始化本地配置
    this.localConfigs = window.lodashM.cloneDeep(this.configs);
  },
  methods: {
    updateConfigs() {
      this.$emit("update:configs", window.lodashM.cloneDeep(this.localConfigs));
    },
  },
  watch: {
    configs: {
      deep: true,
      handler(newConfigs) {
        this.localConfigs = window.lodashM.cloneDeep(newConfigs);
      },
    },
    selectedUA(value) {
      if (value) {
        this.localConfigs.goto.headers.userAgent.value = value;
        this.localConfigs.goto.headers.userAgent.isString = true;
        this.updateConfigs();
        this.selectedUA = null;
      }
    },
  },
});
</script>
