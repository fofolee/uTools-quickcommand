<template>
  <div>
    <ComposerEditor :action="action"></ComposerEditor>
  </div>
</template>

<script>
import ComposerEditor from "components/ComposerEditor";

export default {
  components: { ComposerEditor },
  data() {
    return {
      action: {
        type: "composer",
        data: {},
      },
    };
  },
};
</script>
