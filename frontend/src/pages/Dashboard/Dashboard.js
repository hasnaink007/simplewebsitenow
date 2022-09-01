import { Component } from 'react';
import { UserContext } from 'contexts/UserContext';
import { EditorContext } from 'contexts/EditorContext';
import Wrapper from 'pages/Wrapper';
import UserSettings from 'components/UserSettings/UserSettings';

// import EmailEditor from 'react-email-editor'

import './Dashboard.scss';


export default class Editor extends Component {
	static contextType = UserContext;
	render(){
		document.title = "Projects"
		return <EditorComponent userContext={this.context} />
	}
}
class EditorComponent extends Component {
	static contextType = EditorContext;
	
	constructor(props) {
		super(props)
		this.state = {
			saving: '',
			showSettings: false,
		}
	}

	componentDidMount(){
		// Load projects or stuff
	}

	handleChange = (e) => {
		this.context.handleChange()
	}
	
	logout = () => {
		this.props.userContext.logUserOut()
    }
	
	settings = () => {
		this.setState({...this.state, showSettings: true})    
    }

	hideSttings = () => {
		this.setState({...this.state, showSharePopup: false, showSettings: false})
	}

	render() {
		return (
			<Wrapper>
				<div className="dashboard">
					{this.state.showSettings && <UserSettings hide={this.hideSttings} userContext={this.props.userContext} />}
					
					<h1>Projects</h1>

					{/* Projects go here */}
				</div>
			</Wrapper>
		)
	}
}