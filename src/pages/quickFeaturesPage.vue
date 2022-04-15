<script>
export default {
  data() {
    return {
      featureType: this.$route.params.featuretype,
    };
  },
  mounted() {
    switch (this.featureType) {
      case "pluNickName":
        this.showNickNameSetting();
        break;
      case "favFile":
        break;
      case "favUrl":
        break;
      default:
        break;
    }
  },
  methods: {
    showNickNameSetting() {
      quickcommand
        .showInputBox(["插件的功能关键字", "要设置的别名"], "插件别名设置")
        .then((res) => {});
    },
  },
};
</script>
