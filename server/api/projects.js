const express = require("express");
const Project = require("../db/models/project.model");
const { Op } = require("sequelize");

const projectsRoutes = express.Router();

// Get all user projects
projectsRoutes.route("/api/projects").get( async (req, res) => {
	if(!req.user || !req.user.email || !req.session.user.id){
		res.json([{}])
		return
	}
	let ownerID = req.user.id
	let projects = await Project.findAll({where: {ownerID /* , deleted: {[Op.ne] : true} */ }, order: [['createdAt', 'DESC']]})
	res.json(projects)
})

// Add/Update user project
projectsRoutes.route("/api/project/save").post( async (req, res) => {

	try{
		let record;
		if(req.body.id){
			let project = await Project.findOne({where: {id: req.body.id} })
			if(project && project.owner && req.user && req.user.id && Number(project.owner) == Number(req.user.id)){
				project.title = req.body.title
				project.content = req.body.content
				record = await project.save()
			}else{
				res.json({res: 'error', text: 'Error updating project', project: req.body})
				return
			}
		}else{
			let project = await Project.create({
				title: req.body.title,
				content: req.body.content,
				owner: req.user.id,
			})
			record = await project.save()
		}

		res.json({res: 'success', text: req.body.id ? 'Project Updated': 'Project Created', project: record})
	}catch(e){
		console.log(e)
		res.json({res: 'error', text: 'Error saving project', project: req.body})
	}
})


// Delete user project permanently
projectsRoutes.route("/api/project/delete/:id").delete( async (req, res) => {
	if(!req.session || !req.user || !req.user.id){
		res.json({res: 'error', text: 'Unauthorized!'})
		return
	}
	let project = await Project.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !project ){
		res.json({res: 'error', text: 'Project not found'})
		return
	}
	await Project.destroy({where: {parent: project.id}})
	await project.destroy()
	res.json({res: 'success', text: 'Project deleted'})

})

// Get single shared project if exists.
projectsRoutes.route("/api/get_project/:id").get( async (req, res) => {
	
	let project = await Project.findOne({where: {shareLink: req.params.id} })
	if(!project || !(['view', 'edit'].includes(project?.sharedAccessType)) || project?.deleted ){
		res.json({res: 'error', text: 'Project not found'})
		return
	}
	res.json(project)
})

module.exports = projectsRoutes