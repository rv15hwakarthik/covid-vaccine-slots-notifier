import Axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Select } from 'antd';

import LinkIcon from '../../assets/redirect.svg';
import RefreshIcon from '../../assets/refresh.svg';

import './style.scss'
import 'antd/dist/antd.css';

const districtsJSON = require('../../constants/districts.json');

var MyDateString;
var MyDate = new Date();
MyDateString = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-'
    + MyDate.getFullYear();

const AVAILABLE_MESSAGE = <span>Vaccines are <span style={{ color: 'green'}}>AVAILABLE </span>- <a href="https://selfregistration.cowin.gov.in/">Cowin<img src={LinkIcon} alt="redirect icon" width="20px" target="_blank"></img></a><div>Available at :</div></span>
const NOT_AVAILABLE_MESSAGE = <span>Vaccines are <span style={ { color: 'red'}}>NOT AVAILABLE</span></span>
const SOMETHING_WENT_WRONG = <span style={{ color: 'red'}}>Something went wrong</span>

const { Option, OptGroup } = Select;

const Notifier = function(props) {

    const [districtId, setDistrictId] = useState((localStorage.getItem('districtId') && parseInt(localStorage.getItem('districtId'))) || 571);
    const [ageGroup, setAgeGroup] = useState((localStorage.getItem('ageGroup')) || `18`);
    const [message, setMessage] = useState('');
    const [fetchInterval, setFetchInterval] = useState('');
    const [availableCenters, setAvailableCenters] = useState([]);

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }

        return () => {
            clearInterval(fetchInterval);
        }
    }, [])

    useEffect(() => {
        fetchAvailableSlots();
        setFetchInterval(setInterval(function() {
            fetchAvailableSlots(true);
        }, 40000));
    }, [districtId, ageGroup])

    function fetchAvailableSlots(fromInterval) {
        setMessage('');
        Axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${MyDateString}`).
        then(response => {
            if(response.data && response.status === 200) {
                const centers = response.data.centers;
                let isAvailable = false; 
                let centersArray = []
                centers && centers.map((center) => {
                    center.sessions && center.sessions.map(session => {
                        if(session.available_capacity && session.min_age_limit === parseInt(ageGroup)) {
                            centersArray.push(center.name + "," + center.block_name)
                            isAvailable = true;
                            return;
                        }
                    })
                });
                if(isAvailable) {
                    setMessage(AVAILABLE_MESSAGE);
                    setAvailableCenters([...new Set(centersArray)])
                    if(fromInterval) {
                        triggerBrowserNotification();
                    }
                } else {
                    setMessage(NOT_AVAILABLE_MESSAGE);
                    setAvailableCenters('')
                }
            } else {
                setMessage(SOMETHING_WENT_WRONG);
            }
        }).catch((error) => {
            console.log(error);
            setMessage(SOMETHING_WENT_WRONG);
        })
    }

    function onDistrictChange(value) {
        localStorage.setItem('districtId', value );
        setDistrictId(value)

        clearInterval(fetchInterval);
    }

    function onAgeChange(e) {
        localStorage.setItem('ageGroup', e.target.value );
        setAgeGroup(e.target.value)

        clearInterval(fetchInterval);
    }

    function renderCenters(centers){
        let tempArray = []
        for (let index = 0; index < centers.length; index++) {
                tempArray.push(<div>{centers[index]}</div>)
        }
        return tempArray
    }
    function triggerBrowserNotification() {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification("Hi there! Vaccine slots are available:");
            notification.onclick = function(event) {
                event.preventDefault(); 
                window.open('https://selfregistration.cowin.gov.in/', '_blank');
            }
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Hi there! Vaccine slots are available:");
                    notification.onclick = function(event) {
                        event.preventDefault(); 
                        window.open('https://selfregistration.cowin.gov.in/', '_blank');
                    }
                }
            });
        }
    }

    return districtsJSON.length > 0 ? <div className="notifier">
        <div className="instructions">
                <div>- Make sure the browser notifications are enabled for this website</div>
                <div>- Keep the tab open to get a browser notification whenever a slot is available</div>
                <div>- Your selected district is saved for quicker results</div>
        </div>
        <div className="row">
            <div className="label">Age Group:</div>
            <div>
                <input type="radio" name="age" value="18" onChange={onAgeChange} checked={ageGroup === `18` ? true : false} /><label>18 to 44</label>
                <input type="radio" name="age" value="45" onChange={onAgeChange} checked={ageGroup === `45` ? true : false} /><label>45+</label>
            </div>
        </div>
        <div className="row">
            <div className="label">District:</div>
            <div>
                <Select
                    showSearch
                    placeholder="Select district"
                    optionFilterProp="children"
                    onChange={onDistrictChange}
                    value={districtId}
                >
                    {districtsJSON.map((district) => {
                        return <OptGroup label={district.text}>
                            {district.children && district.children.map((child) => {
                                return <Option key={child.id} value={child.id} >{child.text}</Option>
                            })}
                        </OptGroup>
                    })}
                </Select>
                <img className="refresh" src={RefreshIcon} alt="refresh" onClick={fetchAvailableSlots}></img>
            </div>
        </div>
        <div className="confirmation">
            {message}
        </div>
        <div className="centers">
            <div>
            { 
            (availableCenters || []).map((center) => {
                 return <div>{center}</div>
            })}
            </div>
        </div>
    </div> : ''
}

export default Notifier;