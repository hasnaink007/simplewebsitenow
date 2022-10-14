import { Component } from 'react';

import { ProjectContext } from 'contexts/ProjectContext';
import './ProjectSettings.scss';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BiSearch, BiLoaderCircle } from 'react-icons/bi';
import { FiCheckCircle } from 'react-icons/fi';
import { BsExclamationCircleFill } from 'react-icons/bs';

export default class ProjectSettings extends Component {
	static contextType = ProjectContext;

	constructor(props){
		super(props)

		this.state = {
			isSubDomain: this.props.project.id ? this.props.project.isSubDomain : true,
			domainName: this.props.project.domainName,
			domainState: (!this.props.project.domainName ? 'check_availability' : 'selected'),
			message: <></>,
			searching: false
		}
	}

	handleSubmit = async e => {
		e.preventDefault()
		// console.log(e)
		let data = { name: '', description: '', domainName: '', indexPage: 0 }
		Object.keys(data).forEach(key => {
			data[key] = e.target[key].value
		})
		let update = await this.context.updateSettings(this.props.project.id, data)
		if(update){
			this.props.hide()
		}
	}

	searchDomain = async (e) => {
		e.preventDefault()
		this.setState({...this.state, searching: true})
		let res = await this.context.chackDomainAvailability(this.state.domainName)
		// this.setState({...this.state, searching: false})
		let message = <div style={{color: res.success ? '#07bc0c' : 'red', marginTop: '-15px', textAlign: 'right'}}><small><strong>http://{this.state.domainName}{this.state.isSubDomain ? '.simplewebsitenow.com': ''}</strong> is {res.success ? '': 'not'} available.</small></div>
		if(res.success){
			this.setState({...this.state, searching: false, message ,  domainState: 'selected'})
		}else{
			this.setState({...this.state, searching: false, message,  domainState: 'invalid'})
		}
	}

	isSubDomainToggle = e => {
		if(this.state.searching){

			return
		}
		let domainState = this.getDomainState(this.state.domainName, e.target.checked)
		this.setState({...this.state, isSubDomain: e.target.checked, domainState, message: <></>})
	}

	domainChange = e => {
		let domainName = e.target.value.replace(/[^a-zA-Z0-9\.\_]/ig, '').toLowerCase().substring(0,50).replaceAll('.simplewebsitenow.com', '')
		let domainState = this.getDomainState(e.target.value, this.state.isSubDomain)
		this.setState({...this.state, domainName, domainState, message: <></>})
	}

	getDomainState = (value, isSubDomain) => {
		let domainState = ''
		if(value != '' && value == this.props.project.domainName){
			domainState = 'selected'
		}

		if(value != '' && value != this.props.project.domainName){
			domainState = 'check_availability'
		}

		if(!isSubDomain){
			domainState = 'selected'
		}

		if(!isSubDomain && value?.length < 4){
			domainState = 'invalid'
		}

		if(value == '' || value?.length < 3){
			domainState = 'invalid'
		}
		return domainState
	}

	componentDidMount(){

		if(!this.props.project.id && this.context.templates.length < 1){
			this.context.loadSelectableTemplates()
		}
	}

	render() {

		let index = this.props.project.pages.find(p => {return p.type=='index'})
		let domainState = this.state.domainState

		let pages = this.props.project.id ? this.props.project.pages : this?.context?.templates;


		console.log(this.context)
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
							
							<div className="subdomain_option">
								<span>Domain Name</span>
								<label>
									Use sub domain?
									<input type="checkbox" name="sub_domain" defaultChecked={this.state.isSubDomain} onChange={this.isSubDomainToggle} disabled={this.state.searching} /> 
								</label>
							</div>
							{!this.state.isSubDomain && <small style={{color: '#777', userSelect: 'none'}}>Add an A record in your DNS manager pointing to <span style={{userSelect: 'all'}}>142.93.177.65</span></small>}
							
							<label className="dmn_search">
								<input type="text" name="domainName" placeholder={this.state.isSubDomain ? 'example.simplewebsitenow.com':'example.com'} disabled={this.state.searching} maxLength={50} value={this.state.domainName} autoComplete="off" onChange={this.domainChange} required/>
								<button className={"search_dmn " + domainState } type="button" disabled={domainState != 'check_availability' || this.state.searching} onClick={this.searchDomain}>

									{!this.state.searching && <>
										{(domainState == 'selected') && <FiCheckCircle />}
										{(domainState == 'check_availability') && <BiSearch />}
										{(domainState == 'invalid') && <BsExclamationCircleFill />}
									</>}

									{this.state.searching && <>
										<BiLoaderCircle className="loading" />
									</>}
									
								</button>
							</label>
							{this.state.message}

							<label>
								{this.props.project.id && <span>Index Page</span>}
								{!this.props.project.id &&
								<div style={{display: 'flex', justifyContent: 'space-between'}}>
									<span>Select homepage template</span>
									<a href="http://templates.simplewebsitenow.com/" target="_blank"><small>View all templates</small></a>
								</div>}
								<select name="indexPage" defaultValue={index?.id}>
									{pages?.map(p => <option value={p?.id} key={p?.id}>{p?.name}</option>)}
								</select>
							</label>
							<div></div>
							<button disabled={domainState != 'selected'}>{this.props.project.id ? 'Save' : 'Create'}</button>
						</form>
						

					</div>
				</div>
			</div>

		);
	}
}