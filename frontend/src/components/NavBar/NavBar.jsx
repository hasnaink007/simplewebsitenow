import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlinePostAdd } from 'react-icons/md';
import { BiEdit } from 'react-icons/bi';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { AiOutlineLogout } from 'react-icons/ai';
import { NoteContext } from 'contexts/NoteContext';
// import { UsersContext } from 'contexts/Users';
import './NavBar.scss';

class NavBar extends Component {
	static contextType = NoteContext;

	notesFilter = e => {
		this.context.filterNotes(e.target.value.toLowerCase())
	}

	render() {
		let note = this.context.selectedNote

		return (
			<>
				<nav className="nav">

					<div className="left_content">
						<Link to={`/dashboard`} onClick={this.context.newNote}>
							<MdOutlinePostAdd />
							<span>New Note</span>
						</Link>

						{note.id && 
						<>
							<button className="edit_note" disabled={note.id ? false : true} onClick={this.context.editNote}>
								<BiEdit />
								<span>Edit Note</span>
							</button>
							
							<button className="edit_note" disabled={note.id ? false : true}  onClick={this.context.deleteNote}>
								<RiDeleteBin5Line />
								<span>Delete Note</span>
							</button>
						</>}
						<button className="logout_btn" onClick={this.props?.userContext?.logUserOut}>
							<AiOutlineLogout /> Logout
						</button>
					</div>
					
					<div className="right_content">
						<label className="notes_filter">
							<input type="text"  onInput={this.notesFilter} placeholder="Type to Search Notes..." />
						</label>
					</div>
				</nav>

			</>

		);
	}
}

export default NavBar;
