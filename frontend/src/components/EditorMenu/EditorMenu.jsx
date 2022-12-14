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

	render() {

		// console.log(this.state.settings)
		return (
			<div id="hks_custom_menu">

				{this.state.settings}
				<div className="selected_page" onClick={e => this.setState({...this.state, showAll: !this.state.showAll})}>
					{this.context?.selected?.name?.slice(0,23)} <IoMdArrowDropdown />
				</div>
				{this.state.showAll && <>
					<div id="pages_hider" onClick={e => this.setState({...this.state, showAll: !this.state.showAll})}></div>
					<div className="all_pages">
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
					</div>
				</>}
			</div>
		);
	}
}

export default EditorMenu;