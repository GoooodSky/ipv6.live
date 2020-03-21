import Koa from 'koa'
import consola from 'consola'
import { Nuxt, Builder } from 'nuxt'
import mongoose from 'mongoose'

import dbConfig from './db/config'
import api from './api/index'
import spider from './utils/spider'

const app = new Koa()

mongoose.connect(dbConfig.db, {
  useNewUrlParser: true
})
mongoose.connection
  .on('connected', () => {
    console.log('连接数据库成功!')
  })
  .on('error', err => {
    console.log(err)
  })

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const { host = process.env.HOST || '127.0.0.1', port = process.env.PORT || 3000 } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  spider.updateUniversityInfo(1) //每1小时刷新一次
  app.use(api.routes()).use(api.allowedMethods())
  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
