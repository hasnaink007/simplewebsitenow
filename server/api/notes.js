const express = require("express");
const Note = require("../db/models/note.model");
const { Op } = require("sequelize");

const notesRoutes = express.Router();

// Get all user notes
notesRoutes.route("/api/notes").get( async (req, res) => {
	if(!req.session || !req.session.user || !req.session.user.id){
		res.json([{}])
		return
	}
	let owner = req.session.user.id
	let notes = await Note.findAll({where: {owner /* , deleted: {[Op.ne] : true} */ }, order: [['createdAt', 'DESC']]})
	res.json(notes)
})

// Add/Update user note
notesRoutes.route("/api/note/manage").post( async (req, res) => {

	try{
		let record;
		if(req.body.id){
			let note = await Note.findOne({where: {id: req.body.id} })
			if(note && note.owner && req.session && req.session.user && req.session.user.id && Number(note.owner) == Number(req.session.user.id)){
				note.title = req.body.title
				note.content = req.body.content
				record = await note.save()
			}else{
				res.json({res: 'error', text: 'Error updating note', note: req.body})
				return
			}
		}else{
			let note = await Note.create({
				title: req.body.title,
				content: req.body.content,
				owner: req.session.user.id,
			})
			record = await note.save()
		}

		res.json({res: 'success', text: req.body.id ? 'Note Updated': 'Note Created', note: record})
	}catch(e){
		console.log(e)
		res.json({res: 'error', text: 'Error saving note', note: req.body})
	}
})

// Add/Update user note
notesRoutes.route("/api/note/order").post( async (req, res) => {

	if( !req.session?.user?.id || ! req.body.noteID/*  || !req.body.parentID */ ){
		res.json({res: 'error', text: 'Error updating order'})
		return
	}

	try{
		let notes = await Note.findAll({
			where: {
				id: { [Op.in]: [req.body.noteID, req.body.parentID] },
				owner: req.session.user.id,
			}
		})
		let note = notes.find(n => n.id == req.body.noteID)
		let parent = notes.find(n => n.id == req.body.parentID)
		if(note){
			note.parent = parent?.id || 0
			await note.save()
			note = await note.get()
			res.json({note})
		}else{
			res.json({res: 'error', text: 'Error updating order', note: req.body})
		}

	}catch(e){
		console.log(e)
		res.json({res: 'error', text: 'Error saving note', note: req.body})
	}
})

// generate note share link
notesRoutes.route("/api/note/link/:id").get( async (req, res) => {

	let note = await Note.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !note ){
		res.json({res: 'error', text: 'Note not found'})
		return
	}
	if(note.shareLink){
		res.json({link: note.shareLink})
		return
	}
	note.shareLink = Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 15) + Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 15)
	note.sharedAccessType = 'none'
	await note.save()
	res.json({link: note.shareLink})

	// await note.destroy()
})

// update note shared access type
notesRoutes.route("/api/note/share/:id").post( async (req, res) => {

	let note = await Note.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !note ){
		res.json({res: 'error', text: 'Note not found'})
		return
	}
	if( !['none','view', 'edit'].includes(req.body.shared_access) ){
		res.json({res: 'error', text: 'Unkoown shared access type'})
		return
	}
	if(!note.shareLink){
		note.shareLink = Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 15) + Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 15)
	}
	note.sharedAccessType = req.body.shared_access
	await note.save()
	res.json({ type: 'success', text: 'Sharing setting updated', link: note.shareLink})

})

// Delete user note || move to recycle bin actually
notesRoutes.route("/api/note/:id").delete( async (req, res) => {
	if(!req.session || !req.session.user || !req.session.user.id){
		res.json({res: 'error', text: 'Unauthorized!'})
		return
	}
	let note = await Note.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !note ){
		res.json({res: 'error', text: 'Note not found'})
		return
	}
	note.deleted = true
	await note.save()
	res.json({res: 'success', text: 'Note deleted'})

	// await note.destroy()
})

// Delete user note permanently
notesRoutes.route("/api/note/delete/:id").delete( async (req, res) => {
	if(!req.session || !req.session.user || !req.session.user.id){
		res.json({res: 'error', text: 'Unauthorized!'})
		return
	}
	let note = await Note.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	if( !note ){
		res.json({res: 'error', text: 'Note not found'})
		return
	}
	await Note.destroy({where: {parent: note.id}})
	await note.destroy()
	res.json({res: 'success', text: 'Note deleted'})

})

// restore user note from recycle bin
notesRoutes.route("/api/note/restore/:id").post( async (req, res) => {
	if(!req.session || !req.session.user || !req.session.user.id){
		res.json({res: 'error', text: 'Unauthorized!'})
		return
	}
	let note = await Note.findOne({where: {id: req.params.id, owner: req.session.user.id} })
	note.deleted = false
	await note.save()
	res.json({res: 'success', text: 'Note restored'})

	// await note.destroy()
})

// Get single shared note if exists.
notesRoutes.route("/api/get_note/:id").get( async (req, res) => {
	
	let note = await Note.findOne({where: {shareLink: req.params.id} })
	if(!note || !(['view', 'edit'].includes(note?.sharedAccessType)) || note?.deleted ){
		res.json({res: 'error', text: 'Note not found'})
		return
	}
	res.json(note)
})

module.exports = notesRoutes