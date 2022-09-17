import { Component } from 'react';

import { EditorContext } from 'contexts/EditorContext';
import './PageSettings.scss';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BsFillPatchCheckFill, BsFillEyeFill } from 'react-icons/bs';
import FadingDots from "react-cssfx-loading/lib/FadingDots";

export default class PageSettings extends Component {
	static contextType = EditorContext;

	constructor(props){
		super(props)

		this.state = {
			useTemplate: false,
			templates: [],
			loading: false,
			disabled: false,
		}
	}

	handleSubmit = async e => {
		e.preventDefault()
		
		let data = { name: '', title: '', description: '', headerScripts: '' }
		Object.keys(data).forEach(key => {
			data[key] = e.target[key].value
		})
		// data.title = data.title.replace(/[^a-zA-Z0-9 _\-\!\#\$\%\^\&\*]/ig, '').slice(0, 100)
		data.name = data.name.replace(/\s/ig, '_').replace(/[^a-zA-Z0-9_]/ig, '').slice(0, 50)
		data.pid = this.props.page.id
		this.setState({...this.state, disabled: true})
		await this.context.savePage(data)
		this.setState({...this.state, disabled: false})
		this.props.hide()
	}

	useTemplate = async () => {
		if(this.state.templates.length > 0){
			this.setState({...this.state, useTemplate: true, loading: false})
			return
		}
		this.setState({...this.state, useTemplate: true, loading: true})
		let templates = await this.context.loadTemplates()
		this.setState({...this.state, templates, loading: false})
		
	}

	dontUseTemplate = () => {
		this.setState({...this.state, useTemplate: false, loading: true})
	}

	preview = template => {
		window.open('http://templates.simplewebsitenow.com/'+template.name+'.html')
	}

	setTemplate = async template => {
		await this.context.useTemplate(template)
		this.props.hide()
		// console.log(template)
	}

	deletePage = async () => {
		this.setState({...this.state, disabled: true})
		await this.context.deletePage(this.props.page)
		this.setState({...this.state, disabled: false})
		this.props.hide()
	}

	render() {

		return (
			<div id="settings-popup-container-main">
				<div className="hiding_layout"></div>
				<div className="poopup_main_content">
					<button onClick={this.props.hide} className="close_cross_btn"><AiFillCloseCircle/></button>
					<div className="settings_popup_inner">
						
						{this.props.page.id && <h4>Edit page</h4>}
						
						{!this.props.page.id && <div className="page_settings page_tabs">

							<h4 className={!this.state.useTemplate ? "active" : ''} onClick={this.dontUseTemplate}>Create page</h4>
							<h4 className={this.state.useTemplate ? "active" : ''} onClick={this.useTemplate}>Use Template</h4>
						
						</div>}
						
						{!this.state.useTemplate && <form onSubmit={this.handleSubmit} className="pageinfo_form">
							<label>
								<span>Page Name</span>
								<input type="text" name="name" placeholder="Page name" maxLength={50} defaultValue={this.props.page.name} autoComplete="off" required/>
							</label>
							<label>
								<span>Page title</span>
								<input type="text" name="title" placeholder="Page title" maxLength={100} defaultValue={this.props.page.title} autoComplete="off" required/>
							</label>
							<label>
								<span>Description</span>
								<textarea type="text" name="description" placeholder="Page description" defaultValue={this.props.page.description}/>
							</label>
							<label>
								<span>Header scripts</span>
								<textarea type="text" name="headerScripts" placeholder="Header scripts" defaultValue={this.props.page.headerScripts}/>
							</label>
							<div></div>
							<div className="page_form_btns">
								{(this.props.page.id && this.props.page.type != 'index') && <button className="delete_button" type="button" onClick={this.deletePage} disabled={this.state.disabled}>Delete page</button>}
								<button  disabled={this.state.disabled}>{this.props.page.id ? 'Save' : 'Create'}</button>
							</div>
						</form>}

						
						{this.state.useTemplate && <div className="available_templates">

							{this.state.loading && <div className="pagePreloader"> <FadingDots width="50px" height="50px" color="#62d3f1" /></div>}
							
							{this.state.templates.length < 1 && <center>No templates available at the moment.</center>}

							{this.state.templates.map(template => {
								return(
									<div key={template.id} className="template_card">
										<span>{template.title}</span>
										<div>
											<button title="View template" onClick={e => this.preview(template)}><BsFillEyeFill /></button> &nbsp;
											<button title="Use template" onClick={e => this.setTemplate(template)}><BsFillPatchCheckFill /></button>
										</div>
									</div>
								)
							})}

						</div>}

						

					</div>
				</div>
			</div>

		);
	}
}