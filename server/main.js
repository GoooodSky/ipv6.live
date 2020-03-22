const networkRequest = require('./utils/networkRequest')
const pingTest = require('./utils/pingTest')
const dnsResolver = require('./utils/dnsResolver')
const mongoose = require('mongoose')
const universityList = require('./db/models/university')
const { getTime } = require('./utils/tools')
let isUpdating = false

mongoose.connect('mongodb://127.0.0.1:27017/university', {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}).then(res => {
  console.log('数据库连接成功')
})

async function websiteTest(website) {
  let { IPv4DNS, IPv4Address, IPv6DNS, IPv6Address } = await dnsResolver(website)

  if (IPv4DNS && IPv6DNS) {

    let IPv4Ping = await pingTest(IPv4Address, 4)
    let IPv6Ping = await pingTest(IPv6Address, 6)
    let { IPv4HttpStatus, IPv4HttpsStatus, IPv6HttpStatus, IPv6HttpsStatus } = await networkRequest(website, 0)

    return {
      IPv4DNS,
      IPv4Address,
      IPv4Test: { IPv4Ping, IPv4HttpStatus, IPv4HttpsStatus },
      IPv6DNS,
      IPv6Address,
      IPv6Test: { IPv6Ping, IPv6HttpStatus, IPv6HttpsStatus }
    }
  } else if (IPv4DNS) {

    let IPv4Ping = await pingTest(IPv4Address, 4)
    let { IPv4HttpStatus, IPv4HttpsStatus } = await networkRequest(website, 4)

    return {
      IPv4DNS,
      IPv4Address,
      IPv4Test: { IPv4Ping, IPv4HttpStatus, IPv4HttpsStatus },
      IPv6DNS,
      IPv6Address,
      IPv6Test: null
    }
  } else if (IPv6DNS) {
    let IPv6Ping = await pingTest(IPv6Address, 6)
    let { IPv6HttpStatus, IPv6HttpsStatus } = await networkRequest(website, 6)

    return {
      IPv4DNS,
      IPv4Address,
      IPv4Test: null,
      IPv6DNS,
      IPv6Address,
      IPv6Test: { IPv6Ping, IPv6HttpStatus, IPv6HttpsStatus }
    }
  } else {
     return {
      IPv4DNS,
      IPv4Address,
      IPv4Test: null,
      IPv6DNS,
      IPv6Address,
      IPv6Test: null
    }
  }
}

async function spider() {
  if (isUpdating === false) {
    isUpdating = true
    console.log('开始更新数据...')

    let universitys = await universityList.find()

    let startTime = new Date().getTime()
    let startTag = 1
    let endTag = universitys.length

    universitys.forEach(async (university, idx) => {
      let { IPv4DNS, IPv4Address, IPv4Test, IPv6DNS, IPv6Address, IPv6Test } = await websiteTest(university.website)
      let time = getTime()
      university.updateTime = time
      university.IPv4DNS = IPv4DNS
      university.IPv4Address = IPv4Address
      university.IPv4Test.push({
        updateTime: time,
        status: IPv4Test
      })
      // if(university.IPv4Test.length>30){
      //   university.IPv4Test = university.IPv4Test.slice(-1,-30)
      // }
      university.IPv6DNS = IPv6DNS
      university.IPv6Address = IPv6Address
      university.IPv6Test.push({
        updateTime: time,
        status: IPv6Test
      })
      // if(university.IPv6Test.length>30){
      //   university.IPv6Test = university.IPv6Test.slice(-1,-30)
      // }
      university.save(() => {
        console.log(startTag, university.name, IPv4DNS, IPv6DNS, '--更新成功')

        if (endTag === startTag++) {
          let updatedTime = getTime()
          let usedTime = (new Date().getTime() - startTime) / 1000
          console.log(`${updatedTime}更新${startTag}条数据成功，用时${usedTime}s`)
          isUpdating = false
        }
      })
    })
  }
}

let freq = 1 * 60 * 60 * 1000
spider()
setInterval(() => {
  spider()
}, freq)