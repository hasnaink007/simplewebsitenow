import { Component } from 'react';
import { UserContext } from 'contexts/UserContext';
import { EditorContext } from 'contexts/EditorContext';



import grapesjs from 'grapesjs';

import gsWebpage from 'grapesjs-preset-webpage'
import gsCustom from 'grapesjs-custom-code';
import gsTab from 'grapesjs-tabs';
import gsForms from 'grapesjs-plugin-forms';
import gsFileStack from 'grapesjs-plugin-filestack';
import gsExport from 'grapesjs-plugin-export';
import gsNavbar from 'grapesjs-navbar';
import gsAviary from 'grapesjs-aviary';

import 'grapesjs/dist/css/grapes.min.css';


// import EmailEditor from 'react-email-editor'

import './Editor.scss';


export default class Editor extends Component {
	static contextType = UserContext;
	render(){
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
		this.editor = {}
	}

	componentDidMount(){
		// Load editor
		
		
		this.editor = grapesjs.init({
			container : '#editor',
			components: '<div class="txt-red">Hello world!</div>',
			style: '.txt-red{color: red}',
			plugins: [gsCustom, gsTab, gsWebpage],
			pluginsOpts: {
				'grapesjs-plugin-export': { }
			},
			richTextEditor: {
				// options
			},
			showOffsets: 1,
			noticeOnUnload: 0,
			height: '100vh',
			fromElement: true,
			storageManager: { autoload: 0 },
			styleManager : {
			  sectors: [{
				  name: 'General',
				  open: false,
				  buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
				},{
				  name: 'Flex',
				  open: false,
				  buildProps: ['flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self']
				},{
				  name: 'Dimension',
				  open: false,
				  buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
				},{
				  name: 'Typography',
				  open: false,
				  buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow'],
				},{
				  name: 'Decorations',
				  open: false,
				  buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
				},{
				  name: 'Extra',
				  open: false,
				  buildProps: ['transition', 'perspective', 'transform'],
				}
			  ],
			},

		});
		window.editor = this.editor
		console.log(this.editor)


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
			<>
				<div id="editor"></div>
			</>
		)
	}
}