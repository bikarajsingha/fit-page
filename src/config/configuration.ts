export default () => ({
  //App
  port: process.env.PORT,

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME,
  },

  // Weather api configuration
  weatherForecast: {
    baseUrl: process.env.WEATHER_API_BASE_URL,
    key: process.env.WEATHER_API_KEY,
  },
});
