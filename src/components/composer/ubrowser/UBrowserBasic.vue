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
                :model-value="selectedUA"
                @update:model-value="handleUAChange"
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
import { defineComponent, ref, computed } from "vue";
import { userAgent } from "js/options/httpOptions";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";

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
  emits: ["update:configs"],
  setup(props, { emit }) {
    const selectedUA = ref(null);

    // 使用 computed 处理配置
    const localConfigs = computed({
      get: () => props.configs,
      set: (val) => {
        emit("update:configs", val);
      },
    });

    // 更新配置
    const updateConfigs = () => {
      emit("update:configs", localConfigs.value);
    };

    // 处理 UA 选择
    const handleUAChange = (val) => {
      if (!val) return;

      const newConfigs = window.lodashM.cloneDeep(props.configs);
      if (!newConfigs.goto.headers) {
        newConfigs.goto.headers = {};
      }
      newConfigs.goto.headers.userAgent = {
        value: val,
        isString: true,
        __varInputVal__: true,
      };
      emit("update:configs", newConfigs);
      selectedUA.value = null;
    };

    return {
      selectedUA,
      localConfigs,
      userAgentOptions: userAgent,
      updateConfigs,
      handleUAChange,
    };
  },
});
</script>
