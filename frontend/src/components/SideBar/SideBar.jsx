import { Component } from 'react';
import { Link } from 'react-router-dom';
import { MdEditNote } from 'react-icons/md';

import logo from 'assets/logo.png';

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

		return (
			<>
				<div className="sidebar_container">
					<div className="sidebar_content">
						<div className="logo_container">
							<Link to="/about"><img src={logo} /></Link>
						</div>
						<nav className="sidebar_nav">
							<div className="sidebar_pages_links">
								



							<Link to={`/dashboard`} >Projects</Link>
							<Link to={`/dashboard`} >About Us</Link>
							<Link to={`/dashboard`} >Settings</Link>
							<Link to={`/dashboard`} >Logout</Link>



							</div>
						</nav>
					</div>
				</div>
			</>

		);
	}
}

export default SideBar;