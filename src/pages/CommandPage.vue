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
        type: "fromUtools",
        data: {},
      },
    };
  },
  mounted() {
    window.commandPage = this;
    this.runCurrentCommand();
  },
  computed: {
    featureCode() {
      return this.$route.params.type + "_" + this.$route.params.uid;
    },
    currentCommand() {
      return this.$utools.whole.db.get("qc_" + this.featureCode).data;
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.runCurrentCommand();
  },
  methods: {
    runCurrentCommand() {
      this.$refs.result.runCurrentCommand(this.currentCommand);
    },
  },
};
</script>
