<template>
  <div>
    <CommandRunResult ref="result"></CommandRunResult>
  </div>
</template>

<script>
import CommandRunResult from "components/CommandRunResult";
import { utoolsFull } from "js/utools.js";

export default {
  components: { CommandRunResult },
  data() {
    return {
      utools: utoolsFull,
      featureCode: this.$route.path.slice(1),
    };
  },
  mounted() {
    let command =
      this.featureCode.slice(0, 8) === "default_"
        ? require(`../json/${this.featureCode}.json`)
        : this.utools.db.get("qc_" + this.featureCode).data;
    this.runCurrentCommand(command);
  },
  methods: {
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
