const netPing = require('net-ping')
const net = require('net')
const options = { times: 100, timeout: 1000 }

function getHrTimeDurationInMs(startTime, endTime) {
  const NS_PER_SEC = 1e9
  const MS_PER_NS = 1e6
  const secondDiff = endTime[0] - startTime[0]
  const nanoSecondDiff = endTime[1] - startTime[1]
  const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff

  return diffInNanoSecond / MS_PER_NS
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
          roundtriptime: rcvd - sent
          // roundtriptime: getHrTimeDurationInMs(sent, rcvd)
        })
      })
    })
    return { reached, roundtriptime }
  }

  // let result = []

  // for (var i = 0; i < 20; i++) {
  //   let { reached, roundtriptime } = await ping(address)
  //   result.push({ reached, roundtriptime })
  // }

  // let time = Array(100).fill(1)

  let result = await Promise.all(
    Array(options.times)
      .fill(1)
      .map(async e => {
        let { reached, roundtriptime } = await ping(address)
        return { reached, roundtriptime }
      })
  )

  let alive = result.some(e => e.reached == true)
  // console.log(result)

  // if (alive) {
  //   for (i = 20; i < 100; i++) {
  //     let { reached, roundtriptime } = await ping(address)
  //     result.push({ reached, roundtriptime })
  //   }
  // }

  let loss = alive ? Number((result.filter(e => e.reached == false).length / result.length).toFixed(5)) : 100
  let rttList = alive ? [...result.filter(e => e.reached == true).map(e => e.roundtriptime)] : null

  let rtt = alive
    ? {
        max: Number(Math.max(...rttList).toFixed(3)),
        min: Number(Math.min(...rttList).toFixed(3)),
        avg: Number((rttList.reduce((a, b) => a + b) / rttList.length).toFixed(3))
      }
    : null
  return { alive, loss, rtt }
}

// async function pingTest(IPV4Address, family = 0) {
//   if (family == 0) {

//   let [IPv6Ping,IPv4Ping] = await Promise.all([await ping(website,6),await ping(website)])

//   } else if (family == 4) {
//   } else if (family == 6) {
//   }
// }

;(async () => {
  console.time()
  let { alive, loss, rtt } = await pingTest('155.94.170.155')
  console.timeEnd()
  console.log({ alive, loss, rtt })
})()

module.exports = pingTest
