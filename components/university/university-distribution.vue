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
  // head: {
  //
  // },
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
    padding: 20px;
    background-color: rgba(251, 226, 49, 0.1);

    cursor: pointer;
    .title {
      font-size: 30px;
      color: #aaa;
    }
    .select {
      font-size: 18px;
      margin: 10px auto;
      font-weight: 800;
      color: #aaa;
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
