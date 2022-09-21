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
			templates: [],
			
			loadProjects: this.loadProjects,
			updateSettings: this.updateSettings,
			cloneProject: this.cloneProject,
			deleteProject: this.deleteProject,
			loadSelectableTemplates: this.loadSelectableTemplates,
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

	loadSelectableTemplates = async () => {

		let req = await fetch(`/api/templates`, {headers: getAuth()})
		let res = await req.json()
		this.setState({...this.state, templates: res.data})
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
			return false
		}
		let projects = this.state.projects
		if( pid ){
			projects = projects.map(p => {
				if( p.id == pid ){
					res.data.pages = p.pages
					return res.data
				}else{
					return p
				}
			})
		}else{
			res.data.pages = res.data.pages || []
			projects.push(res.data)
		}

		this.setState({...this.state, projects})
		toast.success(res.message)
		return true
	}
	
	cloneProject = async (data) => {

		this.setState({ ...this.state, loading: true })
		let req = await fetch(`/api/project/clone`, {
			headers: {
				'content-type': 'application/json',
				...getAuth()
			},
			method: 'POST',
			body: JSON.stringify(data)
		})
		let res = await req.json()
		if(!res.success){
			toast.error(res.message)
			return
		}
		let projects = this.state.projects
		projects.push(res.data)

		this.setState({...this.state, projects})
		toast.success(res.message)
	}
	
	deleteProject = async (id) => {
		let toastID = toast.loading('Deleting project and its assets...')

		this.setState({ ...this.state, loading: true })
		let req = await fetch(`/api/project/${id}`, {
			headers: {
				'content-type': 'application/json',
				...getAuth()
			},
			method: 'DELETE',
		})
		let res = await req.json()

		if(res.success){
			let projects = this.state.projects.filter(p => p.id != id)
			this.setState({...this.state, projects})
			toast.update(toastID, {...toastOptions, type: 'success', render: res.message })
		}else{
			toast.update(toastID, {...toastOptions, type: 'error', render: res.message })
		}
		return res
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

	render() {
		return (
			<ProjectContext.Provider value={this.state}>
				{this.props.children}
			</ProjectContext.Provider>
		);
	}
}

export { ProjectContext, ProjectContextProvider };
