<template>
  <q-card style="width: 600px" class="q-pa-md">
    <q-card-section class="text-h5"> API配置 </q-card-section>
    <q-card-section>
      <ButtonGroup
        v-model="modelType"
        :options="[
          { label: 'OPENAI', value: 'openai' },
          { label: 'OLLAMA', value: 'ollama' },
        ]"
      />
    </q-card-section>
    <q-card-section class="q-gutter-sm column">
      <q-input outlined dense v-model="apiUrl">
        <template v-slot:prepend>
          <q-badge
            color="primary"
            text-color="black"
            label="API地址"
            class="q-pa-xs"
          />
        </template>
      </q-input>
      <q-input outlined dense v-model="apiToken" v-if="modelType === 'openai'">
        <template v-slot:prepend>
          <q-badge
            color="primary"
            text-color="black"
            label="API令牌"
            class="q-pa-xs"
          />
        </template>
      </q-input>
      <q-select
        outlined
        dense
        v-model="model"
        :options="models"
        @focus="getModels"
      >
        <template v-slot:prepend>
          <q-badge
            color="primary"
            text-color="black"
            label="模型名称"
            class="q-pa-xs"
          />
        </template>
      </q-select>
    </q-card-section>
    <q-card-section class="flex justify-end q-gutter-sm">
      <q-btn flat color="grey" label="取消" v-close-popup />
      <q-btn
        flat
        color="primary"
        label="保存"
        v-close-popup
        @click="saveConfig"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";

export default defineComponent({
  name: "AIConfig",
  components: {
    ButtonGroup,
  },
  data() {
    return {
      modelType: "openai",
      apiUrl: "",
      apiToken: "",
      model: "",
      models: [],
    };
  },
  methods: {
    async getModels() {
      try {
        const { success, result } = await window.getModelsFromAiApi({
          modelType: this.modelType,
          apiUrl: this.apiUrl,
          apiToken: this.apiToken,
        });
        this.models = success ? result : [];
      } catch (_) {
        this.models = [];
      }
    },
    saveConfig() {
      this.$root.profile.aiConfig = {
        modelType: this.modelType,
        apiUrl: this.apiUrl,
        apiToken: this.apiToken,
        model: this.model,
      };
      console.log("saveConfig", this.$root.profile.aiConfig);
    },
  },
  mounted() {
    const aiConfig = this.$root.profile.aiConfig || {};
    this.modelType = aiConfig.modelType || "openai";
    this.apiUrl = aiConfig.apiUrl || "";
    this.apiToken = aiConfig.apiToken || "";
    this.model = aiConfig.model || "";
  },
});
</script>
