const express = require("express")
const bcrypt = require("bcrypt")
const {Op} = require("sequelize")

// const UserController = require('../controllers/UserController.js')
// const execQuery = require('../db/execQuery.js')

const User = require('../db/models/user.model')
const Note = require('../db/models/note.model')
const Coupon = require('../db/models/coupon.model')
const userRoutes = express.Router()

userRoutes.route("/api/users/current").post(async(req, res) => {
	if( req.session.user ){
		let  {name, email, username, theme, defaultCodingLang, codeBlockTheme} = req.session.user
		res.json({ user: {name, email, username, theme, defaultCodingLang, codeBlockTheme } })
	}else{
		res.json({ loggedIn: false })
	}
	return
})

userRoutes.route("/api/users/logout").post( (req, res) => {
	req.session.destroy(() => {
		res.status(200).end()
	})
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
	await ResetPassToken.destroy({ where: { user: user.id, used: false } })
	let tokens = await ResetPassToken.findAll({ where : { user: user.id, used: false } })

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
		"HtmlBody": "<strong>Hello</strong>.</br>Please click the link below to reset your GammaScript password.</br><a href='http://gammascript.com/reset-password?token=" + token.token + "'>Reset Password</a></br>",
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
	req.session.user = await user.get()
	res.json({ res: "success", text: "Password updated." })
})

