require("dotenv").config()

const express = require("express")
const cors = require("cors")
const session = require('express-session')
const sequelize = require('./db/connection.js')
const models = require('./db/models')

const app = express()

app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(session({
	name : 'gammaScript',
	secret : '^$%*GammaScriptSessionSecret*%$^',
	resave :false,
	saveUninitialized: true,
	cookie : {
		maxAge:(1000 * 60 * 100)
	}      
}));


app.use("/api/notes*", async (req, res, next) => {
	if(!req.session.user || !req.session.user.email){
		res.json({err: 'Not allowed!'})
		return
	}
	next()
})
app.use("/api/coupons*", async (req, res, next) => {
	if(!req.session.user || !req.session.user.email){
		res.json({err: 'Not allowed!'})
		return
	}
	next()
})
// Routes
app.use(require("./api/user"))
app.use(require("./api/notes"))
app.use(require("./api/coupon"))

// Handle Errors
app.use(function(err, req, res, next) {
	console.error(err.stack)
	res.status(500).json({error: true, msg: 'Something broke!'})
})

// Use exress server to render the React App as well in production
if( process.env.NODE_ENV == 'production'){
	const path = require('path')
	app.use(express.static(path.join(__dirname, '../build')));
  
	app.get('/*[^(/api)]', (req, res) => {
	  res.sendFile(path.join(__dirname, '../build', 'index.html'));
	});
}

let port = 5000
if(process.env.NODE_ENV == 'production' && process.env.PORT ){
  port = process.env.PORT
}
app.listen(port, async () => {
	console.log(`Server is running on port: ${port}`)
	console.log('Testing DB connection...')
	
	sequelize.authenticate().then( async() => {
		console.log('Connection established successfully.');
		console.log('Synchronizing models...')
		
		for(model in models){
			console.log(`Synchronizing '${model}'...`)
			await models[model].sync({ force: false, alter: true })
			console.log(`'${model}' synchronized`)
		}
	  }).catch(err => {
		console.error('Unable to connect to the database:', err)
	  }).finally(() => {
		// sequelize.close()
	  })
})