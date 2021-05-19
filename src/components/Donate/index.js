import Card from './components/Card';
import React from 'react';
import './style.scss';

import NGOs from '.././../constants/ngos';

const Donate = (props) => {

    return <div className="donate" >
        <div className="heading">
            Donate to support NGOs fighting against COVID-19 
        </div>
        <div className="cards-container">
            {(NGOs || []).map(ngo => {
                return <Card title={ngo.title} websiteUrl={ngo.websiteUrl} paymentPageUrl={ngo.paymentPageUrl} image={ngo.image} />
            })}
        </div>
    </div>
}

export default Donate;