import mongoose from 'mongoose'
const Schema = mongoose.Schema
const universitySchema = new Schema(
  {
    serial: Number,
    rank: Number,
    name: String,
    idCode: Number,
    superior: String,
    province: String,
    city: String,
    level: String,
    platform: String,
    website: String,
    remark: String,
    ipv4Resolve: String,
    ipv6Resolve: String,
    ipv4Ping: Boolean,
    ipv6Ping: Boolean,
    httpAccess: Boolean,
    httpsAccess: Boolean,
    ipv4Rtt: Array,
    ipv6Rtt: Array,
    httpRtt: Array
  },
  { versionKey: false }
)

export default mongoose.model('universityLists', universitySchema)
