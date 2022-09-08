const express = require("express");
const Project = require("../db/models/project.model");
const { Op } = require("sequelize");
const Page = require("../db/models/page.model");

const projectsRoutes = express.Router();

// Get all user projects
projectsRoutes.route("/api/projects").get( async (req, res) => {
	if(!req.user || !req.user.email || !req.user.id){
		res.error('', [{}])
		return
	}
	let ownerID = req.user.id
	let projects = await Project.findAll({
		where: {ownerID },
		order: [['createdAt', 'ASC']],
		attributes: ['id', 'createdAt', 'description', 'domainName', 'id', 'isSubDomain', 'name', 'ownerID', 'updatedAt']
	})
	for( let i = 0; i < projects.length; i++ ){
		let pages = await Page.findAll({
			where : {projectID: projects[i].id},
			attributes: ['name', 'id', 'projectID', 'type']
		})
		projects[i] = {...projects[i].dataValues, pages: (pages || []) }
	}

	res.success('', projects)
})


const createProjectRootDir = (project) => {

	const fs = require('fs');
	const path = require('path');

	let dir = path.resolve(path.join(__dirname, `../../sites/${project.filesPath}`));
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	let nginxFile = `server {
		listen 80;
		listen [::]:80;
 
		server_name ${project.domainName}.simplewebsitenow.com www.${project.domainName}.simplewebsitenow.com;
 
		root ${dir};
		index index.html;
 
		location / {
				try_files $uri $uri/ =404;
		}
 	}`

	fs.writeFile( dir +'/'+ project.filesPath, nginxFile, function (err) {
		if (err) throw err;
		console.log('Saved!');
	});


}


// Add/Update user project
projectsRoutes.route("/api/project/save").post( async (req, res) => {

	try{
		let record;
		if(req.body.pid){
			let project = await Project.findOne({where: {id: req.body.pid} })
			
			if(project && project.ownerID && req.user && req.user.id && Number(project.ownerID) == Number(req.user.id)){
				project.name = req.body.name
				project.description = req.body.description
				project.domainName = req.body.domainName
				project.isSubDomain = true

				// @TODO Remove below 2 lines when mature
				project.filesPath = project.filesPath || (new Date().getTime() + '' + new Date().getUTCMilliseconds())
				createProjectRootDir(project)

				record = await project.save()


				// Update index page
				let newIndex = await Page.findOne({where: { projectID: project.id, id: req.body.indexPage }})
				let oldIndex = await Page.findOne({where: { projectID: project.id, type: 'index' }})
				if(newIndex){
					if(oldIndex){
						oldIndex.type = 'page',
						await oldIndex.save()
					}
					newIndex.type = 'index'
					await newIndex.save()
					// console.log({oldIndex, newIndex})
				}
			}else{
				res.error('Error updating project')
				return
			}
		}else{
			let project = await Project.create({
				name: req.body.name,
				description: req.body.description,
				ownerID: req.user.id,
				isSubDomain: true,
				filesPath: (new Date().getTime() + '' + new Date().getUTCMilliseconds())
			})
			record = await project.save()
			
			createProjectRootDir(project)
			
			const dir = path.resolve(path.join(__dirname, `../../sites/${record.filesPath}`));
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			let page = await Page.create({
				name: 'index',
				type: 'index',
				description: 'Default index page when project was created',
				creatorID: req.user.id,
				projectID: record.id,
				content: '{}'
			})
			await page.save()
		}

		res.success('Settings Updated', record)
	}catch(e){
		console.log(e)
		res.error('Error saving project')
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