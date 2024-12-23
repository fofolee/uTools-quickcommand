<template>
  <div class="row q-col-gutter-sm">
    <!-- 基础配置 -->
    <div class="col-12">
      <q-input
        v-model="localConfigs.goto.url"
        label="网址"
        dense
        outlined
        @update:model-value="updateConfigs"
      >
        <template v-slot:prepend>
          <q-icon name="link" />
        </template>
      </q-input>
    </div>

    <!-- 超时配置 -->
    <div class="col-12">
      <q-input
        v-model.number="localConfigs.goto.timeout"
        type="number"
        label="超时时间(ms)"
        dense
        outlined
        @update:model-value="updateConfigs"
      >
        <template v-slot:prepend>
          <q-icon name="timer" />
        </template>
      </q-input>
    </div>

    <!-- Headers配置 -->
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-input
            v-model="localConfigs.goto.headers.Referer"
            label="Referer"
            dense
            outlined
            @update:model-value="updateConfigs"
          >
            <template v-slot:prepend>
              <q-icon name="link" />
            </template>
          </q-input>
        </div>
        <div class="col-12">
          <q-input
            v-model="localConfigs.goto.headers.userAgent"
            label="User-Agent"
            dense
            outlined
            @update:model-value="updateConfigs"
          >
            <template v-slot:prepend>
              <q-icon name="computer" />
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserBasic",
  props: {
    configs: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:configs"],
  data() {
    return {
      localConfigs: {
        goto: {
          url: "",
          headers: {
            Referer: "",
            userAgent: "",
          },
          timeout: 60000,
        },
      },
    };
  },
  created() {
    // 初始化本地配置
    this.localConfigs = JSON.parse(JSON.stringify(this.configs));
  },
  methods: {
    updateConfigs() {
      this.$emit(
        "update:configs",
        JSON.parse(JSON.stringify(this.localConfigs))
      );
    },
  },
  watch: {
    configs: {
      deep: true,
      handler(newConfigs) {
        this.localConfigs = JSON.parse(JSON.stringify(newConfigs));
      },
    },
  },
});
</script>
