const mongoose = require('mongoose')
const Schema = mongoose.Schema
const universitySchema = new Schema(
  {
    serial: Number,
    name: String,
    website: String,
    schoolCode: Number,
    province: String,
    city: String,
    superior: String,
    level: String,
    platform: String,
    remark: String,

    updateTime: String,
    statusCode: String,

    IPv4Address: String,
    IPv6Address: String,

    IPv4DNS: Number,
    IPv6DNS: Number,

  
    PingTest: Array,
    HttpTest: Array,
    HttpsTest: Array,

    PingResult: Object,
    PingDual: Boolean,

    HttpResult: Object,
    HttpDual: Boolean,
    HttpsResult: Object,
    HttpsDual: Boolean
  },
  { versionKey: false }
)

const universityListModel = mongoose.model('universityInfos', universitySchema)

module.exports = universityListModel
