<template>
  <q-card style="min-width: 500px">
    <q-card-section>
      <div
        class="text-grey text-h6 text-italic full-width"
        v-if="!allUserData.length"
      >
        还未添加用户变量
      </div>
      <q-input
        v-for="item in allUserData"
        :key="item.id"
        v-model="item.value"
        class="full-width q-ma-md"
        type="text"
        suffix="仅本机"
        outlined
        :placeholder="item.value || '本机未设置'"
      >
        <template v-slot:prepend>
          <q-chip color="primary" text-color="white" dense>{{
            item.id
          }}</q-chip>
        </template>
        <template v-slot:append>
          <q-toggle
            dense
            class="q-mr-sm"
            v-model="item.isNative"
            color="primary" />
          <q-btn
            flat
            dense
            color="primary"
            icon="send"
            @click="insertText(`{{usr:${item.id}}}`)"
            v-if="showInsertBtn" />
          <q-btn
            flat
            dense
            color="negative"
            icon="close"
            @click="delUserData(item.id)" /></template
      ></q-input>
    </q-card-section>
    <q-card-section class="flex justify-end q-gutter-sm">
      <q-btn flat color="grey" label="退出" v-close-popup />
      <q-btn
        flat
        color="deep-orange"
        :disable="!allUserData.length"
        label="更新"
        @click="saveUserData"
      />
      <q-btn flat color="primary" label="添加" @click="addUserData" />
    </q-card-section>
  </q-card>
</template>

<script>
import { dbManager } from "js/utools.js";
export default {
  data() {
    return {
      allUserData: [],
    };
  },
  props: {
    showInsertBtn: Boolean,
  },
  mounted() {
    this.allUserData = dbManager.userData.all();
  },
  methods: {
    saveUserData() {
      this.allUserData.forEach((item) => {
        dbManager.userData.put(item.value, item.id, item.isNative);
      });
      quickcommand.showMessageBox("更新完毕！");
    },
    delUserData(id) {
      quickcommand.showConfirmBox("删除后不可恢复").then(() => {
        dbManager.userData.del(id);
        this.allUserData = this.allUserData.filter((item) => item.id !== id);
      });
    },
    insertText(text) {
      this.$emit("insertText", text);
    },
    addUserData() {
      quickcommand.showInputBox(["变量名称", "变量值"]).then(([id, value]) => {
        if (!/\w+/.test(id))
          return quickcommand.showMessageBox("变量名请使用全英文字母", "error");
        if (this.allUserData.map((x) => x.id).includes(id))
          return quickcommand.showMessageBox("变量名重复", "error");
        this.allUserData.push({
          id,
          value,
          isNative: true,
        });
        dbManager.userData.put(value, id, true);
      });
    },
  },
};
</script>
