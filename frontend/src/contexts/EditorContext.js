import React, { Component } from 'react';

import { toast } from 'react-toastify';
import { toastOptions } from 'src/utils/toast';
import { getAuth } from 'utils/util';

import grapesjs from 'grapesjs';
import gsWebpage from 'grapesjs-preset-webpage';
import gsCustom from 'grapesjs-custom-code';
import gsTab from 'grapesjs-tabs';
import 'grapesjs/dist/css/grapes.min.css';
import 'utils/tooltip.scss';

//other plugins
import gsTUI from 'grapesjs-tui-image-editor';
import gsGradient from 'grapesjs-style-gradient';
import gsFilter from 'grapesjs-style-filter';
import gsBackground from 'grapesjs-style-bg';
import gsFlexbox from 'grapesjs-blocks-flexbox';
import gsSlider from 'grapesjs-lory-slider';
import gsTooltip from 'grapesjs-tooltip';

const EditorContext = React.createContext();


const menuBtns = [
	['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
	['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
	['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']
];

class EditorContextProvider extends Component {
	constructor(props) {
		super(props);
		this.editor = {}

		this.state = {
			loading: true,
			saving: false,
			selected: {},
			pages: [],
			assets: [],
			customMenu: true,
			pid: Number(window.location.href.split('editor/')[1].split('/')[0]),
			editor: this.editor,
			
			loadPages: this.loadPages,
			loadPage: this.loadPage,
			savePage: this.savePage,
			updateContent: this.updateContent,
			// renamePage: this.renamePage,
			loadEditor: this.loadEditor,
			deletePage: this.deletePage,
			// createPage: this.createPage,
		}
	}

	componentDidMount(){
		if(!this.state.pid){
			return
		}
		this.loadPages()
	}

	api_error  = () => {
		if( window.confirm('There were some error loading this page. Please refresh') ){
			window.location.reload()
		}
	}

	savePage = async (data) => {
		
		this.setState({ ...this.state, loading: true })
		let toastID = toast.loading('Processing...')
		data.projectID = this.state.pages[0].projectID

		// Increment pagename if already exists
		let counter = 0;
		this.state.pages.forEach( page => {
			
			if( page.name == data.name && page.id !== data.pid){
				counter++
			}

			if(page.id !== data.pid && page.name.split(data.name)[0] == '' && Number( page.name.split(data.name)[1]?.replaceAll('_', '') ) >= counter ){
				counter = Number( page.name.split(data.name)[1].replaceAll('_', '') ) + 1
			}
			
			return page
		})
		if(counter > 0){
			if( this.state.pages.map(p => p.name).includes(data.name) ){
				data.name = data.name + '_' + counter
			}
			counter = 0
		}


		let req = await fetch(`/api/page/save`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'content-type': 'application/json',
				...getAuth()
			}
		})
		let res = await req.json()

		if(!res.success){
			toast.update(toastID, {...toastOptions, type:'error', render: res.message})
			this.setState({...this.state, loading: false})
			return
		}
		let pages  = this.state.pages.map(p => {
			if(data.pid == p.id){
				delete res.data.content
				return res.data
			}else{
				return p
			}
		})
		if(!data.pid){
			delete res.data.content
			pages.push(res.data)
		}
		let selected = this.state.selected
		if( selected.id == data.pid ){
			selected.name = res.data.name
			selected.title = res.data.title
			selected.description = res.data.description
			selected.headerScripts = res.data.headerScripts
		}

		toast.update(toastID, {...toastOptions, type:'success', render: res.message})
		this.setState({ ...this.state, selected, pages, loading: false })

		document.title = res.data.title || res.data.name
	}
	
	updateContent = async () => {
		
		this.setState({ ...this.state, loading: true })
		let page = this.state.selected

		page.css = this.editor.getCss();
		page.html = this.editor.getHtml().split('</body>')[0]+'</body>'
		page.js = this.editor.getJs()


		let content = this.editor.getProjectData()

		// Manage assets
		let deleteAssetsIDs = []
		let newAssets = content.assets.filter( asset => !asset.id )
		let allAssetIDs = content.assets.map( asset => asset.id )
		
		this.state.assets.forEach(asset => {
			if(!allAssetIDs.includes(asset.id)){
				deleteAssetsIDs.push(asset.id)
			}
		})


		delete content.assets
		page.content = JSON.stringify(content)
		page.projectID = page.projectID || this.state.pages[0].projectID

		let req = await fetch(`/api/page/update`, {
			method: 'POST',
			body: JSON.stringify({page, newAssets, deleteAssetsIDs}),
			headers: {
				'content-type': 'application/json',
				...getAuth()
			}
		})
		let res = await req.json()

		toast[(res.success ? 'success':'error')](res.message)
		page.content = content
		// update assets
		let assets = this.state.assets.filter(asset => !deleteAssetsIDs.includes(asset.id))
		assets = [...assets, ...res.data.assets]
		this.editor.AssetManager.clear()
		this.editor.AssetManager.add(assets)
		this.setState({ ...this.state, selected: page, assets, loading: false })
		document.title = page.title || page.name
	}

	loadPages = async () => {

		this.setState({ ...this.state, loading: true })
		let req = await fetch(`/api/pages/${this.state.pid}`, {headers: getAuth()})
		let res = await req.json()
		if(!res.success){
			window.history.pushState({}, '', '/')
			return
		}
		let selected = res.data.selected || {}
		
		try{
			selected.content = JSON.parse(res.data.selected.content)
		}catch(e){
			console.log(e)
			alert('Error loading page data')
		}
		this.setState({ ...this.state, pages: res.data.pages, selected, assets: res.data.assets, loading: false })
		this.editor.loadProjectData(selected.content)
		this.editor.AssetManager.add(this.state.assets)
		document.title = res.data.selected.title || res.data.selected.name
	}

	loadPage = async (page) => {
		
		if(page.id == this.state.selected.id){
			// console.log('on current page')
			return page
		}

		this.setState({ ...this.state, loading: true })
		let req = await fetch(`/api/page/${page.id}`, {headers: getAuth()})
		let res = await req.json()

		if(!res.success){
			alert(res.message)
		}
		let selected = res.data
		
		try{
			selected.content = JSON.parse(res.data.content || '{}')
		}catch(e){
			console.log(e)
			alert('Error loading page data')
		}

		this.setState({ ...this.state, selected, loading: false })
		if(res.data.content && selected.content.styles){
			selected.content.assets = this.state.assets
			this.editor.loadProjectData(selected.content)
		}else{
			this.editor.Commands.run('core:canvas-clear')
		}
		document.title = res.data.title || res.data.name
		return res
	}

	loadEditor = (container) => {
		this.editor = grapesjs.init({
			container,
			components: '<div class="txt-red">Hello world!</div>',
			style: '.txt-red{color: red}',
			plugins: [gsCustom, gsTab, gsWebpage, gsTUI, gsBackground, gsFilter, gsGradient, gsFlexbox, gsSlider, gsTooltip],
			// pluginsOpts: {
			// 	'grapesjs-plugin-export': { }
			// },
			showOffsets: 1,
			noticeOnUnload: 0,
			height: '100vh',
			fromElement: true,
			storageManager: { autoload: 0 },
			assetManager: {
				// Upload endpoint, set `false` to disable upload, default `false`
				upload: '/api/image/upload',
				headers: getAuth(),
				multiUpload: false,
				// assets: this.state.assets,
			
				// The name used in POST to pass uploaded files, default: `'files'`
				uploadName: 'image',
			}
		});
		this.setState({...this.state, editor: this.editor})

		let toastID = ''
		this.editor.on('asset:upload:start', () => {
			// console.log('starting upload')
			toastID = toast.loading('Uploading image...')
		});
		  
		// The upload is ended (completed or not)
		this.editor.on('asset:upload:end', () => {
			// console.log('ending upload')
			toast.update(toastID,{...toastOptions, type:'success', render: 'Image uploaded.'})
		});
		
		// Error handling
		this.editor.on('asset:upload:error', () => {
			toast.update(toastID,{...toastOptions, type:'error', render: 'Error uploading image.'})
		});
		  
		// Do something on response
		this.editor.on('asset:upload:response', (response) => {
			// console.log('upload response', {response})
		});


		this.editor.on('run', (commandId) => {
			// console.log('Run', commandId);
			switch(commandId){
				case 'preview': this.setState({...this.state, customMenu: false})
			}
		  });
		  
		this.editor.on('stop', commandId => {
			// console.log('Stop', commandId);

			switch(commandId){
				case 'preview': this.setState({...this.state, customMenu: true})
			}
		  });

		var pn = this.editor.Panels;
		/* var modal = this.editor.Modal;
		var cmdm = this.editor.Commands; */

		// Add and beautify tooltips
		menuBtns.forEach(function(item) {
			pn.getButton('options', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
		});
		[['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
		.forEach(function(item) {
			pn.getButton('views', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
		});
		var titles = document.querySelectorAll('*[title]');

		for (var i = 0; i < titles.length; i++) {
			var el = titles[i];
			var title = el.getAttribute('title');
			title = title ? title.trim(): '';
			if(!title)
			break;
			el.setAttribute('data-tooltip', title);
			el.setAttribute('title', '');
		}

		window.editor = this.editor
	}



	deletePage = async () => {
		// Modifications required
		/* let toastID = toast.loading('Deleting note...')
		let req = await fetch(`/api/note/${this.state.page.id}`, {
			method: 'DELETE',
		})
		let res = await req.json()
		let page = this.state.pages.filter(n => n.id !== this.state.page.id)
		let recyclebin = [...this.state.recyclebin, this.state.selectedNote]
		this.setState({ ...this.state, Editor, recyclebin, selectedNote: {} })
		window.history.pushState({}, '', `/dashboard/`)
		toast.update(toastID, {...toastOptions, render: 'Moved to recycle bin', type: 'success' })*/
	}
	

	render() {
		return (
			<EditorContext.Provider value={this.state}>
				{this.props.children}
			</EditorContext.Provider>
		);
	}
}

export { EditorContext, EditorContextProvider };