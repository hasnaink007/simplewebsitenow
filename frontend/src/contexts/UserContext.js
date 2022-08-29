import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { toastOptions } from 'utils/toast';

const UserContext = React.createContext()

class UserContextProvider extends Component {
	constructor(props) {
		super(props)

		this.state = {
			isLoggedIn: undefined,
			user: {},
			recover: this.recover,
			logUserIn: this.logUserIn,
			logUserOut: this.logUserOut,
			registerUser: this.registerUser,
			refreshUser: this.refreshUser,
			updateSettings: this.updateSettings,
		}
	}

	componentDidMount = async () => {
		this.refreshUser()
	}

	refreshUser = ()=>{
		fetch(`/api/users/current`, {
			method: 'POST'
		})
		.then(res => res.json())
		.then(data =>{
			let isLoggedIn = data.user ? true : false
			let user = data.user ? data.user : {}
			this.setState({ isLoggedIn, user })
		})
		.catch(err =>{
			this.api_error()
			console.log(err)
		})
	}

	api_error  = ()=>{
		if( window.confirm('There were some error loading this page. Please refresh') ){
			window.location.reload()
		}
	}

	updateSettings = async (data) => {
		let toastID = toast.loading('Updating settings... Please wait.')
		try{
			let req = await fetch(`/api/users/update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})

			let res = await req.json()

			this.setState({...this.state, user: { ...this.state.user, ...res.user }})

			toast.update(toastID, {...toastOptions, type: res.res, render: res.text})
		}catch(e){
			console.log(e)
			toast.update(toastID, {...toastOptions, type: 'error', render: 'An Error occored while saving your settings.'})
		}
	}

	logUserIn = async (username, password) => {

		try{
			const res = await fetch(`/api/users/login`, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				method: 'POST',
				body: JSON.stringify({ username, password }),
			})

			const login = await res.json()
			if(login.res == 'success'){
				this.setState({ isLoggedIn: true, user: login.user })
			}
			return login

		}catch(err){
			this.api_error()
		}

	}

	registerUser = async (user) => {
		try{
			let res = await fetch(`/api/users/register`, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				method: 'POST',
				body: JSON.stringify(user),
			})

			let responseStatus = await res.json()
			return responseStatus
			if(responseStatus.user?.name){
				this.setState({...this.state, isLoggedIn: true, user: responseStatus.user })
			}

		}catch(err){
			this.api_error()
			return {res: 'error', text: 'An Error occured. Please try again.'}
		}
	}

	logUserOut = async () => {
		await fetch(`/api/users/logout`, {
			credentials: 'include',
			method: 'POST',
		})

		this.setState({ isLoggedIn: false, user: {} })
	}

	recover = async (body) => {
		try{
			let req = await fetch(`/api/users/recover`, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				method: 'POST',
				body: JSON.stringify(body),
			})
			let res = await req.json()
			console.log(res)
			return res
		}catch(err){
			this.api_error()
		}
	}

	render() {
		return (
			<UserContext.Provider value={this.state}>
				{this.props.children}
			</UserContext.Provider>
		)
	}
}

export { UserContext, UserContextProvider }
