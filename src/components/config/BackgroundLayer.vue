<template>
  <div
    class="background-layer"
    :style="{
      background: $q.dark.isActive
        ? $root.profile.backgroundImgDark
          ? `url('${$root.profile.backgroundImgDark}')`
          : 'none'
        : $root.profile.backgroundImgLight
        ? `url('${$root.profile.backgroundImgLight}')`
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }"
  ></div>
</template>

<script>
export default {
  name: 'BackgroundLayer'
}
</script>

<style scoped>
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}
</style>
