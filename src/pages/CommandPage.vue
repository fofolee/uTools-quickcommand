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
      featureCode: this.$route.path.slice(1),
    };
  },
  mounted() {
    window.commandPage = this;
    this.runCurrentCommand();
  },
  computed: {
    currentCommand() {
      return this.$utools.whole.db.get("qc_" + this.featureCode).data;
    },
  },
  methods: {
    runCurrentCommand() {
      this.$refs.result.runCurrentCommand(_.cloneDeep(this.currentCommand));
    },
  },
};
</script>
