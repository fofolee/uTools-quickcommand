<template>
  <component :is="currentComponent" :ref="currentComponent" />
</template>

<script>
import PluginNickName from "components/quickFeatures/PluginNickName";
import CrontabCmd from "components/quickFeatures/CrontabCmd";
import ApiServer from "components/quickFeatures/ApiServer";
import FavFile from "components/quickFeatures/FavFile";
import FavUrl from "components/quickFeatures/FavUrl";
import { markRaw } from "vue";

export default {
  components: {
    pluNickName: markRaw(PluginNickName),
    crontab: markRaw(CrontabCmd),
    apiServer: markRaw(ApiServer),
    favFile: markRaw(FavFile),
    favUrl: markRaw(FavUrl),
  },
  data() {
    return {
      currentComponent: this.$route.params.featuretype,
    };
  },
  methods: {
    importCommand(command) {
      command = _.cloneDeep(command);
      this.$utools.putDB(
        command,
        this.$utools.DBPRE.QC + command.features.code
      );
      this.$utools.whole.setFeature(command.features);
    },
    getUid() {
      return Number(
        Math.random().toString().substr(3, 3) + Date.now()
      ).toString(36);
    },
  },
};
</script>
