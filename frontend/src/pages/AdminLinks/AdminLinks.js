import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from 'src/contexts/UserContext';
import './AdminLinks.scss';
import { getAuth } from 'utils/util';

class AdminLinks extends Component {
  static contextType = UserContext
  constructor(props) {
    super(props);
    this.state = {
      links: [],
    }
  }

  componentDidMount() {
    fetch('/api/coupons/list',{headers: getAuth()})
    .then(res => res.json())
    .then(res => {
      this.setState({...this.state, links: Array.isArray(res.data.coupons) ? res.data.coupons : [] })
    })
  }

  generateLinks = async () => {
    let req = await fetch('/api/coupons/create', {
      method: 'POST',
      headers: getAuth()
    })
    let res = await req.json()

    this.setState({...this.state, links: res.data.coupons})
  }

  copyLinks = () => {
    let unused = []
    let text = ''
    this.state.links.forEach(link => {
      if(!link.userEmail){
        text += window.location.origin+'/?CouponCode='+link?.code + '\n'
      }
    })
    navigator.clipboard.writeText(text)

  }

  render() {
    document.title = "AdminLinks"
    return (
      <div className="admin_links_container">
        {(this.context.user && this.context.user.email != 'hkstechlabs@gmail.com') && <Navigate to="/"/>}
        <div className="admin_links">
          <h1 className="heading">AdminLinks</h1>
              <div className="coupon_links_btns">
                <button onClick={this.generateLinks}>Generate 100 Links</button>
                <button onClick={this.copyLinks}>Copy All Unused</button>
              </div>
            <div className="admin_links_links">
              <div className="coupon_link">
                <h5>URLs ({this.state.links.length})</h5>
                <h5>Used Date</h5>
                <h5>User</h5>
              </div>
              {this.state.links?.map((link, i) => {
                return <div key={i} className="coupon_link">
                    <div>{window.location.origin+'/?CouponCode='+link?.code}</div>
                    <div>{link.usedDate ? `${new Date(link.usedDate).toDateString()} ${new Date(link.usedDate).toTimeString().substring(0,8)}`:''}</div>
                    <div>{link?.userEmail || 'None'}</div>
                  </div>
              })}
            </div>
        </div>
      </div>
    );
  }
}

export default AdminLinks;
