<template>
  <el-dialog
    id="university-detail"
    v-model="universityDetail"
    :visible.sync="$store.state.detailVisible"
    center
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="false"
    :destroy-on-close="true"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <template v-if="universityDetail">
      <span slot="title" class="dialog-title">{{ universityDetail.name }}</span>
      <section class="dialog-body">
        <div class="dialog-img">
          <img :src="'/img/universityCrest/' + universityDetail.schoolCode + '.png'" />
        </div>
        <div class="dialog-universityDetail">
          <p>所在地：{{ universityDetail.province }} {{ universityDetail.city == universityDetail.province ? '' : universityDetail.city }}</p>
          <p>
            <span>高校类型：{{ universityDetail.level }}</span>
            <span
              class="platform"
              v-if="universityDetail.platform != 0"
            >{{ handleLevel(universityDetail.platform) }}</span>
          </p>
          <p>高校隶属于：{{ universityDetail.superior }}</p>
          <p>学校网址：{{ universityDetail.website }}</p>
          <p
            :style="universityDetail.IPv6DNS ? 'color: #67C23A':'color: #F56C6C' "
          >IPv6解析：{{ universityDetail.IPv6Address }}</p>
          <p
            :style="universityDetail.IPv6DNS ? 'color: #67C23A': 'color: #F56C6C'"
          >IPv4解析：{{ universityDetail.IPv4Address }}</p>

          <div id="chart"></div>
        </div>
        <el-dialog
          class="report-dialog"
          width="80vmin"
          :title="$store.state.selectedUniversity + '【错误反馈】'"
          :visible.sync="reportVisible"
          append-to-body
        >
          <el-checkbox-group v-model="reportList">
            <el-checkbox label="网址错误"></el-checkbox>
            <el-checkbox label="IPv6地址解析错误"></el-checkbox>
            <el-checkbox label="IPv4地址解析错误"></el-checkbox>
          </el-checkbox-group>
          <el-input v-model="input" placeholder="其它问题"></el-input>

          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="reportError">提交</el-button>
          </span>
        </el-dialog>
        <span class="report" @click="reportVisible = true">
          <i class="el-icon-info"></i>
        </span>
      </section>

      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="$store.dispatch('detailInvisible')">关闭</el-button>
      </span>
    </template>
    <template v-else>
      <span slot="title" class="dialog-title">抱歉，没有这所学校</span>
      <section class="dialog-body">
        <span>错误的名称，或尚未收录该所高校</span>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="$store.dispatch('detailInvisible')">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { Chart } from '@antv/g2'

