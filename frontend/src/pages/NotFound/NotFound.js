import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Error404.css';

class Error404 extends Component {

  render() {
    document.title = "404! Not found."
    return (
      <div className="not_found_container">
        <div className="error404">
          <h1 className="heading">404 NOT FOUND</h1>
          <p className="text">Looks like you have lost your way</p>
          <Link to="/" className="back_home">
            How about going home?
          </Link>
        </div>
      </div>
    );
  }
}

export default Error404;
