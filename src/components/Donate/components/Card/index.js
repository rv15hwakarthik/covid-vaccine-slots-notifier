import React from 'react';
import './style.scss'

import LinkIcon from '../../../../assets/redirect.svg'

const Card = ({ title, image, websiteUrl, paymentPageUrl}) => {

    return <div className="card">
        <img src={image} width="80px" height="80px" alt={title + 'logo'} />
        <div className="text-container" >
            <div className="title" >
                {title}
            </div>
            <div>
                <a className="website" target="_blank" href={websiteUrl} rel="noreferrer">Website<img src={LinkIcon} alt="redirect icon" width="20px" style={{ verticalAlign: 'middle'}} ></img></a>
                <a className="donate-now" target="_blank" href={paymentPageUrl} rel="noreferrer">Donate Now</a>
            </div>
        </div>
    </div>
}

export default Card;