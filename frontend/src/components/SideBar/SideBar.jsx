import { Component } from 'react';
import { Link } from 'react-router-dom';

import logo from 'assets/logo.png';

import { ProjectContext } from 'contexts/ProjectContext';
import './SideBar.scss';


class SideBar extends Component {
	
	static contextType = ProjectContext;

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
								



							<Link to={`/dashboard`} className={window.location.pathname.split('/')[1]=='dashboard'?'active':'' }>Projects</Link>
							<Link to={`/dashboard`} >Payments</Link>
							<Link to={`/dashboard`} >Settings</Link>
							<Link to={`/dashboard`} onClick={this.props.userContext.logUserOut}> Logout</Link>



							</div>
						</nav>
					</div>
				</div>
			</>

		);
	}
}

export default SideBar;