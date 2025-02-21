<template>
  <q-card style="width: 400px">
    <q-card-section>
      <div class="row q-gutter-md">
        <div class="col-auto justify-center content-center flex q-pa-md">
          <q-avatar square class="commandLogo">
            <q-img :src="features.icon" @click="showIconPicker = true"
          /></q-avatar>
        </div>
        <div class="col">
          <q-select
            hide-dropdown-icon
            label-color="primary"
            transition-show="jump-down"
            transition-hide="jump-up"
            v-model="features.cmds"
            max-values="3"
            type="text"
            placeholder="键入后回车"
            use-input
            use-chips
            options-dense
            multiple
            new-value-mode="add-unique"
            input-debounce="0"
            label="关键字"
            @blur="features.cmds.length || features.cmds.push(currentTag)"
          />
          <q-input
            label-color="primary"
            v-model="features.explain"
            type="text"
            placeholder="请输入描述"
            label="描述"
            @blur="features.explain || (features.explain = ' ')"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="取消" color="grey" v-close-popup />
      <q-btn flat label="确定" color="primary" v-close-popup @click="markTag" />
    </q-card-actions>
    <q-dialog v-model="showIconPicker" position="right">
      <iconPicker
        @iconChanged="(dataUrl) => (features.icon = dataUrl)"
        ref="icon"
      />
    </q-dialog>
  </q-card>
</template>

<script>
import IconPicker from "components/popup/IconPicker";
import { utoolsFull } from "js/utools.js";

export default {
  components: { IconPicker },
  emits: ["update-activated-quick-panels"],
  data() {
    return {
      utools: utoolsFull,
      features: {
        explain: `进入${this.currentTag}的面板视图`,
        icon: "logo/quickcommand.png",
        cmds: [this.currentTag],
        platform: ["win32", "darwin", "linux"],
        code: `panel_${window.hexEncode(this.currentTag)}`,
      },
      showIconPicker: false,
    };
  },
  props: {
    currentTag: String,
  },
  methods: {
    markTag() {
      this.utools.setFeature(window.lodashM.cloneDeep(this.features));
      this.$emit("update-activated-quick-panels", this.currentTag);
      quickcommand.showMessageBox(
        `主输入框输入『${this.features.cmds.join("、")}』即可直接进入『${
          this.currentTag
        }』的面板视图`
      );
    },
  },
};
</script>
