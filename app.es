import bluebird from 'bluebird'
import Koa from 'koa'
import path from 'path'
import glob from 'glob'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import serve from 'koa-static'
import mongoose from 'mongoose'
import config from './config'
bluebird.promisifyAll(mongoose)
mongoose.Promise = Promise

const app = new Koa()

// Database
mongoose.connect(config.db)
mongoose.connection.on('error', () => {
  throw new Error('Unable to connect to database at ' + config.db)
})

// Logger
app.use(logger())

// Body Parser
app.use(bodyparser({
  strict: true,
  onerror: (err, ctx) => {
    console.error(`bodyparser error`)
  },
}))

// Models
glob.sync(path.join(config.root, 'models/**'), { nodir: true })
  .forEach((file) => require(file))

// Controllers
glob.sync(path.join(config.root, 'controllers/**'), { nodir: true })
  .forEach((file) => require(file)(app))

// Static
app.use(serve(path.join(config.root, 'public')))

app.listen(config.port, () => {
  console.log(`Koa is listening on port ${config.port}`)
})
