const dns = require('dns')

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

module.exports = dnsResolver

// ;(async () => {
//   let { IPv4DNS, IPv6DNS }= await dnsResolver('www.baidu.com')
//   console.log({ IPv4DNS, IPv6DNS })
// })()
