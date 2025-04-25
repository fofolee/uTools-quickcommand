<template>
  <q-card style="width: 800px" class="q-pa-sm">
    <div class="text-h5 q-my-md q-px-sm">API配置</div>
    <div>
      <div class="q-pa-sm row q-gutter-sm">
        <q-btn
          v-for="option in aiOptions"
          :key="option.value"
          icon="add_link"
          dense
          color="primary"
          :label="option.label"
          @click="addModel(option.value)"
          class="col"
        />
      </div>
      <q-scroll-area
        ref="scrollArea"
        :style="`height: ${getConfigListHeight()}px;`"
        class="q-px-sm"
        :vertical-thumb-style="{
          width: '2px',
        }"
      >
        <draggable
          v-model="aiConfigs"
          item-key="id"
          handle=".drag-handle"
          :animation="200"
          class="config-list"
        >
          <template #item="{ element: aiConfig, index }">
            <div class="config-item">
              <div class="config-item-side-bar">
                <q-icon
                  name="drag_indicator"
                  class="drag-handle cursor-move"
                  size="20px"
                />
              </div>
              <div class="config-item-content">
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
                        text-color="white"
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
                    class="col-7"
                    :placeholder="
                      aiConfig.apiType === 'openai'
                        ? '例：https://api.openai.com'
                        : '例：http://localhost:11434'
                    "
                    v-show="aiConfig.apiType !== 'utools'"
                  >
                    <template v-slot:prepend>
                      <q-badge
                        color="primary"
                        text-color="white"
                        label="接口"
                        class="q-pa-xs"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="row q-col-gutter-sm">
                  <q-input filled dense v-model="aiConfig.model" class="col">
                    <template v-slot:prepend>
                      <q-badge
                        color="primary"
                        text-color="white"
                        label="模型"
                        class="q-pa-xs"
                      />
                    </template>
                    <template v-slot:append>
                      <q-btn-dropdown
                        flat
                        @click="getModels(aiConfig)"
                        dense
                        dropdown-icon="refresh"
                      >
                        <q-list dense>
                          <q-item
                            v-for="model in models"
                            :key="model"
                            clickable
                            v-close-popup
                            @click="aiConfig.model = model"
                          >
                            <q-item-section>
                              {{ model }}
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                      <q-tooltip>获取模型</q-tooltip>
                    </template>
                  </q-input>
                  <q-input
                    filled
                    dense
                    v-model="aiConfig.apiToken"
                    v-if="aiConfig.apiType === 'openai'"
                    :type="tokenInputTypes[index] || 'password'"
                    class="col-7"
                  >
                    <template v-slot:prepend>
                      <q-badge
                        color="primary"
                        text-color="white"
                        label="令牌"
                        class="q-pa-xs"
                      />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        name="visibility_off"
                        @click="tokenInputTypes[index] = 'password'"
                        size="16px"
                        class="cursor-pointer"
                        v-if="tokenInputTypes[index] === 'text'"
                      />
                      <q-icon
                        name="visibility"
                        @click="tokenInputTypes[index] = 'text'"
                        size="16px"
                        class="cursor-pointer"
                        v-else
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </template>
        </draggable>
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
import { defineComponent, ref } from "vue";
import { dbManager } from "js/utools.js";
import draggable from "vuedraggable";
import { getUniqueId } from "js/common/uuid.js";

export default defineComponent({
  name: "AIConfig",
  components: {
    draggable,
  },
  setup() {
    const initAiOptions = utools.allAiModels
      ? [{ label: "uTools内置AI", value: "utools" }]
      : [];

    const aiOptions = ref([
      ...initAiOptions,
      { label: "OPENAI接口(需Key)", value: "openai" },
      { label: "OLLAMA接口", value: "ollama" },
    ]);

    return {
      aiOptions,
    };
  },
  data() {
    return {
      aiConfigs: [],
      models: [],
      tokenInputTypes: [],
    };
  },
  emits: ["save"],
  methods: {
    async getModels(aiConfig) {
      if (aiConfig.apiType === "utools") {
        try {
          const models = await utools.allAiModels();
          this.models = models.map((model) => model.id);
        } catch (error) {
          quickcommand.showMessageBox(
            "获取 uTools AI 模型失败: " + error.message,
            "error"
          );
          this.models = [];
        }
        return;
      }
      const { success, result, error } = await window.getModelsFromAiApi(
        aiConfig
      );
      if (!success) {
        quickcommand.showMessageBox(error, "error");
        this.models = [];
        return;
      }
      this.models = result;
    },
    saveConfig() {
      dbManager.setStorage(
        "cfg_aiConfigs",
        window.lodashM.cloneDeep(this.aiConfigs)
      );
      this.$emit("save");
    },
    deleteModel(index) {
      this.aiConfigs.splice(index, 1);
    },
    addModel(apiType) {
      const defaultConfig = {
        id: getUniqueId(),
        apiType: apiType,
        apiUrl: "",
        apiToken: "",
        model: "",
        name: "",
      };

      if (apiType === "utools") {
        defaultConfig.apiUrl = "";
      }

      this.aiConfigs.unshift(defaultConfig);

    },
    getConfigListHeight() {
      const counts = Math.min(this.aiConfigs.length, 3);
      return counts * 100 + (counts - 1) * 8;
    },
  },
  mounted() {
    this.aiConfigs = (dbManager.getStorage("cfg_aiConfigs") || []).map(
      (config) => ({
        ...config,
        id: config.id || getUniqueId(),
      })
    );
  },
});
</script>

<style scoped>
.config-list,
.config-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  border: 1px solid var(--q-primary);
  border-radius: 4px;
  padding: 8px;
  display: flex;
}

.config-item-side-bar {
  width: 20px;
  padding-top: 8px;
}

.config-item-content {
  flex: 1;
}

.drag-handle {
  cursor: move;
  color: var(--q-primary);
  margin-right: 4px;
}
</style>
