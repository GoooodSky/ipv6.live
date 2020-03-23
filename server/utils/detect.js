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
const options = { times: 50, timeout: 1000 }
const requestTimes = 50

let count = 1
let period = 1

let isUpdating = false

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

async function updateInfo(university) {
  return new Promise(async (resolve, reject) => {
    if (university) {
      let [IPv4Ping, IPv6Ping, IPv4HttpStatus, IPv4HttpsStatus, IPv6HttpStatus, IPv6HttpsStatus] = await await Promise.all([
        pingTest(university.IPv4Address, 4),
        pingTest(university.IPv6Address, 6),
        networkRequest(`http://${university.website}`, 4),
        networkRequest(`https://${university.website}`, 4),
        networkRequest(`http://${university.website}`, 6),
        networkRequest(`https://${university.website}`, 6)
      ])

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

    //   console.log(
    //     period,
    //     count++,
    //     university.name,
    //     IPv4Ping,
    //     IPv6Ping,
    //     IPv4HttpStatus.status,
    //     IPv4HttpsStatus.status,
    //     IPv6HttpStatus.status,
    //     IPv6HttpsStatus.status,
    //     '更新完成'
    //   )
      university.save(() => {
        console.log(
          period,
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
      resolve(1)
    } else {
      resolve(1)
    }
  })
}

async function detect() {
  if (isUpdating === false) {
    isUpdating = true
    console.log(`开始更新第${period}轮数据...`)

    let universityslist = await UniversityModel.find()

    let universitys = universityslist.filter(university => university.IPv6DNS && university.IPv4DNS && university.website)
    console.time()
    for (universitys of universitys) {
      await updateInfo(universitys)
    }
    isUpdating = false
    count = 1
    period++
    console.log(isUpdating)
    console.timeEnd()
  }
}
detect()
setInterval(() => {
  detect()
}, 30 * 60 * 1000)
