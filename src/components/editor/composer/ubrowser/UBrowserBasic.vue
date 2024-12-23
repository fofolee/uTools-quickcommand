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
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input
                v-model="localConfigs.goto.headers.userAgent"
                label="User-Agent"
                dense
                outlined
                @update:model-value="updateConfigs"
              >
                <template v-slot:prepend>
                  <q-icon name="devices" />
                </template>
              </q-input>
            </div>
            <div class="col-auto">
              <q-select
                v-model="selectedUA"
                :options="userAgentOptions"
                label="常用 UA"
                dense
                outlined
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
  data() {
    return {
      selectedUA: null,
      localConfigs: {
        useragent: {
          preset: null,
          value: "",
        },
        goto: {
          url: "",
          headers: {
            Referer: "",
            userAgent: "",
          },
          timeout: 60000,
        },
      },
      userAgentOptions: [
        {
          label: "Chrome (Windows)",
          value:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        {
          label: "Chrome (macOS)",
          value:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        {
          label: "Chrome (Linux)",
          value:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        {
          label: "IE 11",
          value:
            "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
        },
        {
          label: "微信 (Android)",
          value:
            "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A.240205.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.64 Mobile Safari/537.36 XWEB/1160027 MMWEBSDK/20231202 MMWEBID/2308 MicroMessenger/8.0.47.2560(0x28002F35) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        },
        {
          label: "微信 (iOS)",
          value:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f2c) NetType/WIFI Language/zh_CN",
        },
        {
          label: "iPhone",
          value:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        },
        {
          label: "iPad",
          value:
            "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        },
        {
          label: "Android Phone",
          value:
            "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
        },
        {
          label: "Android Tablet",
          value:
            "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      ],
    };
  },
  created() {
    // 初始化本地配置
    this.localConfigs = _.cloneDeep(this.configs);
  },
  methods: {
    updateConfigs() {
      this.$emit("update:configs", _.cloneDeep(this.localConfigs));
    },
  },
  watch: {
    configs: {
      deep: true,
      handler(newConfigs) {
        this.localConfigs = _.cloneDeep(newConfigs);
      },
    },
    selectedUA(value) {
      if (value) {
        this.localConfigs.goto.headers.userAgent = value;
        this.updateConfigs();
        this.selectedUA = null;
      }
    },
  },
});
</script>
