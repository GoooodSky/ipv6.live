<template>
  <transition name="fade">
    <section id="university-list">
      <div id="universityList-title">
        <h1>高校IPv6部署详情</h1>
        <div class="intro">
          <p>全面性：收录教育部2019年公布的全部2688所高校</p>
          <p>
            有效性：多重验证机制，保证数据的真实有效
            <!-- <sup>[1]</sup> -->
          </p>
          <p>实时性：每小时更新全部数据，保证最新动态</p>
        </div>
      </div>
      <div id="universityList-search">
        <el-select class="select" v-model="province">
          <el-option v-for="item in provinces" :key="item" :value="item"></el-option>
        </el-select>
        <span class="result">
          {{ province }}共{{ universityCount }}所高校,支持IPv6的高校{{
          ipv6SupportCount
          }}所，普及率{{ percentage + "%" }}
        </span>
      </div>
      <el-table
        :data="universityList"
        :header-cell-style="{ background: 'rgba(251, 226, 49,0.1)' }"
      >
        <el-table-column prop="name" label="高校名称" align="center" fixed />
        <el-table-column prop="website" label="官网地址" align="center" />
        <el-table-column prop="IPv6Address" label="IPv6解析" align="center" />
        <el-table-column prop="IPv4Address" label="IPv4解析" align="center"></el-table-column>

        <el-table-column prop="ping4Access" label="ICMPv6响应" width="100" align="center">
          <template slot-scope="scope">
            <span v-html="scope.row.ping4Access ? yes : no"></span>
          </template>
        </el-table-column>
        <el-table-column prop="ping6Access" label="ICMPv4响应" width="100" align="center">
          <template slot-scope="scope">
            <span v-html="scope.row.ping6Access ? yes : no"></span>
          </template>
        </el-table-column>
        <el-table-column prop="httpAccess" label="HTTP访问" width="100" align="center">
          <el-table-column prop="httpAccess" label="IPv6" width="100" align="center">
            <template slot-scope="scope">
              <span v-html="scope.row.httpAccess6 ? yes : no"></span>
            </template>
          </el-table-column>
          <el-table-column prop="httpAccess" label="IPv4" width="100" align="center">
            <template slot-scope="scope">
              <span v-html="scope.row.httpAccess4 ? yes : no"></span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="httpsAccess" label="HTTPS访问" width="100" align="center">
          <el-table-column prop="httpsAccess" label="IPv6" width="100" align="center">
            <template slot-scope="scope">
              <span v-html="scope.row.httpsAccess6 ? yes : no"></span>
            </template>
          </el-table-column>
          <el-table-column prop="httpsAccess" label="IPv4" width="100" align="center">
            <template slot-scope="scope">
              <span v-html="scope.row.httpsAccess4 ? yes : no"></span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column prop="cname" label="查看详情" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="$store.dispatch('detailVisible', scope.row.name)">
              <i class="el-icon-search"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <UniversityDetail />

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
      ></el-pagination>
    </section>
  </transition>
</template>

<script>
import UniversityDetail from './university-detail'
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
  components: { UniversityDetail },
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
        .map(univeristy => {
          univeristy.httpAccess6 = univeristy.HttpTest.some(test => test.IPv6HttpStatus.status == true)
          univeristy.httpsAccess6 = univeristy.HttpsTest.some(test => test.IPv6HttpsStatus.status == true)
          univeristy.httpAccess4 = univeristy.HttpTest.some(test => test.IPv4HttpStatus.status == true)
          univeristy.httpsAccess4 = univeristy.HttpsTest.some(test => test.IPv4HttpsStatus.status == true)

          univeristy.ping4Access = univeristy.PingTest.some(test => test.IPv4Ping.alive == true)
          univeristy.ping6Access = univeristy.PingTest.some(test => test.IPv6Ping.alive == true)
          return univeristy
        })
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
      let tableHeader = document.querySelector('#university-list .el-table__header-wrapper')
      let tableHeaderTop = this.$getElementTop(tableHeader)
      window.addEventListener('scroll', () => {
        let universityListLen = document.querySelector('#university-list .el-table').clientHeight
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
@media screen and (min-width: 768px) {
  #university-list {
    // padding: 0 10%;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
#university-list {
  padding-bottom: 20px;
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
      margin: 30px 0 0 20px;
      color: #909399;
    }
  }
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
