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

class EditorContextProvider extends Component {
	constructor(props) {
		super(props);
		this.editor = {}

		this.state = {
			loading: true,
			saving: false,
			selected: {},
			pages: [],
			project: {},
			assets: [],
			customMenu: true,
			pid: Number(window.location.href.split('editor/')[1].split('/')[0]),
			editor: this.editor,
			
			loadTemplates: this.loadTemplates,
			loadPages: this.loadPages,
			loadPage: this.loadPage,
			savePage: this.savePage,
			useTemplate: this.useTemplate,
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

	useTemplate = async template => {
		let data = {}
		data.description = template.description
		data.headerScripts = template.headerScripts
		data.name = template.name
		data.title = template.title
		data.templateID = template.id

		let page = await this.savePage(data)

		await this.loadPage(page)
		return page
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
		data.name = data.name.toLowerCase()


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
		if(data.pid){
			document.title = res.data.title || res.data.name
		}
		return res.data
	}
	
	updateContent = async () => {
		
		this.setState({ ...this.state, loading: true })
		let page = this.state.selected

		page.css = this.editor.getCss();
		page.html = this.editor.getHtml().split('</body>')[0]+'</body>'
		page.js = this.editor.getJs()


		let content = this.editor.getProjectData()

		// Manage assets
		// let deleteAssetsIDs = []
		// let allAssetIDs = content.assets.map( asset => asset.id )

		delete content.assets
		page.content = JSON.stringify(content)
		page.projectID = page.projectID || this.state.pages[0].projectID

		let req = await fetch(`/api/page/update`, {
			method: 'POST',
			body: JSON.stringify({page}),
			headers: {
				'content-type': 'application/json',
				...getAuth()
			}
		})
		let res = await req.json()

		toast[(res.success ? 'success':'error')](res.message)
		page.content = content

		this.setState({ ...this.state, selected: page, loading: false })
		document.title = page.title || page.name
	}

	loadTemplates = async () => {

		let req = await fetch(`/api/templates`, {headers: getAuth()})
		let res = await req.json()
		return res.data
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
		this.setState({ ...this.state, pages: res.data.pages, selected, assets: res.data.assets, project: res.data.project, loading: false })
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

		this.editor.destroy()
		this.loadEditor('#editor')
		// this.editor.loadProjectData(selected.content)
		// this.editor.AssetManager.add(this.state.assets)
		// document.title = res.data.selected.title || res.data.selected.name

		this.setState({ ...this.state, selected, loading: false })

		if(selected.content && selected.content.styles){
			selected.content.assets = this.state.assets
			this.editor.loadProjectData(selected.content)
		}else{
			this.editor.Commands.run('core:canvas-clear')
		}
		document.title = res.data.title || res.data.name
		return res
	}

	createAsset = async (asset) => {
		let req = await fetch(`/api/asset/`, {
			headers: {
				...getAuth(),
				'content-type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({ pid: this.state.selected.id, asset })
		})
		let res = await req.json()
		asset.attributes.id = res.data.id

		let assets = this.editor.AssetManager.getAll().map(a => a.attributes)
		this.setState({...this.state, assets})
	}

	deleteAsset = async (asset) => {
		console.log(asset)
		let req = await fetch(`/api/asset/`, {
			headers: {
				...getAuth(),
				'content-type': 'application/json',
			},
			method: 'DELETE',
			body: JSON.stringify({ aid: asset.attributes.id })
		})
		let res = await req.json()
		let assets = this.editor.AssetManager.getAll().map(a => a.attributes)
		this.setState({...this.state, assets})
	}

	loadEditor = (container) => {
		this.editor = grapesjs.init({
			container,
			components: '<div class="txt-red">Hello world!</div>',
			style: '.txt-red{color: red}',
			plugins: [gsWebpage, gsTUI, gsBackground, gsFilter, gsGradient, gsFlexbox, gsTooltip, gsCustom, gsTab, gsSlider],
			// pluginsOpts: {
			// 	'grapesjs-plugin-export': { }
			// },
			// showOffsets: 1,
			canvas: {
                styles: ['https://fonts.googleapis.com/css2?family=Aclonica&family=Aguafina+Script&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Montserrat:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Nunito:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Oswald:wght@300;400;700&family=Poppins:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Raleway:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Whisper&display=swap'],
            },
			noticeOnUnload: 0,
			height: '100vh',
			fromElement: true,
			storageManager: { autoload: 0 },
			assetManager: {
				upload: '/api/image/upload',
				headers: getAuth(),
				multiUpload: false,
				dropzone: true,
				uploadName: 'image',
			},
			canvasCss: `
				.gjs-selected {
					outline: 3px solid #F0803C60 !important;
				}
			`,
		});
		this.setState({...this.state, editor: this.editor})

		let toastID = ''
		this.editor.on('asset:add', (asset) => {
			if(asset.attributes.id){
				return
			}
			this.createAsset(asset)
			
		})
		this.editor.on('asset:remove', (asset) => {
			this.deleteAsset(asset)
		})

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
				case 'preview': this.setState({...this.state, customMenu: false}); break;
				// Hide duplicates in style manager gjs-sm-sector
				case 'open-sm': hideDuplicates(); break;
				
			}
		});
		  
		this.editor.on('stop', commandId => {
			// console.log('Stop', commandId);
			
			switch(commandId){
				case 'preview': this.setState({...this.state, customMenu: true})
			}
		});

		this.editor.on('load', () => {
			let styleManager = this.editor.StyleManager;
			let fontProperty = styleManager.getProperty('typography', 'font-family');
			var list = [];
			fontProperty.set('list', list);
			// let fonts = ["Nunito","Roboto","Poppins","Montserrat","Oswald","Raleway","Whisper","Aclonica","Aguafina Script", "Lato"]
			list = [
				fontProperty.addOption({value: "sans-serif", name: 'sans-serif'}),
				fontProperty.addOption({value: "'Open Sans', sans-serif", name: 'Open Sans'}),

				fontProperty.addOption({value: "'Montserrat', sans-serif", name: 'Montserrat'}),
				fontProperty.addOption({value: "'Oswald', sans-serif", name: 'Oswald'}),
				fontProperty.addOption({value: "'Lato', sans-serif", name: 'Lato'}),
				fontProperty.addOption({value: "'Nunito', sans-serif", name: 'Nunito'}),
				fontProperty.addOption({value: "'Roboto', sans-serif", name: 'Roboto'}),
				fontProperty.addOption({value: "'Poppins', sans-serif", name: 'Poppins'}),
				fontProperty.addOption({value: "'Raleway', sans-serif", name: 'Raleway'}),
				fontProperty.addOption({value: "'Whisper', sans-serif", name: 'Whisper'}),
				fontProperty.addOption({value: "'Aclonica', sans-serif", name: 'Aclonica'}),
				fontProperty.addOption({value: "'Aguafina Script', sans-serif", name: 'Aguafina Script'}),
			];
			fontProperty.set('list', list);
			styleManager.render();
		});


		var pn = this.editor.Panels;
		/* var modal = this.editor.Modal;
		var cmdm = this.editor.Commands; */

		
		// Remove duplicates from the Style Manager Panel
		let hideDuplicates = () => {
			let sm_panel_btns = document.querySelectorAll('.gjs-sm-sector')
			let options = []
			// console.log(sm_panel)
			sm_panel_btns.forEach(btn => {
				let text = btn.querySelector('.gjs-sm-sector-title .gjs-sm-sector-label')?.innerText
				if( !btn.classList.contains('hidden') && options.includes(text) ){
					btn.classList.add('hidden')
					// console.log('hiding '+text)
				}else{
					options.push(text)
				}
			})

			pn.removeButton('options', 'sw-visibility')
			pn.removeButton('options', 'undo')
			pn.removeButton('options', 'redo')
			pn.removeButton('options', 'gjs-open-import-webpage')
			pn.removeButton('options', 'canvas-clear')

		}

		// Add options buttons from panel [for changing position and icons]
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn dripicons-article',
			id: 'border_elements',
			command: 'sw-visibility',
			attributes: { 'data-tooltip': "Bordered Components", 'data-tooltip-pos': "bottom" },
			active: false,
		})

		pn.addButton('devices-c', {
			className: 'gjs-pn-btn icon dripicons-media-shuffle',
			id: 'redo',
			command: 'core:redo',
			attributes: { 'data-tooltip': "Redo", 'data-tooltip-pos': "bottom" },
			active: false,
		})
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn icon dripicons-time-reverse',
			id: 'undo',
			command: 'core:undo',
			attributes: { 'data-tooltip': "Undo", 'data-tooltip-pos': "bottom"},
			active: false,
		})
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn dripicons-browser-upload',
			id: 'import',
			command: 'gjs-open-import-webpage',
			attributes: { 'data-tooltip': "Import", 'data-tooltip-pos': "bottom" },
			active: false,
		})
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn fa fa-eraser ',
			id: 'clear_all',
			command: 'canvas-clear',
			attributes: { 'data-tooltip': "Clear All", 'data-tooltip-pos': "bottom" },
			active: false,
		})
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn fa fa-save hks_save_btn',
			id: 'save_page',
			command: this.updateContent,
			attributes: { 'data-tooltip': "Save", 'data-tooltip-pos': "bottom" },
			active: false,
		})
		pn.addButton('devices-c', {
			className: 'gjs-pn-btn fa fa-external-link  hks_preview_btn',
			id: 'preview_external',
			command: (e)=>{ window.open( `http://${this.state.project.isSubDomain ? this.state.project.domainName+'.simplewebsitenow.com' : this.state.project.domainName }/${this.state.selected.name}.html` ) },
			attributes: { 'data-tooltip': "Preview", 'data-tooltip-pos': "bottom" },
			active: false,
		})
		pn.addButton('options', {
			className: 'gjs-pn-btn dripicons-home hks_home_btn',
			id: 'go_home',
			command: (e)=>{ window.location.href = window.location.origin + '/dashboard' },
			attributes: { 'data-tooltip': "Home", 'data-tooltip-pos': "bottom" },
			active: false,
		})


		// Add and beautify tooltips
		let titles = {
			'options': [['preview', 'Preview'], ['fullscreen', 'Fullscreen'], ['export-template', 'Export Code']],
			'views': [['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']],
			'devices-c': [['set-device-desktop', 'Desktop View'], ['set-device-tablet', 'Tablet View'], ['set-device-mobile', 'Mobile View']]
		}

		for(let key in titles){
			titles[key].forEach(function(item) {
				pn.getButton(key, item[0]).set('attributes', {title: item[1], 'data-tooltip': item[1], 'data-tooltip-pos': 'bottom'});
			});
		}

		window.editor = this.editor
	}



	deletePage = async (page) => {
		
		let toastID = toast.loading('Deleting page...')
		let req = await fetch(`/api/page/${page.id}`, {
			method: 'DELETE',
			headers: getAuth()
		})
		let res = await req.json()

		let pages = this.state.pages.filter(p => p.id !== page.id)
		this.setState({ ...this.state,  pages})
		let p = await this.loadPage(this.state.pages[0])
		toast.update(toastID, {...toastOptions, render: res.message, type: res.success ? 'success' : 'error' })
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