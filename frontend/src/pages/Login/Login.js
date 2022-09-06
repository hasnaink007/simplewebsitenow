import React, { Component } from 'react';
import { UserContext } from 'contexts/UserContext';
import { FiUser, FiLock } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';
import { CgNametag } from 'react-icons/cg';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {toastOptions} from 'utils/toast.jsx';

import './Login.scss';

class Login extends Component {
	static contextType = UserContext;
	state = {
		username: '',
		password: '',
		name: '',
		password: '',
		confirm_password: '',
		email: '',
		coupon: '',
		loading: false,
		type: 'login',
	}

	componentDidMount(){
		let params = new URLSearchParams(window.location.search)
		if( params.get('CouponCode') ){
			setTimeout(() => {
				this.setState({...this.state, type: 'signup', coupon: params.get('CouponCode')})
			},200)
		}
		// only for the development purpose
		if('http://localhost:3000' === window.location.origin){
			this.setState({...this.state, username: 'webapp', password: 'abcd.1234'})
		}
	}


	handleSubmit = async (event) => {
		event.preventDefault()
		this.setState({...this.state, loading: true})
		let toastID;
		try{
			if(this.state.type === 'login'){
			
				let { username, password } = this.state
				toastID = toast.loading('Logging you in... Please wait.')
				let r = await this.context.logUserIn(username, password)
				toast.update(toastID, {...toastOptions, type: r.success ? 'success':'error', render: r.message})
			
			}else if(this.state.type === 'signup'){
			
				let { name, email, username, password, confirm_password, coupon } = this.state
				if(password !== confirm_password){
					toast.warning('Password and Confirm Password do not match.')
					this.setState({...this.state, loading: false})
					return
				}
				toastID = toast.loading('Registering account... Please wait.')
				let r = await this.context.registerUser(this.state)
				toast.update(toastID, {...toastOptions, type: r.success?'success':'error', render: r.message})
				this.context.refreshUser()
			}else{
				toastID = toast.loading('Sending Reset Link... Please wait.')
				this.setState({...this.state, loading: true})
				let r = await this.context.recover({email: this.state.email})
				toast.update(toastID, {...toastOptions, type: r.success?'success':'error', render: r.message})
			}
			this.setState({...this.state, loading: false})
		}catch(e){
			toast.update(toastID, {...toastOptions, type: 'error', render: "Some Error occured. Please try again."})
			this.setState({...this.state, loading: false})
		}
		this.setState({...this.state, loading: false})

	}

	showForgotPass = event => {
		event.preventDefault()
		let {type} = this.state
		if(type !== 'recover'){
			type = 'recover'
		}else{
			type = 'login'
		}
		this.setState({...this.state, type})
	}

	toggleSignup = e => {
		e.preventDefault()
		let {type} = this.state
		if(type !== 'signup'){
			type = 'signup'
		}else{
			type = 'login'
		}
		this.setState({...this.state, type})
	}

	handleInput = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
		})
	}

	render() {
		if(this.context.isLoggedIn){
			return(
				<Navigate to="/dashboard" />
			)
		}
		document.title = "Welcome! Login to continue..."
		return (
			<div id="login_page">
				<form method="post" onSubmit={this.handleSubmit} className="login_form">
					<div className="avatar__icon">
						{(this.state.type === 'login') ?
							<FiUser className="avatar__icon__svg" strokeWidth="1" />
							:
							<FiUser className="avatar__icon__svg" strokeWidth="1" />
						}
					</div>
					<label className="username_label">
						<FiUser strokeWidth="2" />
						<input
							type="text"
							name={this.state.type == 'recover' ? "email" : "username"}
							required={true}
							placeholder={this.state.type === 'signup' ? "Username" : (this.state.type === 'recover' ? "Email" : "Username or Email")}
							onChange={this.handleInput}
							value={this.state.type == 'recover' ? this.state.email : this.state.username}
						/>
					</label>

					{(this.state.type !== 'recover') &&
						<>
							{this.state.type === 'signup' &&
							<>
								<label className="email_label">
									<AiOutlineMail strokeWidth="2" />
									<input
										type="text"
										name="email"
										placeholder="Email"
										required={true}
										onChange={this.handleInput}
										value={this.state.email}
									/>
								</label>
								<label className="full_name_label">
									<CgNametag strokeWidth="2" />
									<input
										type="text"
										name="name"
										placeholder="Full Name"
										required={true}
										onChange={this.handleInput}
										value={this.state.name}
									/>
								</label>
								<label className="password_label">
									<FiLock strokeWidth="2" />
									<input
										type="password"
										name="confirm_password"
										placeholder="Password"
										required={true}
										onChange={this.handleInput}
										value={this.state.confirm_password}
									/>
								</label>
							</>}
							<label className="username_label">
								<FiLock strokeWidth="2" />
								<input
									type="password"
									name="password"
									placeholder={this.state.type === 'signup' ? "Confirm Password" : "Password"}
									required={true}
									onChange={this.handleInput}
									value={this.state.password}
								/>
							</label>
						</>}
					<input type="submit" name="submit" value={(this.state.type === 'login') ? 'LOGIN' : (this.state.type === 'recover' ? 'RESET PASSWORD' : 'SIGNUP')} disabled={this.state.loading} />

					<div className="login_form__switch">
						<a href="#" onClick={this.toggleSignup} className="signup_link">
							{(this.state.type !== 'signup') ? "Create an Account?" : "Back to login" }
						</a>
						<a href="#" onClick={this.showForgotPass} className="forgot_link">
							{(this.state.type !== 'recover') ? 'Forgot Password?' : "Back to login" }
						</a>
					</div>
				</form>
			</div>
		)
	}
}

export default Login;
