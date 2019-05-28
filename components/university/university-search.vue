<template>
  <el-dialog
    id="university-search"
    v-model="universityDetail"
    :visible.sync="$store.state.detailVisible"
    width="70%"
    center
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <template v-if="universityDetail">
      <span slot="title" class="dialog-title">{{ universityDetail.name }}</span>
      <section class="dialog-body">
        <div class="dialog-img">
          <img :src="'/img/universityCrest/' + universityDetail.rank + '.png'" />
          <!-- <img src="/img/universityLogo/0.png" v-else /> -->
        </div>
        <div class="dialog-universityDetail">
          <p>所在地：{{ universityDetail.province }} {{ universityDetail.city == universityDetail.province ? '' : universityDetail.city }}</p>
          <p>
            <span>高校类型：{{ universityDetail.level }}</span>
            <span class="platform" v-if="universityDetail.platform != '——'"> {{ universityDetail.platform }}</span>
          </p>
          <p>高校隶属于：{{ universityDetail.superior }}</p>
          <p>学校网址：{{ universityDetail.website }}</p>
          <p>IPv6解析：{{ universityDetail.ipv6Resolve }}</p>
          <p>IPv4解析：{{ universityDetail.ipv4Resolve }}</p>
          <!-- <p>网络状况：</p> -->
        </div>
        <el-dialog
          class="report-dialog"
          width="70%"
          :title="$store.state.selectedUniversity + '--信息报错'"
          :visible.sync="reportVisible"
          append-to-body
        >
          <el-checkbox-group v-model="reportList">
            <el-checkbox label="网址错误"></el-checkbox>
            <el-checkbox label="IPv6地址解析错误"></el-checkbox>
            <el-checkbox label="IPv4地址解析错误"></el-checkbox>
          </el-checkbox-group>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="reportError">提交</el-button>
          </span>
        </el-dialog>
        <span class="report" @click="reportVisible = true"><i class="el-icon-info"></i></span>
      </section>

      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="$store.dispatch('detailInvisible')">关闭</el-button>
      </span>
    </template>
    <template v-else>
      <span slot="title" class="dialog-title">抱歉，没有这所学校</span>
      <section class="dialog-body"><span>错误的名称，或尚未收录该所高校</span></section>
      <span slot="footer" class="dialog-footer"> <el-button type="danger" @click="$store.dispatch('detailInvisible')">关闭</el-button> </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return { reportVisible: false, reportList: [] }
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
    reportError() {
      this.reportVisible = false
      this.$message({
        message: '反馈成功，感谢您的指正！',
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#university-search {
  .dialog-title {
    font-size: 22px;
  }
  .dialog-body {
    display: flex;
    flex-direction: column;
    font-size: 16px;
    letter-spacing: 1px;
    text-align: center;
    .dialog-img {
      img {
        width: 120px;
        height: 120px;
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
