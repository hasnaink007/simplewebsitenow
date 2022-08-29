import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { toastOptions } from 'src/utils/toast';
import { getURLParam } from 'utils/util';

const EditorContext = React.createContext();

class EditorContextProvider extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			saving: false,
			Editor: [],
			recyclebin: [],
			selectedNote: {},
			filter: '',
			
			loadEditor: this.loadEditor,
			filterEditor: this.filterEditor,
			deleteNote: this.deleteNote,
			restoreNote: this.restoreNote,
			deleteNotePermanently: this.deleteNotePermanently,
			showNote: this.showNote,
			createUpdateNote: this.createUpdateNote,
			updateNoteOnExit: this.updateNoteOnExit,
			saveNote: this.saveNote,
			handleChange: this.handleChange,
			updateNoteSharing: this.updateNoteSharing,
			orderNote: this.orderNote,
		}
	}

	componentDidMount(){
		this.loadEditor()
	}

	api_error  = () => {
		if( window.confirm('There were some error loading this page. Please refresh') ){
			window.location.reload()
		}
	}

	updateNoteSharing = async (sharingSettings) => {
		let toastID = toast.loading('Updating share access...')
		let req = await fetch(`/api/note/share/${this.state.selectedNote.id}`,{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sharingSettings)
		})

		let res = await req.json()
		toast.update(toastID, {...toastOptions, type: 'success', render: 'Shared access updated'})
		return res
	}

	loadEditor = async () => {
		let req = await fetch(`/api/notes`)
		let res = await req.json()
		if(res.err){
			window.history.pushState({}, '', '/')
			return
		}
		let ID = getURLParam('noteID')
		let selectedNote = res?.find(note => note.id === Number(ID)) || {}
		let Editor = res.filter(note => !note.deleted)
		let recyclebin = res.filter(note => note.deleted)
		this.setState({ ...this.state, Editor, recyclebin, selectedNote, loading: false })
	}

	showNote = (selectedNote) => {
		this.setState({...this.state, selectedNote})
	}

	filterEditor = (filter) => {
		this.setState({...this.state, filter})
	}
	
	handleChange = async (selectedNote) => {
		if( selectedNote.content == this.state.selectedNote.content && selectedNote.id == this.state.selectedNote.id ){
			return
		}

		if(this.previousNoteID == selectedNote.id){
			clearTimeout(this.timeout)
		}else{
			this.previousNoteID = selectedNote.id
		}

		if(selectedNote.id){
			selectedNote.title = this.getTitleFromContent(selectedNote.content)
			if( selectedNote.content.slice(0,2) != '# ' ){
				selectedNote.content = '# ' + selectedNote.content
			}

			let Editor = this.state.Editor.map(n => n.id == selectedNote.id ? selectedNote: n)
			this.setState({...this.state, Editor, selectedNote})
		}else{
			selectedNote.title = this.getTitleFromContent(selectedNote.content)
		}

		this.timeout = setTimeout(async () => {
			this.setState({...this.state, saving: true})
			let req = await fetch(`/api/note/manage`, {
				headers: { 'Content-type' : 'application/json' },
				method: 'POST',
				body: JSON.stringify(selectedNote)
			})
			let res = await req.json()
			if(!selectedNote.id){
				let Editor = [{...res.note}, ...this.state.Editor]
				this.setState({...this.state, selectedNote: res.note, Editor})
				window.history.pushState({}, '', `/dashboard/?noteID=${res.note?.id}`)
			}
			this.setState({...this.state, saving: false})
		}, 1500)
	}

	getTitleFromContent = (content) => {
		let title = ''
		for(let line of content.split('\n')){
			let lineFiltered = line.replaceAll(/[^a-zA-Z0-9\s\_\-]/gi, '').trim()
			if(lineFiltered.length > 0){
				title = lineFiltered.length > 18 ? lineFiltered.substring(0,15)+'...' : lineFiltered
				break
			}
		}
		return title || "Untitled Note"
	}

	deleteNote = async () => {
		let toastID = toast.loading('Deleting note...')
		let req = await fetch(`/api/note/${this.state.selectedNote.id}`, {
			method: 'DELETE',
		})
		let res = await req.json()
		let Editor = this.state.Editor.filter(n => n.id !== this.state.selectedNote.id)
		let recyclebin = [...this.state.recyclebin, this.state.selectedNote]
		this.setState({ ...this.state, Editor, recyclebin, selectedNote: {} })
		window.history.pushState({}, '', `/dashboard/`)
		toast.update(toastID, {...toastOptions, render: 'Moved to recycle bin', type: 'success' })
	}

	deleteNotePermanently = async ( note ) => {
		let childs = this.state.Editor.filter(n => n.parent == note.id)
		if(childs.length > 0 && !window.confirm(`This note has ${childs.length} child note/s. Are you sure you want to delete it permanently?`)){
			return
		}

		let toastID = toast.loading('Deleting note...')
		let req = await fetch(`/api/note/delete/${note.id}`, { method: 'DELETE' })
		let res = await req.json()

		let recyclebin = this.state.recyclebin.filter(n => n.id !== note.id)
		this.setState({ ...this.state, recyclebin })
		toast.update(toastID, {...toastOptions, render: 'Deleted', type: 'success' })
	}

	restoreNote = async ( note ) => {
		let toastID = toast.loading('Restoring note...')
		let req = await fetch(`/api/note/restore/${note.id}`, { method: 'POST' })
		let res = await req.json()
		let Editor = [...this.state.Editor, note]
		let recyclebin = this.state.recyclebin.filter(n => n.id !== note.id)
		this.setState({ ...this.state, Editor, recyclebin })
		toast.update(toastID, {...toastOptions, render: 'Note Restored', type: 'success' })
	}
	
	orderNote = async ( body ) => {
		// let toastID = toast.loading('Restoring note...')
		let req = await fetch(`/api/note/order/`, {
			method: 'POST',
			headers: { 'Content-type' : 'application/json' },
			body: JSON.stringify(body)
		})
		let res = await req.json()
		if(res.res == 'error'){
			return
		}
		
		let Editor = this.state.Editor.map(n => {
			if(n.id == res.note.id){
				return res.note
			}
			return n
		})

		this.setState({ ...this.state, Editor })
	}
	

	render() {
		return (
			<EditorContext.Provider value={this.state}>
				{this.props.children}
			</EditorContext.Provider>
		);
	}
}

export { EditorContext, EditorContextProvider };
