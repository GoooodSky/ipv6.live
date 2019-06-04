<template>
  <div id="universityList">
    <section id="universityList-title">
      <h1>/ 高校IPv6部署详情 /</h1>
      <section class="intro">
        <p>权威性：收录教育部2017年公布的全部2631所高校</p>
        <p>有效性：多重验证机制，保证数据的真实有效<sup>[1]</sup></p>
        <p>及时性：每小时更新全部数据，保证最新动态</p>
      </section>
    </section>
    <section id="universityList-search">
      <el-select class="select" v-model="province"> <el-option v-for="item in provinces" :key="item" :value="item"> </el-option> </el-select>
      <span class="result">{{ province }}共{{ universityCount }}所高校,支持IPv6的高校{{ ipv6SupportCount }}所，普及率{{ percentage + '%' }}</span>
    </section>
    <el-table :data="universityList" :header-cell-style="{ background: 'rgba(251, 226, 49,0.1)' }">
      <el-table-column prop="name" label="高校名称" align="center" fixed />
      <el-table-column prop="website" label="官网地址" align="center" />
      <el-table-column prop="ipv6Resolve" label="IPv6解析" align="center" />
      <el-table-column prop="ipv4Resolve" label="IPv4解析" align="center"> </el-table-column>
      <el-table-column prop="ipv6Ping" label="IPv6响应" width="100" align="center">
        <template slot-scope="scope">
          <span v-html="scope.row.ipv6Ping ? yes : no"></span>
        </template>
      </el-table-column>
      <el-table-column prop="ipv4Ping" label="IPv4响应" width="100" align="center">
        <template slot-scope="scope">
          <span v-html="scope.row.ipv4Ping ? yes : no"></span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="httpAccess" label="HTTP访问" width="100" align="center">
        <template slot-scope="scope">
          <span v-html="scope.row.httpAccess ? yes : no"></span>
        </template>
      </el-table-column>
      <el-table-column prop="httpsAccess" label="HTTPS访问" width="100" align="center">
        <template slot-scope="scope">
          <span v-html="scope.row.httpsAccess ? yes : no"></span>
        </template>
      </el-table-column> -->
      <el-table-column prop="cname" label="查看详情" width="100" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="$store.dispatch('detailVisible', scope.row.name)"> <i class="el-icon-search"></i> </el-button>
        </template>
      </el-table-column>
    </el-table>
    <UniversitySearch />

    <el-pagination
      id="pagination"
      background
      layout="prev, pager, next, sizes"
      :total="universityCount"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :pager-count="5"
      :page-sizes="[20, 30, 50, 100]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import UniversitySearch from './university-search'
export default {
  name: 'university-list',
  layoyt: 'default',
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      province: '全国',
      yes: '<i class="el-icon-success" style="color: #67C23A"></i>',
      no: '<i class="el-icon-error" style="color: #F56C6C"></i>'
    }
  },
  components: { UniversitySearch },
  computed: {
    universityList() {
      return this.$store.state.universityList
        .filter(item => {
          if (this.province == '全国') {
            return item.province
          } else {
            return item.province == this.province
          }
        })
        .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    provinces() {
      return Object.keys(this.$store.state.provincesDetail)
    },
    provincesDetail() {
      return this.$store.state.provincesDetail
    },
    ipv6SupportCount() {
      return this.provincesDetail[this.province].ipv6SupportCount
    },
    universityCount() {
      return this.provincesDetail[this.province].universityCount
    },
    percentage() {
      return this.provincesDetail[this.province].percentage
    }
  },
  methods: {
    handlePageChange(e) {
      this.currentPage = e //当前是第几页
    },
    handleSizeChange(e) {
      this.pageSize = e // 每页显示多少
    },
    tableHeaderFixed() {
      let tableHeader = document.querySelector('#universityList .el-table__header-wrapper')
      let tableHeaderTop = this.$getElementTop(tableHeader)
      window.addEventListener('scroll', () => {
        let universityListLen = document.querySelector('#universityList .el-table').clientHeight
        let scrollTop = document.documentElement.scrollTop
        if (scrollTop > tableHeaderTop && scrollTop < tableHeaderTop + universityListLen - 240) {
          tableHeader.classList.add('tableHeaderFixed')
          tableHeader.parentNode.style['padding-top'] = tableHeader.offsetHeight + 'px'
        } else {
          tableHeader.classList.remove('tableHeaderFixed')
          tableHeader.parentNode.style['padding-top'] = '0'
        }
      })
    }
  },
  watch: {
    province: function() {
      this.currentPage = 1
      this.pageSize = 20
    }
  },
  mounted() {
    this.tableHeaderFixed()
  }
}
</script>

<style lang="scss">
#universityList-title {
  margin-top: 20px;
  text-align: center;

  margin: 20px 0;
  h1 {
    font-size: 30px;
  }
  .intro {
    p {
      color: #ccc;
    }
  }
}
#universityList-search {
  background-color: rgba(251, 226, 49, 0.1);
  padding: 0 5% 20px;
  overflow: hidden;
  .select {
    float: left;
    margin: 20px 0 0 20px;
    width: 200px;
    // max-width: 35vw;
    input {
      border-radius: 50px;
    }
  }
  .result {
    display: inline-block;
    float: left;
    margin: 30px 0 0 20px;
    color: #909399;
  }
}
#universityList {
  padding-bottom: 20px;
  #pagination {
    overflow-y: scroll;
    overflow-x: visible;
    // padding: 0 5%;
    margin: 30px auto;
    text-align: center;
  }
}
.tableHeaderFixed {
  position: fixed;
  top: 0;
  z-index: 10;
}
</style>
