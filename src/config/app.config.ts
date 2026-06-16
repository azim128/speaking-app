import { env } from './env'

const appConfig = {
  name: 'Speaking App',
  version: '1.0.0',
  apiUrl: env.VITE_API_URL,
  isDev: env.DEV,
  isProd: env.PROD,
} as const

export { appConfig }
