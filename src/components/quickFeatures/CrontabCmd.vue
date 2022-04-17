<template>
  <q-card>
    <q-card-section class="text-h5 text-center">定时执行</q-card-section>
    <q-card-section class="q-gutter-md">
      <q-input
        v-model="crontab"
        type="text"
        standout="bg-primary text-white"
        label="请输入 Crontab 表达式"
        mask="# # # # # #"
      >
        <template v-slot:append>
          <q-btn flat icon="help"></q-btn>
        </template>
      </q-input>
      <pre class="explain">
        {{ explain }}
      </pre>
      <div>当前状态：</div>
      <div>下次执行时间：</div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat color="negative" v-close-popup>禁用</q-btn>
      <q-btn flat color="primary" v-close-popup>启用</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
const explain = `
┌──────────────── (可选) 秒 (0 - 59)
│ ┌────────────── 分钟 (0 - 59)
│ │ ┌──────────── 小时 (0 - 23)
│ │ │ ┌────────── 日 (1 - 31)
│ │ │ │ ┌──────── 月 (1 - 12, 一月-十二月)
│ │ │ │ │ ┌────── 星期 (0 - 6, 周日-周六)
*  *  *  *  *  *`;

export default {
  data() {
    return {
      crontab: "",
      explain: explain,
    };
  },
};
</script>

<style scoped>
.explain {
  background: #ffffff18;
  padding: 0 10px;
  border-radius: 5px;
}
</style>
