import { Component } from 'react';
import { UserContext } from 'contexts/UserContext';
import { EditorContext } from 'contexts/EditorContext';
import {createRoot} from 'react-dom/client';

import NotFound from 'pages/NotFound/NotFound'
import EditorMenu from 'components/EditorMenu/EditorMenu'

import './Editor.scss';
export default class Editor extends Component {
	static contextType = UserContext;
	render(){
		return <EditorComponent userContext={this.context} />
	}
}
class EditorComponent extends Component {
	static contextType = EditorContext;

	componentDidMount(){
		// Load editor
		if(!this.context.pid){
			return
		}
		this.context.loadEditor('#editor')
	}

	render() {

		if(!this.context.pid){
			return <NotFound/>
		}
		return (
			<>
				<EditorMenu/>
				<div id="editor"></div>
			</>
		)
	}
}