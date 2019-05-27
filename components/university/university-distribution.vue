<template>
  <section id="university-distribution">
    <section class="universityDistribution-title">
      <div class="title">/ 各省市高校IPv6部署 /</div>
      <section class="select">
        <span :class="showProvince ? 'active' : 'unactive'" @click="showProvince = true">列表</span>
        <span> / </span>
        <span :class="showProvince ? 'unactive' : 'active'" @click="showProvince = false">地图</span>
      </section>
    </section>
    <UniversityProvince v-if="showProvince" />
    <UniversityMap v-else />
  </section>
</template>

<script>
import UniversityProvince from './university-province'
import UniversityMap from './university-map'

export default {
  components: {
    UniversityProvince,
    UniversityMap
  },
  head: { script: [{ src: 'https://api.map.baidu.com/api?v=2.0&ak=eDa0t6bUVXlSGheGwaFfzxp7V8ODincj' }] },
  data() {
    return { showProvince: true }
  },
  methods: {
    handleActive(e) {
      return this.showProvince * e ? 'active' : 'unactive'
    }
  }
}
</script>

<style lang="scss" scoped>
#university-distribution {
  position: relative;
  .universityDistribution-title {
    text-align: center;
    margin: 20px;
    cursor: pointer;
    .title {
      font-size: 30px;
      color: #606266;
    }
    .select {
      font-size: 20px;
      font-weight: 800;
      .active {
        color: #409eff;
      }
      .unactive {
        color: #aaa;
      }
    }
  }
}
</style>
