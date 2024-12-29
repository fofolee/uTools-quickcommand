<template>
  <div class="q-pa-sm">
    <!-- 添加新header按钮 -->
    <div class="row items-center q-gutter-sm">
      <q-select
        v-model="newHeaderField"
        :options="commonHeaders"
        label="添加常用Header"
        dense
        outlined
        emit-value
        map-options
        style="width: 200px"
        @update:model-value="addCommonHeader"
      >
        <template v-slot:prepend>
          <q-icon name="add" />
        </template>
      </q-select>
      <q-btn flat round dense icon="add" @click="addCustomHeader" />
    </div>

    <!-- header列表 -->
    <div
      v-for="(header, index) in headersList"
      :key="index"
      class="row q-col-gutter-sm q-mt-sm items-center"
    >
      <!-- header名称 -->
      <div class="col-4">
        <q-input
          v-if="!header.isCommon"
          v-model="header.name"
          label="Header名称"
          dense
          outlined
          @update:model-value="emitUpdate"
        />
        <q-input
          v-else
          :model-value="header.name"
          label="Header名称"
          dense
          outlined
          readonly
        />
      </div>

      <!-- header值 -->
      <div class="col">
        <div class="row items-center q-col-gutter-sm">
          <!-- User-Agent特殊处理 -->
          <template v-if="header.name === 'User-Agent'">
            <div class="col">
              <VariableInput
                v-model="header.value"
                label="User Agent"
                :command="{ icon: 'devices' }"
                @update:model-value="emitUpdate"
              />
            </div>
            <div class="col-auto">
              <q-btn-dropdown flat dense icon="list">
                <q-list>
                  <q-item
                    v-for="ua in userAgentOptions"
                    :key="ua.value"
                    clickable
                    v-close-popup
                    @click="setUserAgent(header, ua.value)"
                  >
                    <q-item-section>
                      <q-item-label>{{ ua.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </template>
          <!-- 其他header -->
          <template v-else>
            <div class="col">
              <VariableInput
                v-model="header.value"
                :label="header.name"
                :command="{ icon: 'code' }"
                @update:model-value="emitUpdate"
              />
            </div>
          </template>

          <!-- 删除按钮 -->
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              icon="delete"
              @click="removeHeader(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../VariableInput.vue";
import { userAgent, commonHeaders } from "js/options/httpHeaders";

export default defineComponent({
  name: "HeaderEditor",
  components: {
    VariableInput,
  },
  props: {
    headers: {
      type: [Object, String],
      default: () => ({}),
    },
  },
  emits: ["input"],
  data() {
    let headersObj = {};
    if (typeof this.headers === "string") {
      try {
        const match = this.headers.match(/headers":\s*({[^}]+})/);
        if (match) {
          headersObj = JSON.parse(match[1]);
        }
      } catch (e) {
        console.warn("Failed to parse headers from code string");
      }
    } else if (typeof this.headers === "object") {
      headersObj = this.headers;
    }

    return {
      headersList: Object.entries(headersObj).map(([name, value]) => ({
        name,
        value: typeof value === "string" ? value : JSON.stringify(value),
        isCommon: commonHeaders.some((h) => h.value === name),
      })),
      newHeaderField: null,
      commonHeaders,
      userAgentOptions: userAgent,
    };
  },
  methods: {
    addCommonHeader(headerName) {
      if (!headerName) return;
      if (this.headersList.some((h) => h.name === headerName)) {
        this.newHeaderField = null;
        return;
      }

      this.headersList.push({
        name: headerName,
        value: "",
        isCommon: true,
      });

      this.$nextTick(() => {
        this.newHeaderField = null;
      });

      this.emitUpdate();
    },
    addCustomHeader() {
      this.headersList.push({
        name: "",
        value: "",
        isCommon: false,
      });
    },
    removeHeader(index) {
      this.headersList.splice(index, 1);
      this.emitUpdate();
    },
    setUserAgent(header, value) {
      header.value = value;
      this.emitUpdate();
    },
    emitUpdate() {
      const headers = {};
      this.headersList.forEach((header) => {
        if (header.name && header.value) {
          headers[header.name] = header.value;
        }
      });

      this.$emit("input", headers);
    },
  },
});
</script>
