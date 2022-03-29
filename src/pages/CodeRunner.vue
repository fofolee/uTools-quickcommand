<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="row q-gutter-sm">
      <div class="col-3">
        <div style="max-width: 300px">
          <q-select
            dense
            outlined
            label-color="primary"
            v-model="program"
            :options="options"
            label="编程语言"
          >
            <template v-slot:append>
              <q-avatar rounded>
                <img :src="'/logo/' + program + '.png'" />
              </q-avatar>
            </template>
            <template v-slot:option="{ itemProps, itemEvents, opt }">
              <q-item v-bind="itemProps" v-on="itemEvents">
                <q-item-section avatar>
                  <img width="32" :src="'/logo/' + opt + '.png'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
      <div class="col">
        <div class="row q-gutter-sm" v-show="program === 'custom'">
          <div class="col">
            <q-input dense v-model="customOptions.bin" label="解释器路径" />
          </div>
          <div class="col">
            <q-input dense v-model="customOptions.argv" label="解释器参数" />
          </div>
          <div class="col">
            <q-input dense v-model="customOptions.ext" label="后缀,不含." />
          </div>
        </div>
      </div>
      <div class="col-auto doc-container">
        <div class="row q-gutter-sm items-center justify-end">
          <q-input
            dense
            outlined
            style="width: 90px"
            v-model="scptarg"
            label="脚本参数"
            v-show="program !== 'quickcommand'"
          />
          <q-btn
            color="primary"
            label="文档"
            v-show="program === 'quickcommand'"
          />
          <q-btn
            color="primary"
            label="格式化"
            v-show="program === 'quickcommand'"
          />
          <q-btn
            color="primary"
            label="编码设置"
            v-show="program !== 'quickcommand'"
          />
          <q-btn color="primary" label="运行" />
        </div>
      </div>
    </div>
    <div class="row">
      <textarea style="width: 100%; height: 85vh"></textarea>
    </div>
  </div>
</template>

<script>
import GlobalVars from "components/GlobalVars";
export default {
  data() {
    return {
      options: Object.keys(GlobalVars.programs),
      program: "quickcommand",
      editor: "",
      customOptions: { bin: "", argv: "", ext: "" },
      scptarg: ""
    };
  },
  computed: {},
  created() {},
  methods: {},
};
</script>

<style scoped>
</style>
