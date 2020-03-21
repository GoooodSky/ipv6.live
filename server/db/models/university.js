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

    IPv4Test: Array,
    IPv6Test: Array
  },
  { versionKey: false }
)

const universityListModel = mongoose.model('universityInfo', universitySchema)

module.exports = universityListModel
