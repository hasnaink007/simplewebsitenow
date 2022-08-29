import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './About.scss';

class About extends Component {

  render() {
    document.title = "About Us"
    return (
      <div className="not_found_container">
        <div className="about_us">
          <h1 className="heading">About Us</h1>
          <p className="text">Information about us will be available soon.</p>
          <Link to="/" className="back_home">
            Home
          </Link>
        </div>
      </div>
    );
  }
}

export default About;
