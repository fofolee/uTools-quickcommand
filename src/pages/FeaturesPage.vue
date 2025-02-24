<template>
  <component :is="currentComponent" :ref="currentComponent" />
</template>

<script>
import PluginNickName from "components/quickFeatures/PluginNickName";
import FavFile from "components/quickFeatures/FavFile";
import FavUrl from "components/quickFeatures/FavUrl";
import { markRaw } from "vue";

export default {
  components: {
    pluNickName: markRaw(PluginNickName),
    favFile: markRaw(FavFile),
    favUrl: markRaw(FavUrl),
  },
  data() {
    return {
      currentComponent: this.$route.params.featuretype,
    };
  },
};
</script>
