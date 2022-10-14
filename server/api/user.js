const express = require("express")
const bcrypt = require("bcrypt")
var JWT = require('jsonwebtoken');
const {Op} = require("sequelize")

// const UserController = require('../controllers/UserController.js')
// const execQuery = require('../db/execQuery.js')

const User = require('../db/models/user.model')
const Coupon = require('../db/models/coupon.model')
const userRoutes = express.Router()

userRoutes.route("/api/users/current").post(async(req, res) => {

	let decoded;
    try{
        decoded = JWT.verify(req.headers.authorization, process.env.JWT_SECRET)
        if(!decoded || Number.isNaN(Number(decoded.id))){
            // console.log('==================>>Not decoded')
            res.error('Invalid')
            return
        }
    }catch(e){
        // console.log(e)
        res.error('Invalid')
        return
    }

	if( decoded ){
		let  {name, email, username, isVIP} = decoded
		res.success('', { user: {name, email, username, isVIP } })
	}else{
		res.error('', { loggedIn: false })
	}
	return
})

userRoutes.route("/api/users/logout").post( (req, res) => {
	/* req.session.destroy(() => {
		res.status(200).end()
	}) */
})

// Create token when a user clicks forgot password
userRoutes.route("/api/users/recover").post( async (req, res) => {
	let { email } = req.body
	let user = await User.findOne({ where: { email } })
	if(!user){
		res.json({ res: "error", text: "No user found with that email." })
		return
	}


	let ResetPassToken = require('../db/models/resetPasswordToken.model')

	// delete old unused tokens by this user
	await ResetPassToken.destroy({ where: { user: user.id, used: false } })
	// let tokens = await ResetPassToken.findAll({ where : { user: user.id, used: false } })

	let token = await ResetPassToken.create({
		user: user.id,
		token: Math.random().toString(36).replace(/[^a-zA-Z0-9]/ig,'') + Math.random().toString(36).replace(/[^a-zA-Z0-9]/ig,'')
	})
	var postmark = require("postmark")
	var client = new postmark.ServerClient("94050bcd-7da1-466b-9b15-dad3d71a4713");

	client.sendEmail({
		"From": "support@masterwebapps.com",
		"To": user.email,
		"Subject": "Reset Password",
		"HtmlBody": "<strong>Hello</strong>.</br>Please click the link below to reset your password.</br><a href='http://simplewebsitenow.com/reset-password?token=" + token.token + "'>Reset Password</a></br>",
		"TextBody": "",
		"MessageStream": "outbound"
	});
	res.json({ res: "success", text: "An email has been sent to you with a link to reset your password." })
})

// Reset password
userRoutes.route("/api/users/reset_password").post( async (req, res) => {
	
	let ResetPassToken = require('../db/models/resetPasswordToken.model')
	let token = await ResetPassToken.findOne({ where: { used: false, token: req.body.token } })
	if(!token){
		res.json({ res: "error", text: "Invalid or expired reset password url. Please try again." })
		return
	}
	if( req.body.password != req.body.confirm_password || req.body.password.length < 7 ){
		res.json({ res: "error", text: "Password and confirm password doesn't match" })
		return
	}
	let user = await User.findOne({ where: { id: token.user } })
	if(!user){
		res.json({ res: "error", text: "User not found. Please try again." })
		return
	}

	user.password = req.body.password
	await user.save()
	token.used = true
	await token.save()
	req.user = await user.get()
	res.json({ res: "success", text: "Password updated." })
})


// Log the user in
userRoutes.route("/api/users/login").post( async (req, res) => {
	if(req.user && req.user.email){
		return
	}

	let user;
	const { username, password } = req.body
	user = await User.findOne({
		where: {
			[Op.or]: [{
					username: username.toLowerCase()
				},{
					email: username.toLowerCase()
				}
			]}
		})
	if(!user){
		res.json({res: 'error', text: 'User with these credentials doesn\'t exists'})
		return
	}
	let userData = await user.get()

	let token = JWT.sign(userData, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })

	if(bcrypt.compareSync(password, userData.password, 12) ){
		let {name, username, email, isVIP} = userData
		res.success(`Welcome Back! ${name}`, {user: {name, username, email, isVIP, token}})
	}else{
		res.error(`Incorrect Username or Password.`)
	}
})


// Register new user
userRoutes.route("/api/users/register").post(async (req, res) => {
	try{
		let { password, email, name } = req.body
		if(req.user && req.user.id){
			res.error('',{})
			return
		}
		username = req.body.username.toLowerCase().replace(/([^a-zA-Z0-9\s])/g, '').replace(/\s/g, '_')

		let userCheck = await User.findOne({ where: { [Op.or]: [{ username: username.toLowerCase() },{ username: email.toLowerCase() } ]} })
		if(!userCheck){
			userCheck = await User.findOne({ where: { [Op.or]: [{ email: username.toLowerCase() },{ email: email.toLowerCase() } ]} })
		}
		if(userCheck && userCheck.id){
			res.error('Email or Username already exists.')
			return
		}
		let userInfo = {
			username,
			password,
			email,
			name,
		}
		
		// Check Coupon info to make user VIP
		let coupon = await Coupon.findOne({ where: { code: req.body.coupon } })
		if(coupon && !coupon.userEmail){
			userInfo.isVIP = true
			coupon.userEmail = email
			coupon.usedDate = new Date()
			await coupon.save()
		}
		// ===============Coupon Implementation code block ends here=================

		let user = await User.create(userInfo)
		let createdUser = user.get()
		// req.session.user = createdUser
		let token = JWT.sign(createdUser, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })

		res.success(`Welcome ${user.name}!`, {user: {name, username, email, token}})
	}catch(err){
		console.log(err)
		res.error('Something went wrong.')
	}
})

// Update user settings
userRoutes.route("/api/users/update").post(async(req, res) => {
	if( req.user && req.user.id ){

		let  {name} = req.body

		let user = await User.findOne({ where: { id: req.user.id } })
		if(user){
			// Allow Maximum 25 chars in name
			user.name = name ? name.slice(0,25) : user.name

			await user.save()
			res.success('Settings Updated!', { user: {name}})
		}else{
			res.error('Not Found. Please refresh the page and try again.')
		}
	}else{
		res.error('You are not logged in.')
	}
	return
})

module.exports = userRoutes