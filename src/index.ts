import { Hono } from 'hono'
import { AppEnv } from './types'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { errorHandler } from './middleware/error'
import auth from './routes/auth'

const app = new Hono<AppEnv>()

// 全局中间件
app.use('*', logger())
app.use('*', cors())

// 全局错误处理
app.onError(errorHandler)

// 公开路由——注册登录不需要 token
app.route('/auth', auth)


// 健康检查——部署后用来确认服务是否正常运行
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
