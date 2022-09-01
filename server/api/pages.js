const express = require("express");
const Page = require("../db/models/page.model");
const { Op } = require("sequelize");

const pagesRoutes = express.Router();

// Get all user pages
pagesRoutes.route("/api/pages").get( async (req, res) => {
	if(!req.user || !req.user.email || !req.user.id){
		res.json([{}])
		return
	}
	let ownerID = req.user.id
	let pages = await Page.findAll({where: {ownerID /* , deleted: {[Op.ne] : true} */ }, order: [['createdAt', 'DESC']]})
	res.json(pages)
})

// Add/Update user page
pagesRoutes.route("/api/page/save").post( async (req, res) => {

	try{
		let record;
		if(req.body.id){
			let page = await Page.findOne({where: {id: req.body.id} })
			if(page && page.owner && req.session && req.session.user && req.session.user.id && Number(page.owner) == Number(req.session.user.id)){
				page.title = req.body.title
				page.content = req.body.content
				record = await page.save()
			}else{
				res.json({res: 'error', text: 'Error updating page', page: req.body})
				return
			}
		}else{
			let page = await Page.create({
				title: req.body.title,
				content: req.body.content,
				owner: req.session.user.id,
			})
			record = await page.save()
		}

		res.json({res: 'success', text: req.body.id ? 'Page Updated': 'Page Created', page: record})
	}catch(e){
		console.log(e)
		res.json({res: 'error', text: 'Error saving page', page: req.body})
	}
})


// Delete user page permanently
pagesRoutes.route("/api/page/:id").delete( async (req, res) => {
	if(!req.session || !req.session.user || !req.session.user.id){
		res.json({res: 'error', text: 'Unauthorized!'})
		return
	}
	let page = await Page.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !page ){
		res.json({res: 'error', text: 'Page not found'})
		return
	}
	await Page.destroy({where: {parent: page.id}})
	await page.destroy()
	res.json({res: 'success', text: 'Page deleted'})

})

// Get single shared page if exists.
pagesRoutes.route("/api/get_page/:id").get( async (req, res) => {
	
	let page = await Page.findOne({where: {shareLink: req.params.id} })
	if(!page || !(['view', 'edit'].includes(page?.sharedAccessType)) || page?.deleted ){
		res.json({res: 'error', text: 'Page not found'})
		return
	}
	res.json(page)
})

module.exports = pagesRoutes