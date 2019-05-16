<template>
  <header id="header">
    <!-- <TopNav /> -->
  </header>
</template>

<script>
import TopNav from './top-nav'
export default {
  components: { TopNav },
  methods: {
    headerTransparency() {
      let header = document.getElementById('header')
      let scrollTop = document.documentElement.scrollTop
      let clientHeight = document.documentElement.clientHeight
      header.style['background-color'] = `rgba(45, 45, 45, ${scrollTop / clientHeight})`
    }
  },
  mounted() {
    // window.onload = this.headerTransparency
    // window.onscroll = this.headerTransparency
  }
}
</script>

<style lang="scss">
@media (max-width: 667px) {
  #header {
    #nav {
      display: none !important;
    }
  }
}
#header {
  display: flex;
  position: absolute;
  background-color: transparent;
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
