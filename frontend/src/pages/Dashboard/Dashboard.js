import { Component } from 'react';
import {toast} from 'react-toastify';

import {BiEdit} from 'react-icons/bi';
import {RiDeleteBin3Line} from 'react-icons/ri';
import {GoRepoClone} from 'react-icons/go';
import {MdPreview} from 'react-icons/md';
import {FiShare2} from 'react-icons/fi';
import {BsThreeDotsVertical} from 'react-icons/bs';

import { UserContext } from 'contexts/UserContext';
import { ProjectContext } from 'contexts/ProjectContext';
import Wrapper from 'pages/Wrapper';
import ProjectSettings from 'components/ProjectSettings/ProjectSettings';
import ProjectClone from 'components/ProjectClone/ProjectClone';
import DeleteProject from 'components/DeleteProject/DeleteProject';

// import EmailEditor from 'react-email-editor'

import './Dashboard.scss';
import { Link } from 'react-router-dom';


export default class Editor extends Component {
	static contextType = UserContext;
	render(){
		document.title = "Projects"
		return <EditorComponent userContext={this.context} />
	}
}
class EditorComponent extends Component {
	static contextType = ProjectContext;
	
	constructor(props) {
		super(props)
		this.state = {
			saving: '',
			popup: <></>,
		}
	}

	componentDidMount(){
		// Load projects or stuff
	}

	handleChange = (e) => {
		this.context.handleChange()
	}
	
	logout = () => {
		this.props.userContext.logUserOut()
    }
	
	settings = (project) => {
		this.setState({...this.state, popup: <ProjectSettings hide={this.hidePopup} project={project} />})    
    }

	cloneProject = (project) => {
		this.setState({...this.state, popup: <ProjectClone hide={this.hidePopup} project={project} />})    
    }
	
	confirmDelete = project => {
		this.setState({...this.state, popup: <DeleteProject hide={this.hidePopup} project={project} />})    
	}

	hidePopup = () => {
		this.setState({...this.state, popup: <></>})
	}

	openPreview = project => {
		if(project.isSubDomain){
			window.open('https://'+ project.domainName + '.simplewebsitenow.com')
		}else{
			window.open('https://'+ project.domainName)
		}
	}

	shareLink = (project) => {
		if(project.isSubDomain){
			navigator.clipboard.writeText('http://'+ project.domainName + '.simplewebsitenow.com')
		}else{
			navigator.clipboard.writeText('http://'+ project.domainName)
		}
		toast.success('URL copied!')
	}


	render() {
		return (
			<Wrapper>
				<div className="dashboard">
					{this.state.popup}
					
					<div className="dashboard_header">
						<h2>Projects <small>({this.context.projects.length})</small></h2>
						{/* <button onClick={e => this.settings({pages: []})}>Add Project</button> */}
					</div>
					
					<div className="dashboard_projects">
						{this.context.projects.map( (project, index) => {
							return(
								<div className="project_card" key={index}>
									<div className="project_preview">
										{/* <iframe src={project?.isSubDomain ? 'http://'+project?.domainName+'.simplewebsitenow.com' : project?.domainName}></iframe> */}
										<img src="data:image/jpeg;base64,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" />
										<div className="project_name">{project.name}</div>
									</div>
									<div className="p_card_footer">
										<Link  to={`/editor/${project.id}`}><BiEdit title="Edit"/></Link>
										<GoRepoClone title="Clone" onClick={e => this.cloneProject(project)}/>
										<RiDeleteBin3Line title="Delete" onClick={e => this.confirmDelete(project)}/>
										<MdPreview title="Preview" onClick={e => this.openPreview(project)}/>
										<FiShare2 title="Share"  onClick={e => this.shareLink(project)}/>
										<BsThreeDotsVertical title="Options" onClick={e => this.settings(project)}/>
									</div>
								</div>
							)
						})}
					</div>


					{/* Projects go here */}
				</div>
			</Wrapper>
		)
	}
}