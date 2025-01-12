<template>
  <CommandComposer
    ref="composer"
    @use-composer="handleComposer"
    :show-close-button="false"
    class="fixed-full"
  />
  <!-- 运行结果 -->
  <CommandRunResult :action="action" ref="result"></CommandRunResult>
</template>

<script>
import CommandComposer from "components/composer/CommandComposer.vue";
import CommandRunResult from "components/CommandRunResult";

export default {
  components: { CommandComposer, CommandRunResult },
  props: {
    action: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleComposer({ type, code }) {
      switch (type) {
        case "run":
          return this.runCurrentCommand(code);
      }
    },
    runCurrentCommand(cmd) {
      if (!cmd) return;
      let command = {
        cmd: cmd,
        output: "text",
        program: "quickcommand",
      };
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
