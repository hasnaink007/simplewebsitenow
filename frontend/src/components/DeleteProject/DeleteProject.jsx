import { Component } from 'react';

import { ProjectContext } from 'contexts/ProjectContext';
import './DeleteProject.scss';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BiSearch, BiLoaderCircle } from 'react-icons/bi';
import { FiCheckCircle } from 'react-icons/fi';
import { BsExclamationCircleFill } from 'react-icons/bs';

export default class DeleteProject extends Component {
	static contextType = ProjectContext;

	constructor(props){
		super(props)

		this.state = {
			disabled: true,
			disabledInput: false,
		}
	}

	delete = async e => {
		e.preventDefault()
		// console.log(e)
		this.setState({...this.state, disabled: true, disabledInput: true})
		await this.context.deleteProject(this.props.project.id)
		this.setState({...this.state, disabled: false, disabledInput: false})
		this.props.hide()
	}


	handleInput = e => {
		if(e.target.value == this.props.project.domainName){
			this.setState({...this.state, disabled: false})
		}else{
			this.setState({...this.state, disabled: true})
		}
	}

	render() {

		return (
			<div id="settings-popup-container-main">
				<div className="hiding_layout" onClick={this.props.hide}></div>
				<div className="poopup_main_content delete_project">
					<button onClick={this.props.hide} className="close_cross_btn"><AiFillCloseCircle/></button>
					<div className="settings_popup_inner">

						<h2>Delete project</h2>
						<div style={{color: '#666'}}>
							<p>Are you sure you want to delete this project?</p>
							<p style={{userSelect: 'none'}}>Type <strong>{this.props.project.domainName}</strong> below to delete the project</p>
						</div>
						<label>
							<input type="text" placeholder={this.props.project.domainName}  onChange={this.handleInput} disabled={this.state.disabledInput}/>
						</label>
						<button disabled={this.state.disabled} className="delete_button" onClick={this.delete}>Confirm Delete</button>

					</div>
				</div>
			</div>

		);
	}
}