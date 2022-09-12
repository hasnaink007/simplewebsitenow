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
		console.log('Nginx file updated for: '+ project.filesPath);
	});

	const { exec } = require('child_process');
	
	const continueWithSymLink = async () => {
		return exec( `ln -s ${dir}/${project.filesPath} /etc/nginx/sites-enabled/`, (err, stdout, stderr) => {
			if (err) {
				console.error(err)
			} else {
				console.log(`Symlink Result:`)
				exec( 'find /etc/nginx/sites-enabled/ -xtype l -delete', (err, stdout, stderr) => {
					if (err) {
						console.error(err)
					} else {
						console.log(`Delete results:`)
						
						exec('service nginx reload', (err, stdout, stderr) => {
							if (err) {
								console.error(err)
							} else {
								console.log(`Nginx reload results:`)
							}
						})
					}
				})
			}
		})
	}
	
	
	let oldFilePath = `/etc/nginx/sites-enabled/${project.filesPath}`
	if (fs.existsSync(oldFilePath)) {
		fs.unlink(oldFilePath, (err) => {
			if (err) {
		  		console.error('removing file error',err)
		  		return
			}else{
				console.log(`Old Symlink delted:`)
				continueWithSymLink()
			}
			//file removed
		})
	}else{
		continueWithSymLink()
	}
}


// Add/Update user project
projectsRoutes.route("/api/project/chackavailbility").post( async (req, res) => {

	if(req.body.domain?.replace(/[^a-zA-Z0-9]/gi, '')?.length < 3){
		res.error('Domain name is not available', {})
		return
	}
	domainName = req.body.domain?.replace(/[^a-zA-Z0-9\.\_]/gi, '')

	let project = await Project.findOne({where: { domainName, isSubDomain: true }})
	if(project){
		res.error('Domain name is not available', {})
	}else{
		res.success('Domain name is available', {})
	}
})

projectsRoutes.route("/api/project/save").post( async (req, res) => {

	let domainName = req.body.domainName?.replace(/[^a-zA-Z0-9\.\_]/ig, '')?.toLowerCase()?.substring(0,50)
	
	if(!domainName || domainName.replace(/[^a-zA-Z0-9]/ig, '').length < 3){ 
		res.error('The selected domain name is not available.')
		return
	}
	let projectWithDomain = await Project.findOne({where: { domainName: req.body.domainName, isSubDomain: true }})

	if(projectWithDomain && projectWithDomain.id != req.body.pid){
		res.error('The selected domain name is not available.')
		return
	}


	try{
		let record;
		if(req.body.pid){
			let project = await Project.findOne({where: {id: req.body.pid} })
			
			if(project && project.ownerID && req.user && req.user.id && Number(project.ownerID) == Number(req.user.id)){
				project.name = req.body.name
				project.description = req.body.description
				project.domainName = domainName
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
				domainName: domainName,
				isSubDomain: true,
				filesPath: (new Date().getTime() + '' + new Date().getUTCMilliseconds())
			})
			record = await project.save()
			
			createProjectRootDir(project)
			
			/* const dir = path.resolve(path.join(__dirname, `../../sites/${record.filesPath}`));
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			} */

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




projectsRoutes.route("/api/project/clone").post( async (req, res) => {

	let domainName = req.body.domainName?.replace(/[^a-zA-Z0-9\.\_]/ig, '')?.toLowerCase()?.substring(0,50)
	
	if(!domainName || domainName.replace(/[^a-zA-Z0-9]/ig, '').length < 3){ 
		res.error('The selected domain name is not available.')
		return
	}
	let projectWithDomain = await Project.findOne({where: { domainName: req.body.domainName, isSubDomain: true }})

	if(projectWithDomain && projectWithDomain.id != req.body.pid){
		res.error('The selected domain name is not available.')
		return
	}


	try{
		let record;

		let projectToClone = await Project.findOne({where: {id: req.body.project_id, ownerID: req.user.id}})

		if(!projectToClone){
			res.error('Error cloning project!', {})
			return
		}

		let project = await Project.create({
			name: req.body.name,
			description: projectToClone.description,
			ownerID: req.user.id,
			domainName: domainName,
			isSubDomain: true,
			filesPath: (new Date().getTime() + '' + new Date().getUTCMilliseconds())
		})
		record = await project.save()
		project = await project.get()

		// Copy all the pages
		let pages = await Page.findAll({where: {projectID: projectToClone.id}})

		let pagesToClone = []

		pages.forEach(page => {
			pagesToClone.push({
				name: page.name,
				title: page.title,
				description: page.description,
				type: page.type,
				headerScripts: page.headerScripts,
				content: page.content,
				creatorID: req.user.id,
				projectID: project.id,
			})
		})

		await Page.bulkCreate(pagesToClone)

		// Copy files

		const fs = require('fs');
		const path = require('path');
		const { exec } = require('child_process');

		let dir = path.resolve(path.join(__dirname, `../../sites/`));
		if (!fs.existsSync(dir +'/'+ project.filesPath)) {
			fs.mkdirSync(dir +'/'+ project.filesPath);
		}

		exec(`cp ${dir+'/'+projectToClone.filesPath}/* ${dir+'/'+project.filesPath}/`, (err, stdout, stderr) => {
			if (err) {
				console.error(err)
			} else {
				console.log(`All files copied!`)
				createProjectRootDir(project)

				if (fs.existsSync( dir +'/'+ project.filesPath + '/' + projectToClone.filesPath )) {
					fs.unlink(dir +'/'+ project.filesPath + '/' + projectToClone.filesPath , (err) => {
						if (err) {
							console.error('removing file error',err)
							return
						}else{
							console.log(`cloned project's nginx config deleted`)
						}
					})
				}
			}
		})

		pages = await Page.findAll({
			where: {
				projectID: project.id
			},
			attributes: ['name', 'id', 'projectID', 'type']
		})
		project = {...(project.dataValues || project), pages: (pages || []) }


		res.success('Project Copied!', project)
	}catch(e){
		console.log(e)
		res.error('Error cloning project')
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