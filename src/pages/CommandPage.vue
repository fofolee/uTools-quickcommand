<template>
  <div>
    <CommandRunResult :action="action"></CommandRunResult>
  </div>
</template>

<script>
import CommandRunResult from "components/CommandRunResult.vue";

export default {
  component: { CommandRunResult },
  data() {
    return {
      action: {
        type: "fromUtools",
        data: quickcommand.enterData,
      },
    };
  },
  mounted() {},
};
</script>
