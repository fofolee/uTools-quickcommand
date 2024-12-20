<template>
  <q-menu anchor="bottom end" self="bottom start">
    <q-list>
      <q-item clickable v-close-popup @click="$emit('open-user-data')">
        <q-item-section side>
          <q-icon name="manage_accounts" />
        </q-item-section>
        <q-item-section>用户特殊变量</q-item-section>
        <q-tooltip>
          用户设置的变量，类似一个全局配置项<br />
          配置好后可选择特殊变量中的「usr:」插入<br />
          也可直接在特殊变量中配置
        </q-tooltip>
      </q-item>
      <q-item>
        <q-item-section side>
          <q-icon name="dvr" />
        </q-item-section>
        <q-input
          dense
          outlined
          autogrow
          style="width: 280px"
          autofocus
          v-model="$root.nativeProfile.envPath"
          @blur="saveProfile"
          type="text"
          label="环境变量 PATH"
        >
          <q-tooltip>
            修改本插件环境变量中的 PATH，直接覆盖而非追加
            <br />将会影响到除 quickcommand、html 以外的所有环境
          </q-tooltip>
        </q-input>
      </q-item>
      <q-item v-if="showAlias">
        <q-item-section side>
          <q-icon name="code" />
        </q-item-section>
        <q-input
          dense
          outlined
          autogrow
          style="width: 280px"
          v-model="$root.nativeProfile.alias"
          @blur="saveProfile"
          type="text"
          label="Alias"
        >
          <q-tooltip>
            一行一条，配置方法和 shell 的语法一样<br />如 alias
            python="/home/user/.bin/python"<br />
            将会影响到除 quickcommand、html 以外的所有环境
          </q-tooltip>
        </q-input>
      </q-item>
    </q-list>
  </q-menu>

</template>

<script>

export default {
  name: "EnvConfigMenu",
  data() {
    return {
      showAlias: this.$q.platform.is.mac || this.$q.platform.is.linux,
    };
  },
  methods: {
    saveProfile() {
      this.$root.saveProfile();
    },
  },
};
</script>
