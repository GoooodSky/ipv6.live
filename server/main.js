const networkRequest = require('./utils/networkRequest')
const pingTest = require('./utils/pingTest')
const dnsResolver = require('./utils/dnsResolver')
const mongoose = require('mongoose')
const universityList = require('./db/models/university')
const { getTime } = require('./utils/tools')
let isUpdating = false

mongoose.connect('mongodb://127.0.0.1:27017/university', {
  useNewUrlParser: true
})

async function websiteTest(website) {
  let { IPv4DNS, IPv4Address, IPv6DNS, IPv6Address } = await dnsResolver(website)

  //   console.log({ IPv4DNS, IPv4Address, IPv6DNS, IPv6Address })
  if (IPv4DNS && IPv6DNS) {
    // console.log('双栈')

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
    // console.log('IPv4 Only')
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
    // console.log('IPv6 Only')
    let IPv6Ping = await pingTest(IPv6Address, 6)
    let { IPv6HttpStatus, IPv6HttpsStatus } = await networkRequest(website, 6)

    // console.dir(
    //   {
    //     updateTime: getTime(),
    //     IPv6Status: {
    //       IPv6DNS,
    //       IPv6Address,
    //       IPv6Test: { IPv6Ping, IPv6HttpStatus, IPv6HttpsStatus }
    //     }
    //   },
    //   { depth: Infinity }
    // )

    return {
      IPv4DNS,
      IPv4Address,
      IPv4Test: null,
      IPv6DNS,
      IPv6Address,
      IPv6Test: { IPv6Ping, IPv6HttpStatus, IPv6HttpsStatus }
    }
  } else {
    // console.log('双栈不可达')
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

;(async () => {
  // let { IPv4DNS, IPv4Address, IPv4Test, IPv6DNS, IPv6Address, IPv6Test } = await websiteTest('www.buct.edu.cn')
  // console.dir({ IPv4DNS, IPv4Address, IPv4Test, IPv6DNS, IPv6Address, IPv6Test }, { depth: Infinity })

  // let university = await universityList.find()
  // let websiteList = universitys.map(e => e.website)
  // console.log('websiteList: ', websiteList);

  // console.time()
  // for (let i = 0; i < university.length; i++) {
  //   let { IPv4DNS, IPv4Address, IPv4Test, IPv6DNS, IPv6Address, IPv6Test } = await websiteTest(university[i].website)
  //   console.log(university[i].name, IPv6DNS, IPv4DNS)
  // }
  // console.timeEnd()
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
      university.IPv6DNS = IPv6DNS
      university.IPv6Address = IPv6Address
      university.IPv6Test.push({
        updateTime: time,
        status: IPv6Test
      })
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
  // mongoose.disconnect()
})()
