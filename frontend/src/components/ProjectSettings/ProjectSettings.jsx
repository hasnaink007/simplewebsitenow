import { Component } from 'react';

import { ProjectContext } from 'contexts/ProjectContext';
import './ProjectSettings.scss';
import { AiFillCloseCircle } from 'react-icons/ai';

export default class ProjectSettings extends Component {
	static contextType = ProjectContext;

	constructor(props){
		super(props)
	}

	handleSubmit = e => {
		e.preventDefault()
		// console.log(e)
		let data = { name: '', description: '', domainName: '', indexPage: 0 }
		Object.keys(data).forEach(key => {
			data[key] = e.target[key].value
		})
		this.context.updateSettings(this.props.project.id, data)
	}
	render() {

		let index = this.props.project.pages.find(p => {return p.type=='index'})

		return (
			<div id="settings-popup-container-main">
				<div className="hiding_layout" onClick={this.props.hide}></div>
				<div className="poopup_main_content">
					<button onClick={this.props.hide} className="close_cross_btn"><AiFillCloseCircle/></button>
					<div className="settings_popup_inner">
						<h2>{this.props.project.id ? 'Edit' : 'Create'} project</h2>
						
						<form onSubmit={this.handleSubmit} className="projectinfo_form">
							<label>
								<span>Project Name</span>
								<input type="text" name="name" placeholder="Project name" maxLength={50} defaultValue={this.props.project.name} autoComplete="off" required/>
							</label>
							<label>
								<span>Description</span>
								<textarea type="text" name="description" placeholder="Project description" defaultValue={this.props.project.description} required/>
							</label>
							<label>
								<span>Domain Name</span>
								<input type="text" name="domainName" placeholder="Domain name" maxLength={50} defaultValue={this.props.project.domainName} autoComplete="off" required/>
							</label>
							<label>
								<span>Index Page</span>
								<select name="indexPage" defaultValue={index?.id} disabled={index?.id ? false : true}>
									{this.props.project.pages.map(p => <option value={p?.id} key={p?.id}>{p?.name}</option>)}
									{(!index?.id) && <option value={0}>index</option>}
								</select>
							</label>
							<div></div>
							<button>{this.props.project.id ? 'Save' : 'Create'}</button>
						</form>
						

					</div>
				</div>
			</div>

		);
	}
}