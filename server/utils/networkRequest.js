'use strict'

const assert = require('assert')
const url = require('url')
const http = require('http')
const https = require('https')
const dns = require('dns')

const TIMEOUT_IN_MILLISECONDS = 10 * 1000
const NS_PER_SEC = 1e9
const MS_PER_NS = 1e6
const requestTimes = 5 // 每次查询的次数
/**
 * Creates a request and collects HTTP timings
 * @function request
 * @param {Object} options
 * @param {String} [options.method='GET']
 * @param {String} options.protocol
 * @param {String} options.hostname
 * @param {Number} [options.port]
 * @param {String} [options.path]
 * @param {Object} [options.headers={}]
 * @param {String} [options.body]
 * @param {Function} callback
 */
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
      headers
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

/**
 * Calculates HTTP timings
 * @function getTimings
 * @param {Object} eventTimes
 * @param {Number} eventTimes.startAt
 * @param {Number|undefined} eventTimes.dnsLookupAt
 * @param {Number} eventTimes.tcpConnectionAt
 * @param {Number|undefined} eventTimes.tlsHandshakeAt
 * @param {Number} eventTimes.firstByteAt
 * @param {Number} eventTimes.endAt
 * @return {Object} timings - { dnsLookup, tcpConnection, tlsHandshake, firstByte, contentTransfer, total }
 */
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

/**
 * Get duration in milliseconds from process.hrtime()
 * @function getHrTimeDurationInMs
 * @param {Array} startTime - [seconds, nanoseconds]
 * @param {Array} endTime - [seconds, nanoseconds]
 * @return {Number} durationInMs
 */
function getHrTimeDurationInMs(startTime, endTime) {
  const secondDiff = endTime[0] - startTime[0]
  const nanoSecondDiff = endTime[1] - startTime[1]
  const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff

  return diffInNanoSecond / MS_PER_NS
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
          // if (err.errno == 'ENOTFOUND')
          //   return resolve({
          //     status: false,
          //     result: `ENOTFOUND,DNS解析失败，IPv${family}不可用`
          //   })
          // if (err.errno == 'ECONNREFUSED')
          //   return resolve({
          //     status: false,
          //     result: `ECONNREFUSED,${url.parse(website).protocol.replace(':', '')}协议不可达`
          //   })
          // else return resolve({ status: false, result: `${err.errno},其它错误` })
          // console.log(err.code)
          return resolve({ status: false, result: err.code })
        }
        resolve({
          status: true,
          result: { ...res.timings, docSize: res.size, address: res.address }
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

async function networkTest(website, family = 0) {
  if (family == 0) {
    let [IPv4HttpStatus, IPv4HttpsStatus, IPv6HttpStatus, IPv6HttpsStatus] = await Promise.all([
      await networkRequest(`http://${website}`, 4),
      await networkRequest(`https://${website}`, 4),
      await networkRequest(`http://${website}`, 6),
      await networkRequest(`https://${website}`, 6)
    ])
    return { IPv4HttpStatus, IPv4HttpsStatus, IPv6HttpStatus, IPv6HttpsStatus }
  } else if (family == 4) {
    let [IPv4HttpStatus, IPv4HttpsStatus] = await Promise.all([
      await networkRequest(`http://${website}`, 4),
      await networkRequest(`https://${website}`, 4)
    ])
    return { IPv4HttpStatus, IPv4HttpsStatus }
  } else if (family == 6) {
    let [IPv6HttpStatus, IPv6HttpsStatus] = await Promise.all([
      await networkRequest(`http://${website}`, 6),
      await networkRequest(`https://${website}`, 6)
    ])
    return { IPv6HttpStatus, IPv6HttpsStatus }
  }
}

;(async () => {
  let r = await networkTest('ipv6.live')
  console.log(r)
})()
module.exports = networkTest
