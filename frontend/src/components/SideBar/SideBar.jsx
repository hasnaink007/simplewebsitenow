import { Component } from 'react';
import { Link } from 'react-router-dom';
import ProjectSettings from 'components/ProjectSettings/ProjectSettings';


import logo from 'assets/logo.png';

import { ProjectContext } from 'contexts/ProjectContext';
import './SideBar.scss';


class SideBar extends Component {
	
	static contextType = ProjectContext;

	constructor(props){
		super(props)
		this.state = {
			popup: <></>
		}
	}

	componentDidMount(){
		// if anything to do?
	}

	hidePopup = e => {
		this.setState({...this.state, popup: <></>})
	}

	addProject = e => {
		e.preventDefault()
		this.setState({...this.state, popup: <ProjectSettings hide={this.hidePopup} project={{pages: []}} />})    
	}

	render() {

		return (
			<>
				{this.state.popup}
				<div className="sidebar_container">
					<div className="sidebar_content">
						<div className="logo_container">
							<Link to="/about"><img src={logo} /></Link>
						</div>
						<nav className="sidebar_nav">
							<div className="sidebar_pages_links">



							<Link to='#' onClick={this.addProject}>Add Project</Link>
							<Link to={`/dashboard`} className={window.location.pathname.split('/')[1]=='dashboard'?'active':'' }>Projects</Link>
							{/* <Link to={`/dashboard`} >Payments</Link> */}
							<Link to={`/settings`} className={window.location.pathname.split('/')[1]=='settings'?'active':''} >Settings</Link>
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