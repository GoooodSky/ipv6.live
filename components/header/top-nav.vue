<template>
  <nav id="nav" @click="handleSelect($event)">
    <li class="nav-item" index="1">主页</li>
    <li class="nav-item" index="2">高校详情</li>
    <li class="nav-item" index="3">高校地图</li>
    <li class="nav-item" index="4">IPv4/IPv6过渡</li>
    <li class="nav-item" index="5">API</li>
    <li class="nav-item" index="6">关于我们</li>
  </nav>
</template>

<script>
export default {
  data() {
    return { activeIndex: '1' }
  },
  methods: {
    handleSelect(e) {
      let index = e.path[0].attributes.index.nodeValue
      this.changeActiveIndex(index)
    },
    changeActiveIndex(index = this.activeIndex) {
      let list = document.getElementsByClassName('nav-item')
      list[this.activeIndex - 1].style['border-bottom'] = '4px transparent solid'
      list[index - 1].style['border-bottom'] = '4px #fbe231 solid'
      this.activeIndex = index
    }
  },
  mounted() {
    this.changeActiveIndex()
  }
}
</script>

<style lang="scss">
#nav {
  display: flex;
  list-style: none;
  margin-left: 20px;
  .nav-item {
    box-sizing: border-box;
    padding: 0 15px;
    cursor: pointer;
    border-bottom: 4px transparent solid;
    transition: 0.5s;
    &:hover {
      // background-color: #fbe231;
      border-bottom: 4px #fbe231 solid !important;
      transition: 0.5s;
    }
  }
}
</style>
