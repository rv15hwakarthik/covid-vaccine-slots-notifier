import Axios from 'axios';
import React, { useEffect, useState } from 'react'

import LinkIcon from '../../assets/redirect.svg';
import RefreshIcon from '../../assets/refresh.svg';

import './style.scss'

const json = require('../../constants/districts.json');

var MyDateString;
var MyDate = new Date();
MyDateString = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-'
    + MyDate.getFullYear();

const AVAILABLE_MESSAGE = <span>Vaccines are <span style={{ color: 'green'}}>AVAILABLE </span>- <a href="https://selfregistration.cowin.gov.in/">Cowin<img src={LinkIcon} alt="redirect icon" width="20px" target="_blank"></img></a><div>Available at :</div></span>
const NOT_AVAILABLE_MESSAGE = <span>Vaccines are <span style={ { color: 'red'}}>NOT AVAILABLE</span></span>
const SOMETHING_WENT_WRONG = <span style={{ color: 'red'}}>Something went wrong</span>

const Notifier = function(props) {

    const [districts, setDistricts] = useState([]);
    const [districtId, setDistrictId] = useState((localStorage.getItem('districtId') && parseInt(localStorage.getItem('districtId'))) || 571);
    const [ageGroup, setAgeGroup] = useState(`18`);
    const [dose, setDose] = useState(`dose1`);
    const [message, setMessage] = useState('');
    const [fetchInterval, setFetchInterval] = useState('');
    const [availableCenters, setAvailableCenters] = useState([]);

    useEffect(() => {
        const arr = [];
        json.map((state) => {
            arr.push({ text: `-----${state.text}-----`, disabled: true, })
            state.children.map((district) => {
                arr.push({ text: district.text, id: district.id })
            })
        })
        setDistricts(arr);
        setFetchInterval(setInterval(function() {
            fetchAvailableSlots(true);
        }, 45000));

        Notification.requestPermission();

        return () => {
            clearInterval(fetchInterval);
        }
    }, [])

    useEffect(() => {
        fetchAvailableSlots();
    }, [districtId, ageGroup, dose])

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
                        let doses  = session.available_capacity_dose1
                        if(dose === 'dose2') { doses = session.available_capacity_dose2 }
                        if(session.available_capacity && session.min_age_limit === parseInt(ageGroup) && doses > 0) {
                            centersArray.push(center.name + "," + center.block_name)
                            isAvailable = true;
                            if(fromInterval) {
                                triggerBrowserNotification();
                            }
                            return;
                        }
                    })
                });
                if(isAvailable) {
                    setMessage(AVAILABLE_MESSAGE);
                    setAvailableCenters([...new Set(centersArray)])
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

    function onDistrictChange(e) {
        localStorage.setItem('districtId', e.target.value );
        setDistrictId(e.target.value)

        clearInterval(fetchInterval);
        setFetchInterval(setInterval(function() {
            fetchAvailableSlots(true);
        }, 45000));
    }

    function onAgeChange(e) {
        localStorage.setItem('ageGroup', e.target.value );
        setAgeGroup(e.target.value)

        clearInterval(fetchInterval);
        setFetchInterval(setInterval(function() {
            fetchAvailableSlots(true);
        }, 45000));
    }
    function onDoseChange(e) {
        localStorage.setItem('dose', e.target.value );
        setDose(e.target.value)

        clearInterval(fetchInterval);
        setFetchInterval(setInterval(function() {
            fetchAvailableSlots(true);
        }, 45000));
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

    return districts.length > 0 ? <div className="notifier">
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
            <div className="label">Dose:</div>
            <div>
                <input type="radio" name="dose1" value="dose1" onChange={onDoseChange} checked={dose === `dose1` ? true : false} /><label>first dose</label>
                <input type="radio" name="dose2" value="dose2" onChange={onDoseChange} checked={dose === `dose2` ? true : false} /><label>second dose</label>
            </div>
        </div>
        <div className="row">
            <div className="label">District:</div>
            <div>
                <select name="district" defaultValue={districtId} onChange={onDistrictChange}>
                    {districts.map((district) => {
                        return <option key={district.id} value={district.id} disabled={district.disabled} >{district.text}</option>
                    })}
                </select>
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