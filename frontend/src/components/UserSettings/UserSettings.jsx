import { Component } from 'react';

import { EditorContext } from 'contexts/EditorContext';
import './UserSettings.scss';
import { AiFillCloseCircle } from 'react-icons/ai';
import { MdOutlineDeleteForever, MdOutlineRestorePage } from 'react-icons/md';


export default class UserSettings extends Component {
	static contextType = EditorContext;

	constructor(props){
		super(props)

		this.themes = [
			{ id:"dark", label:"Dark" },
			{ id:"light", label:"Light" },
			{ id:"coffee", label:"Coffee" },
			{ id:"violet", label:"Violet" },
			{ id:"squid", label:"Squid" },
			{ id:"aliceblue", label:"Alice Blue" },
			{ id:"charcoal", label:"Charcoal" }
		];

		this.codeBlockThemes = [
			{ id:"default", label:"Default" },
			{ id:"dark", label:"Dark" },
			{ id:"coy", label:"Coy" },
			{ id:"funky", label:"Funky" },
			{ id:"okaidia", label:"Okaidia" },
			{ id:"twilight", label:"Twilight" },
			{ id:"tomorrow", label:"Tomorrow" },
			{ id:"solarizedlight", label:"Solarized Light" }
		]

		this.languages = ["abap","abnf","actionscript","ada","adoc","agda","al","antlr4","apacheconf","apex","apl","applescript","aql","arduino","arff","asciidoc","asm6502","aspnet","atom","autohotkey","autoit","bash","basic","batch","bbcode","birb","bison","bnf","brainfuck","brightscript","bro","bsl","c","cil","clike","clojure","cmake","coffee","coffeescript","conc","concurnas","context","cpp","crystal","cs","csharp","csp","css","cypher","d","dart","dataweave","dax","dhall","diff","django","dns-zone","dns-zone-file","docker","dockerfile","dotnet","ebnf","editorconfig","eiffel","ejs","elisp","elixir","elm","emacs","emacs-lisp","erb","erlang","eta","etlua","excel-formula","factor","firestore-security-rules","flow","fortran","fsharp","ftl","g4","gamemakerlanguage","gcode","gdscript","gedcom","gherkin","git","gitignore","glsl","gml","go","graphql","groovy","haml","handlebars","haskell","haxe","hbs","hcl","hgignore","hlsl","hpkp","hs","hsts","html","http","ichigojam","icon","iecst","ignore","inform7","ini","ino","io","j","java","javadoc","javadoclike","javascript","javastacktrace","jinja2","jolie","jq","js","jsdoc","json","json5","jsonp","jsstacktrace","jsx","julia","keyman","kotlin","kt","kts","latex","latte","less","lilypond","liquid","lisp","livescript","llvm","lolcode","lua","ly","makefile","markdown","markup","markup-templating","mathml","matlab","md","mel","mizar","mongodb","monkey","moon","moonscript","mscript","mustache","n1ql","n4js","n4jsd","nand2tetris-hdl","nani","naniscript","nasm","neon","nginx","nim","nix","npmignore","nsis","objc","objectivec","objectpascal","ocaml","opencl","oscript","oz","parigp","parser","pascal","pascaligo","pbfasm","pcaxis","pcode","peoplecode","perl","php","phpdoc","plaintext","plsql","powerquery","powershell","pq","processing","prolog","promql","properties","protobuf","pug","puppet","pure","purebasic","purescript","purs","px","py","python","q","qml","qore","r","racket","rb","rbnf","reason","regex","renpy","rest","rip","rkt","roboconf","robot","robotframework","rpy","rq","rss","ruby","rust","sas","sass","scala","scheme","scss","sh-session","shell","shell-session","shellsession","shortcode","sln","smali","smalltalk","smarty","sml","smlnj","sol","solidity","solution-file","soy","sparql","splunk-spl","sqf","sql","ssml","stan","stylus","svg","swift","t4","t4-cs","t4-templating","t4-vb","tap","tcl","tex","textile","toml","trig","ts","tsconfig","tsx","tt2","turtle","twig","typescript","typoscript","uc","unrealscript","uscript","vala","vb","vba","vbnet","velocity","verilog","vhdl","vim","visual-basic","warpscript","wasm","webmanifest","wiki","xeora","xeoracube","xls","xlsx","xml","xojo","xquery","yaml","yang","yml","zig"]
	}

	handleSubmit = e => {
		e.preventDefault()
		// console.log(e)
		let data = { name: '', theme: '', lang: '', cbTheme: '' }
		Object.keys(data).forEach(key => {
			data[key] = e.target[key].value
		})

		this.props.userContext.updateSettings(data)
	}
	render() {

		return (
			<div id="settings-popup-container-main">
				<div className="hiding_layout" onClick={this.props.hide}></div>
				<div className="poopup_main_content">
					<button onClick={this.props.hide} className="close_cross_btn"><AiFillCloseCircle/></button>
					<div className="settings_popup_inner">
						<h2>User Settings</h2>
						<form onSubmit={this.handleSubmit} className="userinfo_form">
							<label>
								<span>Full Name</span>
								<input type="text" name="name" placeholder="First Name" maxLength={25} defaultValue={this.props.userContext.user.name} autoComplete="off"/>
							</label>
							<label>
								<span>Username</span>
								<input type="text" name="username" placeholder="Username" value={this.props.userContext.user.username} disabled/>
							</label>
							<label>
								<span>Theme</span>
								<select name="theme" defaultValue={this.props.userContext.user.theme}>
									{this.themes.map(theme => <option value={theme.id} key={theme.id}>{theme.label}</option>)}
								</select>
							</label>
							<label>
								<span>Email</span>
								<input type="text" name="email" placeholder="Email" value={this.props.userContext.user.email} disabled/>
							</label>
							<label>
								<span>Default Coding Language</span>
								<select name="lang" defaultValue={this.props.userContext.user.defaultCodingLang}>
									{this.languages.map(lang => <option value={lang} key={lang}>{lang}</option>)}
								</select>
							</label>
							<label>
								<span>CodeBlock Theme</span>
								<select name="cbTheme" defaultValue={this.props.userContext.user.codeBlockTheme}>
									{this.codeBlockThemes.map(theme => <option value={theme.id} key={theme.id}>{theme.label}</option>)}
								</select>
							</label>
							<div></div>
							<button>Save</button>
						</form>
						<br /><br />
						<h2>Deleted Notes</h2>
						<div className="recycle_bin">
							{this.context.recyclebin.length == 0 && <div className="no_note_in_recyclebin">
								No note in recyclebin.
								</div>}
							{this.context.recyclebin.map((note, index) => {
								return(
									<div className="deleted_note" key={index}>
										<span>{note.title}</span>
										<div className="note_options">
											<MdOutlineRestorePage color="green"  onClick={e => this.context.restoreNote(note)}/>
											<MdOutlineDeleteForever color="red"  onClick={e => this.context.deleteNotePermanently(note)}/>
										</div>
									</div> 
								)
							})}
						</div>
					</div>
				</div>
			</div>

		);
	}
}