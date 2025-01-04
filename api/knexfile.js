// knexfile.js
require('dotenv').config();

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:', // In-memory SQLite database for testing
      timezone: '+00:00'  
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds',
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds',
    }
  }
};
