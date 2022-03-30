<template>
  <div>newCommand</div>
</template>

<script>
export default {
  mounted() {
    console.log(JSON.parse(localStorage["enterData"]));
  },
};
</script>
