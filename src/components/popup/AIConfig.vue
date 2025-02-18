<template>
  <q-card style="width: 800px" class="q-pa-sm">
    <div class="text-h5 q-my-md q-px-sm">API配置</div>
    <div>
      <div class="flex q-mb-md q-px-sm" style="height: 26px">
        <ButtonGroup
          v-model="modelToAdd"
          class="col"
          :options="[
            { label: 'OPENAI', value: 'openai' },
            { label: 'OLLAMA', value: 'ollama' },
          ]"
          height="26px"
        />
        <q-icon
          name="add_box"
          @click="addModel"
          color="primary"
          size="26px"
          class="cursor-pointer q-ml-sm"
        />
      </div>
      <q-scroll-area
        :style="`height: ${getConfigListHeight()}px;`"
        class="q-px-sm"
        :vertical-thumb-style="{
          width: '2px',
        }"
      >
        <div class="config-list">
          <div
            v-for="(aiConfig, index) in aiConfigs"
            :key="index"
            class="config-item"
          >
            <div class="row q-col-gutter-sm">
              <q-input
                filled
                dense
                v-model="aiConfig.name"
                class="col"
                placeholder="请输入名称"
              >
                <template v-slot:prepend>
                  <q-badge
                    color="primary"
                    text-color="black"
                    label="名称"
                    class="q-pa-xs"
                  />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="grey"
                    name="remove_circle"
                    @click="deleteModel(index)"
                    size="16px"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
              <q-input
                filled
                dense
                v-model="aiConfig.apiUrl"
                class="col-8"
                :placeholder="`${aiConfig.modelType} API地址`"
              >
                <template v-slot:prepend>
                  <q-badge
                    color="primary"
                    text-color="black"
                    label="接口"
                    class="q-pa-xs"
                  />
                </template>
              </q-input>
            </div>
            <div class="row q-col-gutter-sm">
              <q-select
                filled
                dense
                v-model="aiConfig.model"
                :options="models"
                @focus="getModels(aiConfig)"
                class="col"
              >
                <template v-slot:prepend>
                  <q-badge
                    color="primary"
                    text-color="black"
                    label="模型"
                    class="q-pa-xs"
                  />
                </template>
              </q-select>
              <q-input
                filled
                dense
                v-model="aiConfig.apiToken"
                v-if="aiConfig.modelType === 'openai'"
                type="password"
                class="col-8"
              >
                <template v-slot:prepend>
                  <q-badge
                    color="primary"
                    text-color="black"
                    label="令牌"
                    class="q-pa-xs"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
    <div class="flex justify-end q-gutter-sm q-px-sm">
      <q-btn flat color="grey" label="取消" v-close-popup />
      <q-btn
        flat
        color="primary"
        label="保存"
        v-close-popup
        @click="saveConfig"
      />
    </div>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import { dbManager } from "js/utools.js";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";

export default defineComponent({
  name: "AIConfig",
  components: {
    ButtonGroup,
  },
  data() {
    return {
      modelToAdd: "openai",
      aiConfigs: [],
      models: [],
    };
  },
  methods: {
    async getModels(aiConfig) {
      const { success, result, error } = await window.getModelsFromAiApi(
        aiConfig
      );
      if (!success) {
        quickcommand.showMessageBox(error, "error");
        return;
      }
      this.models = result;
    },
    saveConfig() {
      dbManager.setStorage(
        "cfg_aiConfigs",
        window.lodashM.cloneDeep(this.aiConfigs)
      );
    },
    deleteModel(index) {
      this.aiConfigs.splice(index, 1);
    },
    addModel() {
      this.aiConfigs.push({
        modelType: this.modelToAdd,
        apiUrl: "",
        apiToken: "",
        model: "",
        name: "",
      });
    },
    getConfigListHeight() {
      const counts = Math.min(this.aiConfigs.length, 3);
      return counts * 100 + (counts - 1) * 8;
    },
  },
  mounted() {
    this.aiConfigs = dbManager.getStorage("cfg_aiConfigs") || [];
  },
});
</script>

<style scoped>
.config-list,
.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  border: 1px solid var(--q-primary);
  border-radius: 4px;
  padding: 8px;
}
</style>
