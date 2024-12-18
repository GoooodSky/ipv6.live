import mongoose from 'mongoose'
const Schema = mongoose.Schema
const citySchema = new Schema({
  cityName: String,
  cityCode: Number,
  properties: Object,
  geometry: Object,
  province: String,
  lat: Number,
  lng: Number,
  people_count_2010: Number
}, {
  versionKey: false
})

export default mongoose.model('cityLists', citySchema)
