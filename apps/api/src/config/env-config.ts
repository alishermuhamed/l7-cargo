export function envConfig() {
  return {
    env: {
      nodeEnv: process.env.NODE_ENV,
      name: process.env.ENV_NAME,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    },
    web: {
      url: process.env.WEB_URL,
    },
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true',
    },
    betterAuth: {
      secret: process.env.BETTER_AUTH_SECRET,
      baseUrl: process.env.BETTER_AUTH_BASE_URL,
      cookiesDomain: process.env.BETTER_AUTH_COOKIES_DOMAIN,
    },
    otp: {
      telegramGateway: {
        accessToken: process.env.TELEGRAM_GATEWAY_ACCESS_TOKEN,
      },
      mobizon: {
        apiKey: process.env.MOBIZON_API_KEY,
      },
      smsc: {
        apiKey: process.env.SMSC_API_KEY,
      },
      sendpulse: {
        apiKey: process.env.SENDPULSE_API_KEY,
      },
      telegramFallback: {
        botToken: process.env.TELEGRAM_FALLBACK_BOT_TOKEN,
        chatIds: process.env.TELEGRAM_FALLBACK_CHAT_IDS,
      },
    },
    defaultAdmin: {
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      phone: process.env.DEFAULT_ADMIN_PHONE,
    },
  }
}

export type EnvConfig = ReturnType<typeof envConfig>
