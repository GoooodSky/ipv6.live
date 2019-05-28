<template>
  <div id="index">
    <Welcome />
    <UniversityList />
    <UniversityDistribution />
  </div>
</template>

<script>
import Welcome from '@/components/index/welcome'
import UniversityList from '@/components/university/university-list'
import UniversityDistribution from '@/components/university/university-distribution'
export default {
  name: 'index',
  layoyt: 'default',
  components: {
    Welcome,
    UniversityList,
    UniversityDistribution
  },
  head: { title: 'IPv6部署状态 -- 总览', script: [{ src: 'https://api.map.baidu.com/api?v=2.0&ak=eDa0t6bUVXlSGheGwaFfzxp7V8ODincj' }] }
}
</script>

<style lang="scss" scoped></style>
