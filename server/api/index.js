import Router from 'koa-router'
import University from '../db/models/university'
import net from 'net'

let router = new Router({ prefix: '/api' })

router.get('/getUniversity', async ctx => {
  let universityList = await University.find().sort({ rank: 1 })
  ctx.body = { universityList }
})
router.get('/getVisitorStatus', async ctx => {
  let ip = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress
  let family

  if (ip.substr(0, 7) == '::ffff:') ip = ip.slice(7)
  if (net.isIPv4(ip)) family = 'IPv4'
  if (net.isIPv6(ip)) family = 'IPv6'

  ctx.body = { ip, family }
})

export default router
