module.exports = {
  apps : [{
    name   : "GammaScript",
    script : "./server/index.js",
    env: {
      "NODE_ENV"    : "production",
      "PORT"        : "80",
      "DB_HOST"     : "localhost", //"178.62.44.32", //"85.10.205.173",
      // "DB_HOST"     : "85.10.205.173",
      "DB_NAME"     : "gammascript", //"timeli",
      // "DB_NAME"     : "timeli",
      "DB_PASSWORD" : "MammotH.1234z", //"db4free@999",
      // "DB_PASSWORD" : "db4free@999",
      "DB_PORT"     : "3306",
      "DB_USER"     : "GammaScript", //"timeli",
      // "DB_USER"     : "timeli",
      "SESSION_KEY" : "!@#$%^&*()",
    }
  }]
}