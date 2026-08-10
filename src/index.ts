import { Hono } from 'hono'
import { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 健康检查——部署后用来确认服务是否正常运行
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
