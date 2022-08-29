import { Component } from 'react';
import { UserContext } from 'contexts/UserContext';
import { Navigate } from 'react-router-dom';
import FadingDots from "react-cssfx-loading/lib/FadingDots";

export default class AuthenticatedAccess extends Component{
	static contextType = UserContext;
	constructor(props){
		super(props)
	}

	render(){
		if(this.context.isLoggedIn === true ){
			return (
				<>
					{this.props.children}
				</>
			)
		}
		if(this.context.isLoggedIn === false){
			return <Navigate to="/" />
		}else{
			return (
				<>
                    <div className="pagePreloader">
                        <FadingDots width="150px" height="150px" color="#62d3f1" />
                    </div>
                </>
                )
		}
	}
}