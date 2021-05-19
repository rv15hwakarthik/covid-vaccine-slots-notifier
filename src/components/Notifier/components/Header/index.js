import React, {useState} from 'react';
import './style.scss';

const Header = (props) => {

    const [ show, setShow ] = useState(localStorage.getItem('notifier.showHeader') === 'false' ? false : true);
    
    const closeHandler = () => {
        setShow(false);
        localStorage.setItem('notifier.showHeader', false);
    }

    return show && <div className="heading">
        <div>- Make sure the browser notifications are enabled for this website</div>
        <div>- Keep the tab open to get a browser notification whenever a slot is available</div>
        <div>- Your selected district is saved for quicker results</div>
        <div className="close" onClick={closeHandler} >x</div>
    </div>
}

export default Header;