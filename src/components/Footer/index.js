import React from 'react';
import './style.scss';

import CodeIcon from '../../assets/code.svg';

const Footer = (props) => {

    return <div className="footer">
        <a href="https://github.com/rv15hwakarthik/covid-vaccine-slots-notifier" target="_blank" rel="noreferrer" ><img src={CodeIcon} alt="" width="20px" /> Contribute</a>
    </div>
}

export default Footer;