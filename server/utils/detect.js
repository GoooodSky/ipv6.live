const dns = require('dns')
const net = require('net')
const assert = require('assert')
const url = require('url')
const http = require('http')
const https = require('https')
const netPing = require('./net-ping')
const mongoose = require('mongoose')
const UniversityModel = require('../db/models/university')
const { getTime } = require('./tools')

const TIMEOUT_IN_MILLISECONDS = 2 * 1000
const options = { times: 10, timeout: 1000 }
const requestTimes = 10

mongoose
  .connect('mongodb://127.0.0.1:27017/university', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(res => {
    console.log('数据库连接成功')
  })

function getHrTimeDurationInMs(startTime, endTime) {
  const NS_PER_SEC = 1e9
  const MS_PER_NS = 1e6
  const secondDiff = endTime[0] - startTime[0]
  const nanoSecondDiff = endTime[1] - startTime[1]
  const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff

  return diffInNanoSecond / MS_PER_NS
}
function request({ method = 'GET', protocol, hostname, port, path, family, headers = {}, body } = {}, callback) {
  // Validation
  assert(protocol, 'options.protocol is required')
  assert(['http:', 'https:'].includes(protocol), 'options.protocol must be one of: "http:", "https:"')
  assert(hostname, 'options.hostname is required')
  assert(callback, 'callback is required')

  // Initialization
  const eventTimes = {
    // use process.hrtime() as it's not a subject of clock drift
    startAt: process.hrtime(),
    dnsLookupAt: undefined,
    tcpConnectionAt: undefined,
    tlsHandshakeAt: undefined,
    firstByteAt: undefined,
    endAt: undefined
  }
  let address = ''

  // Making request
  const req = (protocol.startsWith('https') ? https : http).request(
    {
      protocol,
      method,
      hostname,
      port,
      path,
      family,
      headers,
      timeout: TIMEOUT_IN_MILLISECONDS
    },

    res => {
      let responseBody = ''
      req.setTimeout(TIMEOUT_IN_MILLISECONDS)

      // Response events
      res.once('readable', () => {
        eventTimes.firstByteAt = process.hrtime()
      })
      res.on('data', chunk => {
        responseBody += chunk
        // console.log('chunk:',chunk.length)
      })

      // End event is not emitted when stream is not consumed fully
      // in our case we consume it see: res.on('data')
      res.on('end', () => {
        // console.log(res.body)
        // console.log(`响应主体: ${responseBody.toString().length}`)

        eventTimes.endAt = process.hrtime()
        callback(null, {
          headers: res.headers,
          timings: getTimings(eventTimes),
          body: responseBody,
          size: responseBody.toString().length,
          // size: Number(res.headers['content-length'])
          address
        })
      })
    }
  )

  // Request events
  req.on('socket', socket => {
    socket.on('lookup', (e, a, i, h) => {
      address = a
      // console.log(address)
      eventTimes.dnsLookupAt = process.hrtime()
    })
    socket.on('connect', () => {
      eventTimes.tcpConnectionAt = process.hrtime()
    })
    socket.on('secureConnect', () => {
      eventTimes.tlsHandshakeAt = process.hrtime()
    })
    socket.on('timeout', () => {
      req.abort()

      const err = new Error('ETIMEDOUT')
      err.code = 'ETIMEDOUT'
      callback(err)
    })
  })
  req.on('error', callback)

  // Sending body
  if (body) {
    req.write(body)
  }

  req.end()
}

function getTimings(eventTimes) {
  return {
    // There is no DNS lookup with IP address
    dnsLookup: eventTimes.dnsLookupAt !== undefined ? getHrTimeDurationInMs(eventTimes.startAt, eventTimes.dnsLookupAt) : undefined,
    tcpConnection: getHrTimeDurationInMs(eventTimes.dnsLookupAt || eventTimes.startAt, eventTimes.tcpConnectionAt),
    // There is no TLS handshake without https
    tlsHandshake: eventTimes.tlsHandshakeAt !== undefined ? getHrTimeDurationInMs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt) : undefined,
    firstByte: getHrTimeDurationInMs(eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt, eventTimes.firstByteAt),
    contentTransfer: getHrTimeDurationInMs(eventTimes.firstByteAt, eventTimes.endAt),
    total: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.endAt)
  }
}

