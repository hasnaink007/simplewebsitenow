import { Component } from 'react';

import { UserContext } from 'contexts/UserContext';
import { FaSave, FaCheckCircle } from 'react-icons/fa';
import Wrapper from 'pages/Wrapper';

import './Settings.scss';

export default class Settings extends Component {
	static contextType = UserContext;
	
	constructor(props) {
		super(props)
		this.state = {
			saving: false,
			change_pass: false
		}
	}

	componentDidMount(){
		// Load projects or stuff
	}

	handleSubmit = async e => {
		e.preventDefault()
		let form = e.target
		let {full_name, password, old_password} = form
		full_name = full_name.value
		password = password.value
		old_password = old_password.value

		this.setState({...this.state, saving: true})
		let res = await this.context.updateSettings({name: full_name, password, old_password})
		this.setState({...this.state, saving: false})


		console.log({full_name, password, old_password})
	}

	change_pass = e => {
		this.setState({ ...this.state, change_pass: e.target.checked })
	}

	render() {
		return (
			<Wrapper>
				<div className="settings">
					{this.state.popup}
					
					<div className="settings_header">
						<h2>Profile</h2>
					</div>
					
					<div className="settings_user">

						<form onSubmit={this.handleSubmit}>
							<h3>Edit Information</h3>

							<div className="bi_columns">
								<label>
									<span>Full Name</span>
									<input type="text" name="full_name" placeholder="Full Name" defaultValue={this.context.user.name} />
								</label>
								<label className={this.context.user.isVIP ? 'vip_user_label yes':'vip_user_label'}>
									<FaCheckCircle/>
									<span>VIP Access</span>
								</label>
							</div>


							<div className="bi_columns">
								<label>
									<span>Username</span>
									<input type="text" name="name" disabled placeholder="Username" defaultValue={this.context.user.username} />
								</label>
								<label>
									<span>Email</span>
									<input type="text" name="name" disabled placeholder="Email" defaultValue={this.context.user.email} />
								</label>
							</div>
							
							<label className="change_pass">
								<input type="checkbox" name="change_pass" onChange={this.change_pass}/> Change Password
							</label>

							{this.state.change_pass &&
							<div className="bi_columns">
								<label>
									<span>New Password</span>
									<input type="text" name="password" placeholder="New Password" required />
								</label>
								<label>
									<span>Old Password</span>
									<input type="text" name="old_password" placeholder="Old Password" required />
								</label>
							</div>}
						
						<button disabled={this.state.saving}><FaSave/> Save</button>
						</form>

					</div>
				</div>
			</Wrapper>
		)
	}
}