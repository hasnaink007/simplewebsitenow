const { Sequelize } = require('sequelize');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config =  {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'the_simple_website',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize

/*
  For Development Pupose only
  HOST: 85.10.205.173
  PORT: 3306
  DB_NAME: timeli
  DB_USER: timeli
  DB_PASSWORD: db4free@999
*/