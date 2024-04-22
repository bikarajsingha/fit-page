export default () => ({
  //App
  port: process.env.PORT,

  // Database
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME,
  },

  // Weather api
  weatherForecast: {
    baseUrl: process.env.WEATHER_API_BASE_URL,
    key: process.env.WEATHER_API_KEY,
  },

  // Cache
  cacheTimeDuration: Number(process.env.CACHE_EXPIRE_DURATION),

  // Rate limit
  rateLimit: {
    timeToLive: Number(process.env.THROTTLE_TTL),
    limit: Number(process.env.THROTTLE_LIMIT),
  },
});
