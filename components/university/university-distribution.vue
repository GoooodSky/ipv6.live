<template>
  <section id="university-distribution">
    <section class="universityDistribution-title">
      <!-- <div class="title">/ 各省市高校IPv6部署 /</div> -->
      <section class="select">
        <span :class="showProvince ? 'unactive' : 'active'" @click="showProvince = false">地图</span>
        <span>｜</span>
        <span :class="showProvince ? 'active' : 'unactive'" @click="showProvince = true">列表</span>
      </section>
      <section class="intro">根据2019.12.12数据绘制，颜色越深代表该城市支持IPv6的学校越多</section>
    </section>
    <keep-alive>
      <UniversityProvince v-if="showProvince" />
      <UniversityMap v-else />
    </keep-alive>
  </section>
</template>

<script>
import UniversityProvince from "./university-province";
import UniversityMap from "./university-map";

export default {
  components: {
    UniversityProvince,
    UniversityMap
  },
  // head: {
  //
  // },
  data() {
    return { showProvince: false };
  },
  methods: {
    handleActive(e) {
      return this.showProvince * e ? "active" : "unactive";
    }
  }
};
</script>

<style lang="scss" scoped>
#university-distribution {
  .universityDistribution-title {
    text-align: center;
    padding: 20px;
    cursor: pointer;
    .title {
      font-size: 30px;
      color: #aaa;
    }
    .select {
      font-size: 18px;
      color: #aaa;
      .active {
        color: #409eff;
        transition: all 1s;
      }
      .unactive {
        color: #aaa;
      }
    }
    .intro{
      font-size: 12px;
      color: #ccc;
      margin-top: 10px;
      letter-spacing: 1px;
    }
  }
}
</style>
