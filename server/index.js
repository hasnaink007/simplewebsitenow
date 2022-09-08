require("dotenv").config()

const express = require("express")
const cors = require("cors")
const JWT = require('jsonwebtoken');

const sequelize = require('./db/connection.config')
const models = require('./db/models')

const app = express()

app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json())


// Define success and error response type helpers
app.use( async (req, res, next) => {
	res.error = (text, data) => {
		res.json({
			success: false,
			message: text,
			data
		})
	}
	res.success = (text, data) => {
		res.json({
			success: true,
			message: text,
			data
		})
	}
	next()
})

// Authenticate user
const AuthenticateRoute = async (req, res, next) => {
	let decoded;
    try{
        decoded = JWT.verify(req.headers.authorization, process.env.JWT_SECRET)
        if(!decoded || Number.isNaN(Number(decoded.id))){
            // console.log('==================>>Not decoded')
            res.error('Unauthorized.')
            return
        }
    }catch(e){
        console.log(e)
        res.error('Unauthorized')
        return
    }
    req.user = decoded
	next()
}


// Implement Authentication on Routes
app.use("/api/project*", AuthenticateRoute)
app.use("/api/page*", AuthenticateRoute)
// app.use("/api/page*", AuthenticateRoute)
app.use("/api/coupons*", AuthenticateRoute)
app.use("/api/image/upload*", AuthenticateRoute)


// Routes
app.use(require("./api/user"))
app.use(require("./api/projects"))
app.use(require("./api/pages"))
app.use(require("./api/coupon"))
app.use(require("./api/image_upload"))




// Handle Errors
app.use(function(err, req, res, next) {
	console.error(err.stack)
	res.status(500).json({error: true, msg: 'Something broke!'})
})




// Use exress server to render the React App as well in production
/* if( process.env.NODE_ENV == 'production'){
	const path = require('path')
	app.use(express.static(path.join(__dirname, '../build')));
  
	app.get('/*[^(/api)]', (req, res) => {
	  res.sendFile(path.join(__dirname, '../build', 'index.html'));
	});
} */
const port = process.env.SERVER_PORT || 3500;

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