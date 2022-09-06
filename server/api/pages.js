const express = require("express");
const Page = require("../db/models/page.model");
const Project = require("../db/models/project.model");
const { Op } = require("sequelize");

const pagesRoutes = express.Router();

// Get all user pages
pagesRoutes.route("/api/pages/:id").get( async (req, res) => {
	if(!req.user || !req.user.email || !req.user.id){
		res.error('',[{}])
		return
	}
	let project = await Project.findOne({where:{id: req.params.id, ownerID: req.user.id}})
	if(!project){
		res.error('Not Authorized', [{}])
		return
	}
	let pages = await Page.findAll({
		where: { projectID: req.params.id},
		order: [['createdAt', 'ASC']],
		attributes: ['id', 'name', 'title', 'description', 'type', 'headerScripts', 'projectID']})

	let selected = await Page.findOne({where: { projectID: req.params.id, type: 'index' }})
	res.success('', {pages, selected})
})

// Create or save page
pagesRoutes.route("/api/page/save").post( async (req, res) => {

	let data = req.body;
	// delete page.content;
	// console.log(page)
	try{
		let record;
		if(req.body.pid){
			console.log(req.body)
			let page = await Page.findOne({where: {id: req.body.pid} })

			// Check if the page exists.
			if(!page){
				res.error('Not Found', req.body)
				return
			}else{
				// Update the page only if the project is owned by this user
				let project = await Project.findOne({where: {id: page.projectID, ownerID: req.user.id}})
				
				if(!project){
					res.error('Not Found', req.body)
					return
				}

				page.title = req.body.title //.replace(/[^a-zA-Z0-9 _\-\!\#\$\%\^\&\*]/ig, '').slice(0, 100) || page.title;
				page.name = req.body.name.replace(/\s/ig, '_').replace(/[^a-zA-Z0-9_]/ig, '').slice(0, 50) || page.name
				page.headerScripts = req.body.headerScripts
				page.description = req.body.description
				await page.save()
				page = await page.get()
				res.success('Page updated', {...page})
			}
		}else{
			let project = await Project.findOne({where: {id: req.body.projectID, ownerID: req.user.id}})
				
			if(!project){
				res.error('Not Found', req.body)
				return
			}

			let page = await Page.create({
				title: req.body.title,//.replace(/[^a-zA-Z0-9_ \-\!\#\$\%\^\&\*]/ig, '').slice(0, 100) || 'New Page',
				name: req.body.name.replace(/\s/ig, '_').replace(/[^a-zA-Z0-9_]/ig, '').slice(0, 50) || new Date().setMilliseconds(0),
				content: req.body.content || '{}',
				creatorID: req.user.id,
				projectID: project.id
			})
			record = await page.save()
			res.success('Page created', record)
		}

	}catch(e){
		console.log(e)
		res.error('Error saving page')
	}
})

// Update page
pagesRoutes.route("/api/page/update").post( async (req, res) => {

	try{
		let record;
		if(req.body.id){
			let page = await Page.findOne({where: {id: req.body.id} })

			// Check if the page exists.
			if(!page){
				res.error('Not Found', req.body)
				return
			}else{
				// Update the page only if the project is owned by this user
				let project = await Project.findOne({where: {id: page.projectID, ownerID: req.user.id}})
				
				if(!project){
					res.error('Not Found', req.body)
					return
				}
				
				page.content = req.body.content;
				// page.name = req.body.name.replace(/\s/ig, '_').replace(/[^a-zA-Z0-9_]/ig, '').slice(0, 20) || page.name
				await page.save()
				page = await page.get()
				res.success('Page updated', page)
			}
		}else{
			res.error('Not Found', req.body)
		}

	}catch(e){
		console.log(e)
		res.error('Error saving page')
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

// Get single page if exists.
pagesRoutes.route("/api/page/:id").get( async (req, res) => {

	let page = await Page.findOne({where: {id: req.params.id} })
	if(!page){
		res.error('Not Found', {})
		return
	}

	let project = await Project.findOne({where: {ownerID: req.user.id, id: page.projectID}})

	if(!project){
		res.error('Not Found', {})
		return
	}


	res.success('', page)
})

module.exports = pagesRoutes