export default {
  data() {
    return { reportVisible: false, reportList: [], input: '' }
  },
  computed: {
    universityDetail() {
      let name = this.$store.state.selectedUniversity
      let university = this.$store.state.universityList
        .filter(university => {
          return university.name == name
        })
        .pop()
      return university
    }
  },
  methods: {
    getDay(i) {
      let dd = new Date()
      dd.setDate(dd.getDate() - i) //获取AddDayCount天后的日期
      let y = dd.getFullYear()
      let m = dd.getMonth() + 1 //获取当前月份的日期
      let d = dd.getDate()
      let day = y + '/' + m + '/' + d--
      return day
    },
    reportError() {
      this.reportVisible = false
      this.reportList = []
      this.$message({
        message: '反馈成功，感谢您的指正！',
        type: 'success'
      })
    },
    handleLevel(level) {
      if (level == 1) {
        return '211'
      }
      if (level == 2) {
        return '985 211'
      } else {
        return ''
      }
    },
    handleOpened() {
      if (this.universityDetail) {
        console.log(this.universityDetail)
        const timeList = []
        for (let i = 0; i < 14; i++) {
          timeList.push({
            date: this.getDay(i),
            type: 'HTTP6',
            time: this.universityDetail.HttpTest.slice(-i)[0].IPv6HttpStatus.status
              ? this.universityDetail.HttpTest.slice(-i)[0].IPv6HttpStatus.result.total
              : null
          })
          timeList.push({
            date: this.getDay(i),
            type: 'HTTP4',
            time: this.universityDetail.HttpTest.slice(-i)[0].IPv4HttpStatus.status
              ? this.universityDetail.HttpTest.slice(-i)[0].IPv4HttpStatus.result.total
              : null
          })
          timeList.push({
            date: this.getDay(i),
            type: 'HTTPS6',
            time: this.universityDetail.HttpsTest.slice(-i)[0].IPv6HttpsStatus.status
              ? this.universityDetail.HttpsTest.slice(-i)[0].IPv6HttpsStatus.result.total
              : null
          })
          timeList.push({
            date: this.getDay(i),
            type: 'HTTPS4',
            time: this.universityDetail.HttpsTest.slice(-i)[0].IPv4HttpsStatus.status
              ? this.universityDetail.HttpsTest.slice(-i)[0].IPv4HttpsStatus.result.total
              : null
          })
          timeList.push({
            date: this.getDay(i),
            type: 'ICMPv6',
            time: this.universityDetail.PingTest.slice(-i)[0].IPv6Ping.alive ? this.universityDetail.PingTest.slice(-i)[0].IPv6Ping.rtt.avg : null
          })
          timeList.push({
            date: this.getDay(i),
            type: 'ICMPv4',
            time: this.universityDetail.PingTest.slice(-i)[0].IPv4Ping.alive ? this.universityDetail.PingTest.slice(-i)[0].IPv4Ping.rtt.avg : null
          })
        }

        console.log(timeList)
        const data = [
          { month: 'Jan', city: 'Tokyo', temperature: 7 },
          { month: 'Jan', city: 'London', temperature: 3.9 },
          { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
          { month: 'Feb', city: 'London', temperature: 4.2 },
          { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
          { month: 'Mar', city: 'London', temperature: 5.7 },
          { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
          { month: 'Apr', city: 'London', temperature: 8.5 },
          { month: 'May', city: 'Tokyo', temperature: 18.4 },
          { month: 'May', city: 'London', temperature: 11.9 },
          { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
          { month: 'Jun', city: 'London', temperature: 15.2 },
          { month: 'Jul', city: 'Tokyo', temperature: 25.2 },
          { month: 'Jul', city: 'London', temperature: 17 },
          { month: 'Aug', city: 'Tokyo', temperature: 26.5 },
          { month: 'Aug', city: 'London', temperature: 16.6 },
          { month: 'Sep', city: 'Tokyo', temperature: 23.3 },
          { month: 'Sep', city: 'London', temperature: 14.2 },
          { month: 'Oct', city: 'Tokyo', temperature: 18.3 },
          { month: 'Oct', city: 'London', temperature: 10.3 },
          { month: 'Nov', city: 'Tokyo', temperature: 13.9 },
          { month: 'Nov', city: 'London', temperature: 6.6 },
          { month: 'Dec', city: 'Tokyo', temperature: 9.6 },
          { month: 'Dec', city: 'London', temperature: 4.8 },
          { month: 'Dec', city: 'London2', temperature: 4.8 },
          { month: 'Nov', city: 'London2', temperature: 4.8 }
        ]

        const chart = new Chart({
          container: 'chart',
          autoFit: true,
          height: 400
        })

        chart.data(timeList)
        chart.scale({
          date: {
            range: [0, 1]
          },
          temperature: {
            time: true
          }
        })

        chart.tooltip({
          showCrosshairs: true,
          shared: true
        })

        // chart.axis('temperature', {
        //   label: {
        //     formatter: val => {
        //       return val + ' °C'
        //     }
        //   }
        // })

        chart
          .line()
          .position('date*time')
          .color('type')
          .shape('smooth')

        chart
          .point()
          .position('date*time')
          .color('type')
          .shape('circle')

        chart.render()
      }
    },
    handleClosed() {
      if (this.universityDetail) {
        document.getElementById('chart').innerHTML = ''
      }
    }
  },
  mounted() {}
}
</script>

<style lang="scss">
#university-detail {
  .el-dialog {
    max-width: 1000px;
  }
  .dialog-title {
    font-size: 22px;
  }
  .el-dialog__body {
    padding: 20px 50px;
  }
  .dialog-body {
    display: flex;
    flex-direction: column;
    font-size: 16px;
    letter-spacing: 1px;
    text-align: left;
    .dialog-img {
      text-align: center;
      img {
        width: 120px;
        height: 120px;
        margin-bottom: 30px;
      }
    }
    .dialog-universityDetail {
      .platform {
        color: #fff;
        background-color: #f56c6c;
        padding: 2px 10px;
        margin-left: 5px;
        border-radius: 5px;
      }
    }
    .report {
      position: absolute;
      font-size: 14px;
      right: 20px;
      bottom: 20px;
      color: #f56c6c;
      cursor: pointer;
    }
  }
}
</style>
