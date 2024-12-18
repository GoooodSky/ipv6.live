import Router from 'koa-router'
import University from '../db/models/university'
import City from '../db/models/city'
import net from 'net'

let router = new Router({
  prefix: '/api'
})

router.get('/getUniversity', async ctx => {
  let universityList = await University.find().sort({
    serial: 1
  })
  //原数据和新数据映射
  // let universityList = JSON.parse(JSON.stringify(universityLists)).map(university=>{
  //   university.ipv6Resolve = university.IPv6Address
  //   university.ipv4Resolve = university.IPv4Address
  //   university.ipv4Ping = Boolean(university.IPv4DNS)
  //   university.ipv6Ping = Boolean(university.IPv6DNS)
  //   university.HttpTest = null
  //   university.HttpsTest = null
  //   university.PingTest = null
  //   return university
  // })

  ctx.body = {
    universityList
  }
})
router.get('/getCity', async ctx => {
  let cityList = await City.find()
  let cityListCounted = await Promise.all(
    cityList.map(async city => {
      return (async () => {
        let cityCount = await University.find({
          city: city.cityName,
          IPv6DNS: {
            $ne: 0
          }
        })
        let count = cityCount.filter(e=>(e.HttpTest.some(test=>test.IPv6HttpStatus.status==true)||e.HttpsTest.some(test=>test.IPv6HttpsStatus.status==true)))
        city.properties.count = count.length
        return city
      })()
    })
  )

  let cityData = {
    type: 'FeatureCollection',
    features: cityListCounted
  }
  ctx.body = {
    cityData
  }
})
router.get('/getVisitorStatus', async ctx => {
  let ip = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress
  let family

  if (ip.substr(0, 7) == '::ffff:') ip = ip.slice(7)
  if (net.isIPv4(ip)) family = 'IPv4'
  if (net.isIPv6(ip)) family = 'IPv6'

  ctx.body = {
    ip,
    family
  }
})

export default router
