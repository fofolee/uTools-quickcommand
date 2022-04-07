<template>
  <div
    :style="{
      whiteSpace: 'pre',
    }"
  >
    {{ enterData }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      output: "",
      enterData: "",
    };
  },
  mounted() {
    this.enterData = quickcommand.enterData;
  },
};
</script>
