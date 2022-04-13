<template>
  <div>
    <CommandEditor ref="commandEditor" :action="action"></CommandEditor>
  </div>
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
