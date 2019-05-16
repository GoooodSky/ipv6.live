<template>
  <div id="index">
    <Welcome />
    <UniversityList />
    <!-- <UniversityMap /> -->
  </div>
</template>

<script>
import Welcome from '@/components/index/welcome'
import UniversityList from '@/components/university/university-list'
import UniversityMap from '@/components/university/university-map'
import axios from 'axios'
export default {
  name: 'index',
  layoyt: 'default',
  components: {
    Welcome,
    UniversityList,
    UniversityMap
  },
  head() {
    return { title: 'IPv6部署状态 -- 总览' }
  },
  // async fetch({ store, params }) {
  //   let {data: { universityList }} = await axios.get('http://127.0.0.1:3000/api/getUniversity')
  //   store.commit('initial', universityList)
  // }
}
</script>

<style lang="scss"></style>
