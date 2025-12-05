require("dotenv").config();

const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QLMS",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret123",
    expires: process.env.JWT_EXPIRES || "1d",
  },
};

module.exports = config;
