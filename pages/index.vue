<template>
  <div id="index">
    <Search/>
    <UniversityList />
    <!-- <UniversityDistribution /> -->
  </div>
</template>

<script>
import Search from '@/components/utils/search'
import UniversityList from '@/components/university/university-list'
import UniversityDistribution from '@/components/university/university-distribution'
export default {
  name: 'index',
  layoyt: 'default',
  components: {
    Search,
    UniversityList,
    UniversityDistribution
  },
  head: { title: 'IPv6部署状态 -- 总览' }
}
</script>

<style lang="scss">

</style>
