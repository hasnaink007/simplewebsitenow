import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { toastOptions } from 'src/utils/toast';
import { getAuth } from 'utils/util';

const ProjectContext = React.createContext();

class ProjectContextProvider extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			saving: false,
			projects: [],
			filter: '',
			
			loadProjects: this.loadProjects,
			updateSettings: this.updateSettings,
			deleteProject: this.deleteProject,
			chackDomainAvailability: this.chackDomainAvailability,
			saveProject: this.saveProject,
			createProject: this.createProject,
		}
	}

	componentDidMount(){
		this.loadProjects()
	}

	api_error  = () => {
		if( window.confirm('There were some error loading this page. Please refresh') ){
			window.location.reload()
		}
	}

	loadProjects = async () => {
		let req = await fetch(`/api/projects`, {headers: getAuth()})
		let res = await req.json()
		if(!res.success){
			toast.error('Error loading projects data')
			return
		}
		let projects = res.data.map(p => {
			return p;
		})
		this.setState({ ...this.state, projects, loading: false })
	}

	updateSettings = async (pid, data) => {

		this.setState({ ...this.state, loading: true })
		let req = await fetch(`/api/project/save`, {
			headers: {
				'content-type': 'application/json',
				...getAuth()
			},
			method: 'POST',
			body: JSON.stringify({ pid, ...data })
		})
		let res = await req.json()
		if(!res.success){
			toast.error(res.message)
			return
		}
		toast.success(res.message)
	}

	chackDomainAvailability = async (domain) => {

		let req = await fetch(`/api/project/chackavailbility`, {
			headers: {
				'content-type': 'application/json',
				...getAuth()
			},
			method: 'POST',
			body: JSON.stringify({ domain })
		})
		let res = await req.json()
		return res;
	}

	deleteProject = async () => {
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
	

	render() {
		return (
			<ProjectContext.Provider value={this.state}>
				{this.props.children}
			</ProjectContext.Provider>
		);
	}
}

export { ProjectContext, ProjectContextProvider };
