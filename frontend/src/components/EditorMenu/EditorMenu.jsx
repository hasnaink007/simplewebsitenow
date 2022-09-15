import { Component } from 'react';
import { EditorContext } from 'contexts/EditorContext';
import {IoMdArrowDropdown} from 'react-icons/io';
import {AiOutlineEdit} from 'react-icons/ai';
import {BiRename} from 'react-icons/bi';
import PageSettings from 'components/PageSettings/PageSettings';
import './EditorMenu.scss';

class EditorMenu extends Component {
	static contextType = EditorContext;

	constructor(props){
		super(props)

		this.state = {
			selected: this?.context?.selected,
			showAll: false,
			settings: <></>
		}
	}

	showSettings = (page) => {
		this.setState({...this.state, showAll: false, settings: <PageSettings page={page} hide={this.hideSettings}/>})
	}
	hideSettings = () => {
		this.setState({...this.state, settings: <></>})
	}
	changePage = (page, e) => {
		// console.log(this.context)
		
		this.setState({...this.state, showAll: false})
		this.context.loadPage(page)
		
		if(e.target.classList.contains('edit')){
			this.showSettings(page)
			return
		}
	}

	previewPage = () => {
		window.open( `http://${this.context.project.isSubDomain ? this.context.project.domainName+'.simplewebsitenow.com' : this.context.project.domainName }/${this.context.selected.name}.html` )
	}

	render() {

		// console.log(this.state.settings)
		return (
			<div id="hks_custom_menu">

				{this.state.settings}
				<div className="selected_page" onClick={e => this.setState({...this.state, showAll: !this.state.showAll})}>
					{this.context?.selected?.name?.slice(0,30)} <IoMdArrowDropdown />
				</div>
				<span className="gjs-pn-btn fa fa-save hks_save_btn" data-tooltip="Save" data-tooltip-pos="bottom" onClick={this.context.updateContent}></span>
				<span className="gjs-pn-btn fa fa-external-link  hks_preview_btn" data-tooltip="Preview" data-tooltip-pos="bottom" onClick={this.previewPage}></span>
				{/* <span className="gjs-pn-btn hks_save_btn" data-tooltip="Rename page" data-tooltip-pos="bottom" onClick={this.context.renamePage}>
					<BiRename/>
				</span> */}
				<div className="all_pages">
					{this.state.showAll && <>
						{this.context.pages.map((page) => {
							return(
								<div className={`page_entry ${page.id==this.context.selected.id ? 'selected_page':''}`} key={page.id} onClick={e => this.changePage(page, e)}>
									{page.name} {page.type=='index' && <strong><small>(index)</small></strong>}
									<span className="edit_page"><AiOutlineEdit className="edit"/></span>
								</div>
							)
						})}
						<div className='page_entry' onClick={e => this.showSettings({})}>
							<strong>Add new page</strong>
						</div>
					</>}
				</div>
			</div>
		);
	}
}

export default EditorMenu;