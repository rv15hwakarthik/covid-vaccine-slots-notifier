import { Select } from 'antd';
import Axios from 'axios';
import React, { useEffect, useState } from 'react'

import LinkIcon from '../../assets/redirect.svg';
import RefreshIcon from '../../assets/refresh.svg';

import Header from './components/Header';

import './style.scss'
import 'antd/dist/antd.css';

import { getDateString, triggerBrowserNotification, storeData } from './utils';
const districtsJSON = require('../../constants/districts.json');
const dateParam = getDateString();


const AVAILABLE_MESSAGE = <span>Vaccines are <span style={{ color: 'green'}}>AVAILABLE </span>- <a href="https://selfregistration.cowin.gov.in/" target="_blank" rel="noreferrer" >Cowin<img src={LinkIcon} alt="redirect icon" width="20px" style={{ verticalAlign: 'middle'}} ></img></a><div>Available at :</div></span>
const NOT_AVAILABLE_MESSAGE = <span>Vaccines are <span style={ { color: 'red'}}>NOT AVAILABLE</span></span>
const SOMETHING_WENT_WRONG = <span style={{ color: 'red'}}>Something went wrong</span>

const { Option, OptGroup } = Select;

const Notifier = function(props) {

    const [districtId, setDistrictId] = useState((localStorage.getItem('districtId') && parseInt(localStorage.getItem('districtId'))) || 571);
    const [ageGroup, setAgeGroup] = useState(localStorage.getItem('ageGroup') || `18`);
    const [dose, setDose] = useState( localStorage.getItem('dose') || `dose_1`);
    const [vaccineType, setVaccineType] = useState( localStorage.getItem('vaccineType') || `ANY`);

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
    }, [districtId, ageGroup, dose, vaccineType])

    function fetchAvailableSlots(fromInterval) {
        setMessage('');
        setAvailableCenters([]);
        Axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${dateParam}`).
        then(response => {
            if(response.data && response.status === 200) {
                const centers = response.data.centers;
                let isAvailable = false; 
                let centersArray = []
                centers && centers.map((center) => {
                    center.sessions && center.sessions.map(session => {
                        let doses  = session.available_capacity_dose1
                        if (dose === 'dose_2') { 
                            doses = session.available_capacity_dose2 
                        }

                        if(doses && session.min_age_limit === parseInt(ageGroup) && (session.vaccine === vaccineType || vaccineType === 'ANY')){
                            centersArray.push(center.name + "," + center.block_name);
                            isAvailable = true;
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
                }
                storeData({ isAvailable, ageGroup, vaccineType, dose, districtId });

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

    function onDoseChange(e) {
        localStorage.setItem('dose', e.target.value );
        setDose(e.target.value)

        clearInterval(fetchInterval);
    }

    function onVaccineTypeChange(e) {
        localStorage.setItem('vaccineType', e.target.value );
        setVaccineType(e.target.value)

        clearInterval(fetchInterval);
    }

    return districtsJSON.length > 0 ? <div className="notifier">
        <Header />
        <div className="row">
            <div className="label">Age Group:</div>
            <div>
                <label><input type="radio" name="age" value="18" onChange={onAgeChange} checked={ageGroup === `18` ? true : false} /> 18 to 44</label>
                <label><input type="radio" name="age" value="45" onChange={onAgeChange} checked={ageGroup === `45` ? true : false} /> 45+</label>
            </div>
        </div>
        <div className="row">
            <div className="label">Dose Number:</div>
            <div>
                <label><input type="radio" name="dose" value="dose_1" onChange={onDoseChange} checked={dose === `dose_1` ? true : false} /> Dose 1</label>
                <label><input type="radio" name="dose" value="dose_2" onChange={onDoseChange} checked={dose === `dose_2` ? true : false} /> Dose 2</label>
            </div>
        </div>
        <div className="row">
            <div className="label">Vaccine Type:</div>
            <div>
                <label><input type="radio" name="vaccineType" value="ANY" onChange={onVaccineTypeChange} checked={vaccineType === `ANY` ? true : false} /> ANY</label>
                <label><input type="radio" name="vaccineType" value="COVISHIELD" onChange={onVaccineTypeChange} checked={vaccineType === `COVISHIELD` ? true : false} /> COVISHIELD</label>
                <label><input type="radio" name="vaccineType" value="COVAXIN" onChange={onVaccineTypeChange} checked={vaccineType === `COVAXIN` ? true : false} /> COVAXIN</label>
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
            </div>
        </div>
        <div className="refresh">
            <div onClick={fetchAvailableSlots}>Click here to refresh the results<img src={RefreshIcon} alt="refresh"></img></div>
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
