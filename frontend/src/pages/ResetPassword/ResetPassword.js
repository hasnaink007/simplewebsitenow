import React, { Component } from 'react';
import FadingBalls from 'react-cssfx-loading/lib/FadingBalls';
import NotFound from 'pages/NotFound/NotFound';
import { toast } from 'react-toastify';
import './ResetPassword.scss';
import { toastOptions } from 'src/utils/toast';

class ResetPassword extends Component {

  state = {
    loading: true,
    password: '',
    confirm_password: '',
    password_matches: false,
    token: '',
    error: false
  }
  componentDidMount() {
    let params = new URLSearchParams(window.location.search)
    let token = params.get('token')
    if(!token) {
      this.setState({...this.state, loading: false, error: true})
      return
    }
    this.setState({...this.state, loading: false, token})
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    let toastID = toast.loading('Updating Password...')
    try{
      let req = await fetch('/api/users/reset_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
      })
      let res = await req.json()
      
      toast.update(toastID, {...toastOptions, render: res.text, type: res.res})
      if(res.res == 'success'){
        setTimeout(() => {
          window.location.href = window.location.origin
        }, 2000)
      }
    }catch(err){
      toast.update(toastID, {...toastOptions, render: 'some error occured', type: 'error'})
    }
    
  }

  handleInput = (e) => {
    let state = {...this.state}
    state[e.target.name] = e.target.value
    this.setState({
      ...state,
      password_matches: (state.password == state.confirm_password && state.password.length > 7)
    })
  }
  render() {
    document.title = "Reset Password"
    if(this.state.loading){
      return(
        <div className="pagePreloader">
          <div >
            <div style={{margin: 'auto', marginBottom: '10px', width: 'max-content'}} className="center"> 
              <FadingBalls />
            </div>
            <div> 
              Checking reset link...
            </div>
          </div>
        </div>
      )
    }
    if(this.state.error){
      return(
        <NotFound />
      )
    }
    return (
      <div className="reset_password_container">
        <div className="reset_password">
          <h1 className="heading">Reset Your Password</h1>
          <form method='POST' onSubmit={this.handleSubmit}>
            <label className="pass_label">
              <span>Password </span>
              <small>(atleast 8 charachters long)</small>
              <input type="password" name="password" placeholder="Password" required={true} onChange={this.handleInput} />
            </label>
            <label className="confirm_pass_label">
              <span>Confirm Password</span>
              <input type="password" name="confirm_password" placeholder="Confirm Password" required={true} onChange={this.handleInput} />
            </label>
            <button disabled={!this.state.password_matches}>Reset</button>
          </form>
        </div>
      </div>
    );
  }
}

export default ResetPassword;