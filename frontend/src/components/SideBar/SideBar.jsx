import { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { MdEditNote } from 'react-icons/md';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import logo from 'assets/logo.png';

import FadingBalls from "react-cssfx-loading/lib/FadingBalls";
import { getURLParam } from 'utils/util';
import { EditorContext } from 'contexts/EditorContext';
import './SideBar.scss';


class SideBar extends Component {
	
	static contextType = EditorContext;

	constructor(props){
		super(props)
		this.state = {
			filterNotes: '',
			collapsed: false,
			noteBeingDragged: {},
			noteBeingDraggedOver: {}
		}
	}

	componentDidMount(){
		// if anything to do?
	}

	render() {
		const notes = this.context.Notes.filter(Note => (Note.content.includes(this.state.filterNotes) || Note.title.includes(this.state.filterNotes)));

		return (
			<>
				<div className={`sidebar_container ${this.state.collapsed ? 'collapsed': ''}`}>
					<div className={`sidebar_content ${this.state.collapsed ? 'collapsed': ''}`}>
						<div className="logo_container">
							<Link to="/about"><img src={logo} /></Link>
						</div>
						{this.context.loading?
							<div className="notes_preloader" >
								<FadingBalls /> 
								<div className="notes_preloader_text">Loading Notes...</div>
							</div>:
							<>
							<label className="notes_filter">
								<input type="text"  onInput={this.filterNotes} placeholder="Type to Search Notes..." />
							</label>
							<nav className="sidebar_nav">
								<div className="sidebar_pages_links">
									<Link to={`/dashboard/`} onClick={e => this.context.showNote({})}>
										<div>
											<MdEditNote />
											<span>Add Note</span>
										</div>
									</Link>
									{this.context.Notes?.length > 0 &&
									<div>
										{notes.map((note, index) => {
											if( this.context.filter && !(note.title.toLowerCase().includes(this.context.filter) || note.content.toLowerCase().includes(this.context.filter) ) ){
												return
											}
											if( note.parent ){
												return
											}
											return (
												<Fragment key={note.id}>
													{this.NoteLink(note)}
												</Fragment>
											)
										})}
									</div>}
								</div>
							</nav>
							</>}
						</div>

						{this.state.collapsed ? 
						<FaAngleRight className="collapse_sidebar_btn" onClick={this.collapseSidebar}/>
						:
						<FaAngleLeft className="collapse_sidebar_btn" onClick={this.collapseSidebar}/>}
				</div>
			</>

		);
	}

	dragStarted = (note)=> {
		this.setState({...this.state, noteBeingDragged: note})
	}

	dragEntered = (note)=> {
		if(note.id == this.state.noteBeingDragged.id || note.parent){
			this.setState({...this.state, noteBeingDraggedOver: {id: undefined}})
			return
		}
		this.setState({...this.state, noteBeingDraggedOver: note})
	}

	draggedForUngroup = () => {
		this.setState({ ...this.state, noteBeingDraggedOver: { id: 0 } })
	}

	dragEnd = (note, index) => {
		if( this.state.noteBeingDragged.parent == this.state.noteBeingDraggedOver.id ||
			this.state.noteBeingDraggedOver.id === undefined ){
			this.setState({
				...this.state,
				noteBeingDragged: {},
				noteBeingDraggedOver: {}
			})
			// console.log(this.state.noteBeingDragged, this.state.noteBeingDraggedOver)
			return
		}
		let data = {
			noteID: this.state.noteBeingDragged.id,
			parentID: this.state.noteBeingDraggedOver.id,
			oldParentID: this.state.noteBeingDragged.parent
		}
		if(this.state.noteBeingDragged && this.state.noteBeingDraggedOver){
			// console.log(data)
			this.context.orderNote(data)
		}
		this.setState({
			...this.state,
			noteBeingDragged: {},
			noteBeingDraggedOver: {}
		})
	}

	dragLeaved = (note) => {
		if(note.id == this.state.noteBeingDragged.id){
			return
		}
		this.setState({...this.state, noteBeingDraggedOver: {}})
	}
}

export default SideBar;