async function httpRequset(website, family) {
  return new Promise((resolve, reject) => {
    request(
      Object.assign(url.parse(website), {
        headers: {
          'User-Agent': 'Example'
        },
        family
      }),
      (err, res) => {
        if (err) {
          return resolve({ status: false, result: err.code })
        }
        resolve({
          status: true,
          result: { ...res.timings, docSize: res.size }
        })
      }
    )
  })
}
async function networkRequest(website, family) {
  // let status = await httpRequset(website, family)
  // console.log()

  let response = await Promise.all(
    Array(requestTimes)
      .fill(1)
      .map(async e => {
        let status = await httpRequset(website, family)
        return status
      })
  )
  let status = response.some(e => e.status == true)

  if (status) {
    let reached = response.filter(e => e.status == true)
    let reachedCount = reached.length
    let loss = Number((response.filter(e => e.status == false).length / requestTimes).toFixed(5))

    let dnsLookup = Number((reached.map(e => e.result.dnsLookup).reduce((a, b) => a + b) / reachedCount).toFixed(3))
    let tcpConnection = Number((reached.map(e => e.result.tcpConnection).reduce((a, b) => a + b) / reachedCount).toFixed(3))
    let tlsHandshake = url.parse(website).protocol.startsWith('http:')
      ? undefined
      : Number((reached.map(e => e.result.tlsHandshake).reduce((a, b) => a + b) / reachedCount).toFixed(3))

    let firstByte = Number((reached.map(e => e.result.firstByte).reduce((a, b) => a + b) / reachedCount).toFixed(3))
    let contentTransfer = Number((reached.map(e => e.result.contentTransfer).reduce((a, b) => a + b) / reachedCount).toFixed(3))
    let total = Number((reached.map(e => e.result.total).reduce((a, b) => a + b) / reachedCount).toFixed(3))
    let docSize = Number((reached.map(e => e.result.docSize).reduce((a, b) => a + b) / reachedCount).toFixed(0))

    return {
      status: true,
      loss,
      result: {
        dnsLookup,
        tcpConnection,
        tlsHandshake,
        firstByte,
        contentTransfer,
        total,
        docSize
      }
    }
  } else {
    return {
      status: false,
      loss: 100,
      result: [...new Set(response.map(e => e.result))]
    }
  }
}
async function dnsResolver(website) {
  let IPv4Resolver = () => {
    return new Promise((resolve, reject) => {
      dns.resolve4(website, function(err, IPv4List) {
        if (err || IPv4List.length == 0) {
          return resolve({ IPv4DNS: 0, IPv4Address: null })
        }
        resolve({ IPv4DNS: IPv4List.length, IPv4Address: IPv4List.shift() })
      })
    })
  }
  let IPv6Resolver = () => {
    return new Promise((resolve, reject) => {
      dns.resolve6(website, function(err, IPv6List) {
        if (err || IPv6List.length == 0) {
          return resolve({ IPv6DNS: 0, IPv6Address: null })
        }
        resolve({ IPv6DNS: IPv6List.length, IPv6Address: IPv6List.shift() })
      })
    })
  }

  let [{ IPv4DNS, IPv4Address }, { IPv6DNS, IPv6Address }] = await Promise.all([await IPv4Resolver(), await IPv6Resolver()])

  return { IPv4DNS, IPv4Address, IPv6DNS, IPv6Address }
}

async function pingTest(address, family = 4) {
  family = net.isIPv6(address) ? 6 : 4
  let session = netPing.createSession({
    networkProtocol: netPing.NetworkProtocol[`IPv${family}`],
    timeout: options.timeout
  })

  async function ping(address) {
    let { reached, roundtriptime } = await new Promise((resolve, reject) => {
      session.pingHost(address, function(error, target, sent, rcvd) {
        if (error) {
          return resolve({ reached: false, roundtriptime: null })
        }
        resolve({
          reached: true,
          //   roundtriptime: rcvd - sent
          roundtriptime: getHrTimeDurationInMs(sent, rcvd)
        })
      })
    })
    return { reached, roundtriptime }
  }

  let result = await Promise.all(
    Array(options.times)
      .fill(1)
      .map(async e => {
        let { reached, roundtriptime } = await ping(address)
        return { reached, roundtriptime }
      })
  )

  let alive = result.some(e => e.reached == true)

  let loss = alive ? Number((result.filter(e => e.reached == false).length / result.length).toFixed(5)) : 100
  let rttList = alive ? [...result.filter(e => e.reached == true).map(e => e.roundtriptime)] : null

  let rtt = alive
    ? {
        max: Math.max(...rttList).toFixed(3),
        min: Math.min(...rttList).toFixed(3),
        avg: (rttList.reduce((a, b) => a + b) / rttList.length).toFixed(3)
      }
    : null
  return { alive, loss, rtt }
}