userRoutes.route("/api/users/login").post( async (req, res) => {
	if(req.session.user && req.session.user.email){
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
	if(bcrypt.compareSync(password, userData.password, 12) ){
		req.session.user = userData
		let {name, username, email, theme, defaultCodingLang, codeBlockTheme} = userData
		res.json({user: {name, username, email, theme, defaultCodingLang, codeBlockTheme}, res: 'success', text: `Welcome Back! ${name}`})
	}else{
		res.json({ res: 'error', text: `Incorrect Username or Password.` })
	}
})

userRoutes.route("/api/users/register").post(async (req, res) => {
	try{
		let { password, email, name } = req.body
		if(req.session && req.session.user && req.session.user.id){
			res.json({})
			return
		}
		username = req.body.username.toLowerCase().replace(/([^a-zA-Z0-9\s])/g, '').replace(/\s/g, '_')

		let userCheck = await User.findOne({ where: { [Op.or]: [{ username: username.toLowerCase() },{ username: email.toLowerCase() } ]} })
		if(!userCheck){
			userCheck = await User.findOne({ where: { [Op.or]: [{ email: username.toLowerCase() },{ email: email.toLowerCase() } ]} })
		}
		if(userCheck && userCheck.id){
			res.json({res: 'error', text: 'Email or Username already exists.'})
			return
		}
		let userInfo = {
			username,
			password,
			email,
			name,
			codeBlockTheme: 'default',
			theme: 'dark',
			defaultCodingLang: 'javascript'
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
		/* user.codeBlockTheme = 'default'
		user.theme = 'dark'
		user.defaultCodingLang = 'javascript'
		await user.save() */
		let createdUser = user.get()
		req.session.user = createdUser

		// Create sample Note
		const fs = require('fs')
		let templates = [
			{
				title: 'Today\'s goals',
				content: fs.readFileSync('./server/templates/notes/goals.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Awesome App',
				content: fs.readFileSync('./server/templates/notes/simple.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Simple Chart',
				content: fs.readFileSync('./server/templates/notes/charts.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Multiple Features',
				content: fs.readFileSync('./server/templates/notes/multi.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Example of UML Chart',
				content: fs.readFileSync('./server/templates/notes/uml.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Table with Merged Cell',
				content: fs.readFileSync('./server/templates/notes/table.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Text color Example',
				content: fs.readFileSync('./server/templates/notes/color.md', 'utf8'),
				owner: createdUser.id,
			},{
				title: 'Code syntax Highlighting',
				content: fs.readFileSync('./server/templates/notes/code.md', 'utf8'),
				owner: createdUser.id,
			}
		]

		await Note.bulkCreate(templates)
		delete createdUser.password
		res.json({user: createdUser, res: 'success', text: `Welcome ${user.name}!`})
	}catch(err){
		console.log(err)
		res.json({res: 'error', text: 'Something went wrong.'})
	}
})

// Update user settings
userRoutes.route("/api/users/update").post(async(req, res) => {
	if( req.session.user ){
		let  {name, theme, lang, cbTheme} = req.body

		let user = await User.findOne({ where: { id: req.session.user.id } })
		if(user){
			// Allow Maximum 25 chars in name
			user.name = name ? name.slice(0,25) : user.name
			req.session.user.name = user.name
			
			// check if theme name is valid
			let themes = ["dark","light","coffee","violet","squid","aliceblue","charcoal"]
			user.theme = (theme && themes.includes(theme)) ? theme : user.theme
			req.session.user.theme = user.theme

			// check if language selected is valid
			let langs = ["plaintext","markup","html","mathml","svg","xml","ssml","atom","rss","css","clike","javascript","js","abap","abnf","actionscript","ada","agda","al","antlr4","g4","apacheconf","apex","apl","applescript","aql","arff","asciidoc","adoc","asm6502","aspnet","autohotkey","autoit","bash","shell","basic","batch","bbcode","shortcode","birb","bnf","rbnf","brainfuck","brightscript","bro","bsl","oscript","c","bison","cil","clojure","cmake","coffeescript","coffee","concurnas","conc","cpp","arduino","ino","csharp","cs","dotnet","csp","cypher","d","dart","dataweave","dax","dhall","diff","markup-templating","django","jinja2","dns-zone-file","dns-zone","docker","dockerfile","ebnf","editorconfig","eiffel","ejs","eta","elixir","elm","erb","erlang","etlua","excel-formula","xls","xlsx","factor","firestore-security-rules","flow","fortran","fsharp","ftl","gcode","gdscript","gedcom","gherkin","git","glsl","gml","gamemakerlanguage","go","graphql","groovy","haml","handlebars","hbs","mustache","haskell","hs","haxe","hcl","hlsl","hpkp","hsts","http","ichigojam","icon","iecst","ignore","gitignore","hgignore","npmignore","inform7","ini","io","j","java","javadoclike","javadoc","typescript","ts","javastacktrace","jolie","jq","jsdoc","json","webmanifest","json5","jsonp","jsstacktrace","jsx","julia","keyman","kotlin","kt","kts","latex","tex","context","latte","less","lilypond","ly","liquid","lisp","elisp","emacs","emacs-lisp","livescript","llvm","lolcode","lua","makefile","markdown","md","matlab","mel","mizar","mongodb","monkey","moonscript","moon","n1ql","n4js","n4jsd","nand2tetris-hdl","naniscript","nani","nasm","neon","nginx","nim","nix","nsis","objectivec","objc","ocaml","opencl","oz","parigp","parser","pascal","objectpascal","pascaligo","pcaxis","px","peoplecode","pcode","perl","php","phpdoc","sql","plsql","powerquery","pq","mscript","powershell","processing","prolog","promql","properties","protobuf","pug","puppet","pure","purebasic","pbfasm","purescript","purs","python","py","q","qml","qore","r","scheme","racket","rkt","reason","regex","renpy","rpy","rest","rip","roboconf","robotframework","robot","ruby","rb","crystal","rust","sas","sass","scala","scss","shell-session","shellsession","sh-session","smali","smalltalk","smarty","sml","smlnj","solidity","sol","solution-file","sln","soy","turtle","trig","sparql","rq","splunk-spl","sqf","stan","stylus","swift","t4-templating","t4-cs","t4","t4-vb","tap","tcl","textile","toml","tsx","tt2","twig","typoscript","tsconfig","unrealscript","uscript","uc","vala","vbnet","velocity","verilog","vhdl","vim","visual-basic","vb","vba","warpscript","wasm","wiki","xeora","xeoracube","xojo","xquery","yaml","yml","yang","zig"]
			user.defaultCodingLang = (lang && langs.includes(lang) ) ? lang : user.defaultCodingLang
			req.session.user.defaultCodingLang = user.defaultCodingLang

			let cbThemes = ["default","dark","coy","funky","okaidia","twilight","tomorrow","solarizedlight"]
			user.codeBlockTheme = (cbTheme && cbThemes.includes(cbTheme) ) ? cbTheme : user.codeBlockTheme
			req.session.user.codeBlockTheme = user.codeBlockTheme

			await user.save()
			res.json({ user: {name: user.name, theme: user.theme, lang: user.defaultCodingLang, codeBlockTheme: user.codeBlockTheme }, res: 'success', text: 'Settings Updated!' })
		}else{
			res.json({ res: 'error', text: 'Not Found. Please refresh the page and try again.' })
		}
	}else{
		res.json({ res: 'error', text: 'You are not logged in.' })
	}
	return
})

module.exports = userRoutes