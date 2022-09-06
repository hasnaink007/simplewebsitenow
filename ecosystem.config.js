module.exports = {
  apps : [{
    name   : "SimpleWebsiteNow",
    script : "./server/index.js",
	env: {
		DB_NAME: 'simple_site_builder',
		SERVER_PORT: 3500,
		JWT_SECRET: '!@#%^&*()qwertyuiop',
		DB_USER: 'simple_site_builder',
		DB_PASSWORD: 'Mammoth.1234',
		NODE_ENVIRONMENT: 'production',
		S3ID: 'DO00REGH3AEMTDAK96AP',
		S3KEY: 'RpQMGhMBKMwpIfiujf97alnTBS/nIo4+zQOEtql879o'
	}
  }]
}