let count = 1
async function detect() {
  let universitys = await UniversityModel.find()

  // 初始化dns
  //   for (let index = 0; index < universitys.length; index++) {
  //     const element = universitys[index]
  //     let { IPv4DNS, IPv4Address, IPv6DNS, IPv6Address } = await dnsResolver(element.website)
  //     element.IPv4DNS = IPv4DNS
  //     element.IPv4Address = IPv4Address
  //     element.IPv6DNS = IPv6DNS
  //     element.IPv6Address = IPv6Address

  //     element.save(() => {
  //       console.log(count++, element.name, IPv4DNS, IPv4Address, IPv6DNS, IPv6Address, '--保存成功')
  //     })
  //   }
  console.time()
  for (let index = 0; index < universitys.length; index++) {
    let university = universitys[index]
    //   universitys.map(async university => {
    // const university = universitys[index]

    if (university.IPv6DNS && university.IPv4DNS && university.website) {
      let [IPv4Ping, IPv6Ping, IPv4HttpStatus, IPv4HttpsStatus, IPv6HttpStatus, IPv6HttpsStatus] = await await Promise.all([
        await pingTest(university.IPv4Address, 4),
        await pingTest(university.IPv6Address, 6),
        await networkRequest(`http://${university.website}`, 4),
        await networkRequest(`https://${university.website}`, 4),
        await networkRequest(`http://${university.website}`, 6),
        await networkRequest(`https://${university.website}`, 6)
      ])

      //   let IPv4Ping = await pingTest(university.IPv4Address, 4)
      //   let IPv6Ping = await pingTest(university.IPv6Address, 6)
      //   let IPv4HttpsStatus = await httpRequset(`http://${university.website}`, 4)
      //   let IPv4HttpStatus = await httpRequset(`https://${university.website}`, 4)
      //   let IPv6HttpStatus = await httpRequset(`http://${university.website}`, 6)
      //   let IPv6HttpsStatus = await httpRequset(`https://${university.website}`, 6)

      let timeNow = getTime()
      university.updateTime = timeNow
      university.PingTest.push({
        updateTime: timeNow,
        IPv4Ping,
        IPv6Ping
      })
      university.HttpTest.push({
        updateTime: timeNow,
        IPv4HttpStatus,
        IPv6HttpStatus
      })
      university.HttpsTest.push({
        updateTime: timeNow,
        IPv4HttpsStatus,
        IPv6HttpsStatus
      })

      // console.log(
      //   count++,
      //   university.name,
      //   IPv4Ping.alive,
      //   IPv6Ping.alive,
      //   IPv4HttpStatus.status,
      //   IPv4HttpsStatus.status,
      //   IPv6HttpStatus.status,
      //   IPv6HttpsStatus.status,
      //   '更新完成'
      // )
      university.save(() => {
        console.log(
          count++,
          university.name,
          IPv4Ping.alive,
          IPv6Ping.alive,
          IPv4HttpStatus.status,
          IPv4HttpsStatus.status,
          IPv6HttpStatus.status,
          IPv6HttpsStatus.status,
          '更新完成'
        )
      })
    }
    //   })
  }
  console.timeEnd()
}
detect()
// ;(async () => {
//   let universitys = await UniversityModel.find()
//   let dual = universitys.filter(university => {
//     return (
//       university.IPv4DNS != 0 &&
//       university.IPv6DNS != 0 &&
//       university.IPv6Test.some(e => e.IPv6Ping.alive == true && university.IPv4Test.some(e => e.IPv4Ping.alive == true))
//     )
//   })

//   let r = dual.map(e => {
//     return e.IPv6Test[0].IPv6Ping.rtt.max < e.IPv4Test[0].IPv4Ping.rtt.max
//   })
//   console.log(dual.length)
//   console.log(r.filter(e => e == true).length)
// })()
