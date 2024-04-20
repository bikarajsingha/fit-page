
export default () => ({
    //App
    port: process.env.PORT,

    // Database configuration
    database: {
      url: process.env.DATABASE_URL,
      name: process.env.DATABASE_NAME
    }
  });
  