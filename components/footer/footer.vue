<template>
  <footer id="footer">
    <div class="copyright">
      <span>©️版权所有: 北京化工大学&赛尔网络有限公司</span>
      <span class="record">京ICP备16033603号-4</span>
    </div>
  </footer>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
footer {
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 50px;
  background-color: #004881;
  .copyright {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    bottom: 0;
    color: #fff;
    padding: 10px 30px;
    .record {
      float: right;
      // margin-right: 20px;
    }
  }
}
</style>
