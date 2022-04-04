<template>
  <div>
    <CodeRunner :action="action"></CodeRunner>
  </div>
</template>

<script>
import CodeRunner from "components/CodeRunner";

export default {
  components: { CodeRunner },
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
