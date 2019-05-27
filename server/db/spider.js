import dns from 'dns'
import net from 'net'
import ping from 'net-ping'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import UniversityModel from '../db/models/university'
let isUpdating = false

mongoose.connect('mongodb://127.0.0.1:27017/university', { useNewUrlParser: true })

const session4 = ping.createSession({
  networkProtocol: ping.NetworkProtocol.IPv4,
  timeout: 10000
})
const session6 = ping.createSession({
  networkProtocol: ping.NetworkProtocol.IPv6,
  timeout: 10000
})

function getTime() {
  let date = new Date()
  let now = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
  return now
}

async function getIP(url) {
  let ipv4Promise = new Promise((resolve, reject) => {
    dns.resolve4(url, function(err, ipv4List) {
      if (err || ipv4List.length == 0) {
        return resolve('N/A')
      }
      resolve(ipv4List.shift())
    })
  })
  let ipv6Promise = new Promise((resolve, reject) => {
    dns.resolve6(url, function(err, ipv6List) {
      if (err || ipv6List.length == 0) {
        return resolve('N/A')
      }
      resolve(ipv6List.shift())
    })
  })
  let ipv4 = await ipv4Promise
  let ipv6 = await ipv6Promise

  return { ipv4, ipv6 }
}
async function pingTest(ipv4, ipv6) {
  async function ping4(ipv4) {
    let { ipv4Ping, ipv4Rtt } = await new Promise((resolve, reject) => {
      session4.pingHost(ipv4, function(error, target, sent, rcvd) {
        if (error) {
          return resolve({ ipv4Ping: false, ipv4Rtt: 10000 })
        }
        resolve({ ipv4Ping: true, ipv4Rtt: rcvd - sent })
      })
    })
    return { ipv4Ping, ipv4Rtt }
  }

  async function ping6(ipv6) {
    let { ipv6Ping, ipv6Rtt } = await new Promise((resolve, reject) => {
      session6.pingHost(ipv6, function(error, target, sent, rcvd) {
        if (error) {
          return resolve({ ipv6Ping: false, ipv6Rtt: 10000 })
        }
        resolve({ ipv6Ping: true, ipv6Rtt: rcvd - sent })
      })
    })
    return { ipv6Ping, ipv6Rtt }
  }
  let { ipv4Ping, ipv4Rtt } = net.isIPv4(ipv4) ? await ping4(ipv4) : { ipv4Ping: false, ipv4Rtt: 10000 }
  let { ipv6Ping, ipv6Rtt } = net.isIPv6(ipv6) ? await ping6(ipv6) : { ipv6Ping: false, ipv6Rtt: 10000 }

  return { ipv4Ping, ipv4Rtt, ipv6Ping, ipv6Rtt }
}
async function httpTest(ipv4, ipv6) {}
async function updateInfo(address) {
  let { ipv4, ipv6 } = await getIP(address)
  let { ipv4Ping, ipv4Rtt, ipv6Ping, ipv6Rtt } = await pingTest(ipv4, ipv6)

  return { ipv4, ipv6, ipv4Ping, ipv4Rtt, ipv6Ping, ipv6Rtt }
}

async function spider() {
  if (isUpdating === false) {
    isUpdating = true
    console.log('开始更新数据...')
    let universityList = await UniversityModel.find()
    let startTime = new Date().getTime()
    let startTag = 1
    let endTag = universityList.length
    universityList.map(async university => {
      let { ipv4, ipv6, ipv4Ping, ipv4Rtt, ipv6Ping, ipv6Rtt } = await updateInfo(university.website)
      if (ipv4 != 'N/A') {
        university.ipv4Resolve = ipv4
      }
      if (ipv6 != 'N/A') {
        university.ipv6Resolve = ipv6
      }
      university.ipv4Ping = ipv4Ping
      university.ipv6Ping = ipv6Ping
      university.save(function() {
        // console.log(startTag, university.name + ipv4, ipv4Ping, ipv4Rtt, ipv6, ipv6Ping, ipv6Rtt, '更新成功')
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
// spider()
function updateUniversityInfo(h) {
  //将小时转化成毫秒
  let freq = h * 60 * 60 * 1000
  spider()
  setInterval(() => {
    spider()
  }, freq)
}
export default { updateUniversityInfo }
