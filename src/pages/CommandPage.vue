<template>
  <div>
    <CommandRunResult :action="action" ref="result"></CommandRunResult>
  </div>
</template>

<script>
import CommandRunResult from "components/CommandRunResult";

export default {
  components: { CommandRunResult },
  data() {
    return {
      action: {
        type: "input",
        data: {},
      },
      featureCode: this.$route.path.slice(1),
    };
  },
  mounted() {
    let command =
      this.featureCode.slice(0, 8) === "default_"
        ? require(`../json/${this.featureCode}.json`)
        : this.$root.utools.whole.db.get("qc_" + this.featureCode).data;
    this.runCurrentCommand(command);
  },
  methods: {
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
