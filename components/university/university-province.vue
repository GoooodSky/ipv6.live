<template>
  <section id="provinceList">
    <el-table :data="provinceList" style="width: 100%" :default-sort="{ prop: 'universityCount', order: 'descending' }">
      <el-table-column prop="name" label="省/市/自治区" align="center"> </el-table-column>
      <el-table-column prop="universityCount" label="高校总计(所)" align="center" sortable> </el-table-column>
      <el-table-column prop="ipv6SupportCount" label="支持IPv6的高校(所)" align="center" sortable> </el-table-column>
      <el-table-column prop="percentage" label="IPv6普及率(%)" align="center" sortable> </el-table-column>
    </el-table>
  </section>
</template>

<script>
export default {
  computed: {
    provinceList() {
      let provinces = Object.entries(this.$store.state.provincesDetail).map(province => {
        let [key, value] = province
        return {
          name: key,
          universityCount: value.universityCount,
          ipv6SupportCount: value.ipv6SupportCount,
          percentage: value.percentage
        }
      })
      return provinces
    }
  }
}
</script>

<style lang="scss" scoped></style>
