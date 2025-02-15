<template>
  <CommandEditor ref="commandEditor" :action="action" />
</template>

<script>
import CommandEditor from "components/CommandEditor";

export default {
  components: { CommandEditor },
  data() {
    return {
      action: {
        type: "run",
        data: {},
      },
    };
  },
};
</script>
