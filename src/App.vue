<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {
    };
  },
  computed: {},
  created: function () {
    // this.$router.push("/configuration");
    this.$router.push("/code");
  },
  methods: {},
});
</script>
