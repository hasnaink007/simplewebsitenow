import { Component } from 'react';
import SideBar from 'components/SideBar/SideBar';
import { UserContext } from 'contexts/UserContext';

export default class Wrapper extends Component {
	static contextType = UserContext;

	render(){
		return(
			<>
				<div className={`main_wrapper_container ${this.props.className}`}>
					<SideBar userContext={this.context} />
					<div className="right_content">
						{/* <NavBar userContext={this.context} /> */}
						<div className="content_container">
							{this.props.children}
						</div>
					</div>
				</div>
			</>
			)
	}
} 
