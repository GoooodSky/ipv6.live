<template>
  <header id="header">
    <TopNav />
  </header>
</template>

<script>
import TopNav from './top-nav'
export default {
  components: { TopNav }
}
</script>

<style lang="scss">
#header {
  display: flex;
  background-color: #004881;
  top: 0;
  width: 100%;
  height: 55px;
  line-height: 55px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  z-index: 999;
}
</style>
