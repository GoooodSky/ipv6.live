import Router from 'koa-router'
import University from '../db/models/university'
import City from '../db/models/city'
import net from 'net'

let router = new Router({
  prefix: '/api'
})

router.get('/getUniversity', async ctx => {
  let universityList = await University.find().sort({
    rank: 1
  })
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
          ipv6Resolve: {
            $ne: 'N/A'
          }
        })
        city.properties.count = cityCount.length
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
