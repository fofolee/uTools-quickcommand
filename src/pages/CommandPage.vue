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
    this.runCurrentCommand();
  },
  computed: {
    currentCommand() {
      return this.$root.utools.whole.db.get("qc_" + this.featureCode).data;
    },
  },
  methods: {
    runCurrentCommand() {
      this.$refs.result.runCurrentCommand(_.cloneDeep(this.currentCommand));
    },
  },
};
</script>
