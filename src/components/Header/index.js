import React from 'react';
import './style.scss';
import { NavLink } from 'react-router-dom';

const Header = function () {

    return <div className="header">
        <h1>Covid Vaccinations Slots Notifier</h1>
        <div className="tabs-container">
            <div>
                <NavLink to="/" exact activeClassName="selected" >Notifier</NavLink>
            </div>
            <div>
                {/* <NavLink  exact activeClassName="selected" >Donate</NavLink> */}
                <span>Donate<span className="tag">Coming Soon</span></span>
            </div>
        </div>
    </div>
}

export default Header;
