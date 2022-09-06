import { Component } from 'react';

import { EditorContext } from 'contexts/EditorContext';
import './PageSettings.scss';
import { AiFillCloseCircle } from 'react-icons/ai';

export default class PageSettings extends Component {
	static contextType = EditorContext;

	constructor(props){
		super(props)
	}

	handleSubmit = async e => {
		e.preventDefault()
		// console.log(e)
		let data = { name: '', title: '', description: '', headerScripts: '' }
		Object.keys(data).forEach(key => {
			data[key] = e.target[key].value
		})
		// data.title = data.title.replace(/[^a-zA-Z0-9 _\-\!\#\$\%\^\&\*]/ig, '').slice(0, 100)
		data.name = data.name.replace(/\s/ig, '_').replace(/[^a-zA-Z0-9_]/ig, '').slice(0, 50)
		data.pid = this.props.page.id
		await this.context.savePage(data)
		this.props.hide()
	}
	render() {

		return (
			<div id="settings-popup-container-main">
				<div className="hiding_layout"></div>
				<div className="poopup_main_content">
					<button onClick={this.props.hide} className="close_cross_btn"><AiFillCloseCircle/></button>
					<div className="settings_popup_inner">
						<h2>{this.props.page.id ? 'Edit' : 'Create'} page</h2>
						
						<form onSubmit={this.handleSubmit} className="pageinfo_form">
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
							<button>{this.props.page.id ? 'Save' : 'Create'}</button>
						</form>
						

					</div>
				</div>
			</div>

		);
	}
}