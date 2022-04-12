<template>
  <q-card>
    <q-card-section>
      <q-input dense label="名称" v-model="panelConf.name" />
      <q-input dense label="说明" v-model="panelConf.description" />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="取消" color="grey" v-close-popup />
      <q-btn flat label="禁用" color="negative" v-close-popup />
      <q-btn flat label="启用" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      panelConf: {
        name: "",
        description: "",
      },
    };
  },
};
</script>
