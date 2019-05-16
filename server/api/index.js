import Router from 'koa-router'
import University from '../db/models/university'

let router = new Router({ prefix: '/api' })

router.get('/getUniversity', async ctx => {
  let universityList = await University.find().sort({ rank: 1 })
  ctx.body = { universityList }
})
router.get('/getVisitorStatus', async ctx => {
  let ip = ctx.ip
  let family = 'IPv6'

  if (ip.substr(0, 7) == '::ffff:') {
    ip = ip.slice(7)
    family = 'IPv4'
  }
  ctx.body = { ip, family }
})

export default router
