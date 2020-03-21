<template>
  <section id="visitor-status">
    <span>
      当前IP: {{ address }}
      <sup :style="{color:IPv6Support?'#67C23A':'#F56C6C'}">{{ family }}</sup>
    </span>
    <span v-if="IPv6Support">恭喜！您已经支持IPv6</span>
    <span v-else>您的网络暂不支持IPv6</span>
  </section>
</template>

<script>
export default {
  name: "visitor-status",
  data() {
    return {
      IPv6Support: "",
      address: "",
      family: ""
    };
  },
  async mounted() {
    let {
      data: { ip, family }
    } = await this.$axios.get("/api/getVisitorStatus");
    this.address = ip;
    this.family = family;
    this.IPv6Support = family == "IPv6" ? true : false;
  }
};
</script>

<style lang="scss" scoped>
#visitor-status {
  // letter-spacing: 1px;
  // overflow: hidden;
  max-width: 100vw;
  span {
    display: block;
    white-space:nowrap;
    margin-bottom: 10px;
    text-align: center;
  }
}
</style>
