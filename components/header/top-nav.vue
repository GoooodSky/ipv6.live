<template>
  <nav id="top-nav">
    <nuxt-link
      class="nav-item"
      :class="{ 'active-nav-item': this.$route.path == '/' }"
      to="/"
      >首页</nuxt-link
    >
    <!-- <nuxt-link
      class="nav-item"
      :class="{ 'active-nav-item': this.$route.path == '/detail' }"
      to="/detail"
      >高校详情</nuxt-link
    > -->
    <nuxt-link
      class="nav-item"
      :class="{ 'active-nav-item': this.$route.path == '/map' }"
      to="/map"
      >高校地图</nuxt-link
    >
    <!-- <li class="nav-item" index="4">IPv4/IPv6过渡</li>
    <li class="nav-item" index="5">API</li>
    <li class="nav-item" index="6">关于我们</li>-->
  </nav>
</template>

<script>
export default {};
</script>

<style lang="scss">
#top-nav {
  display: flex;
  list-style: none;
  margin-left: 20px;
  .nav-item {
    box-sizing: border-box;
    padding: 0 15px;
    color: white;
    cursor: pointer;
    border-bottom: 4px transparent solid;
    transition: 0.5s;
    &:hover {
      border-bottom: 4px #fbe231 solid !important;
      transition: 0.5s;
    }
  }
  .active-nav-item {
    border-bottom: 4px #fbe231 solid;
  }
}
</style>
