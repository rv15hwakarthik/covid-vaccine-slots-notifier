import Axios from 'axios';

import LinkIcon from '../../assets/redirect.svg';

export function triggerBrowserNotification() {
    try {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }

        else if (Notification.permission === "granted") {
            var notification = new Notification("Hi there! Vaccine slots are available:");
            notification.onclick = function (event) {
                event.preventDefault();
                window.open('https://selfregistration.cowin.gov.in/', '_blank');
            }
        }

        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification("Hi there! Vaccine slots are available:");
                    notification.onclick = function (event) {
                        event.preventDefault();
                        window.open('https://selfregistration.cowin.gov.in/', '_blank');
                    }
                }
            });
        }
    } catch (err) {
        console.log("Failed to send a notification due to error:", err);
    }
}

export function storeData(requestBody) {
    Axios.post('https://vaccine-browser-notifier-default-rtdb.asia-southeast1.firebasedatabase.app/.json', {
        timestamp: new Date(),
        ...requestBody,
    });
}

export function getDateString() {
    var MyDate = new Date();
    return ('0' + MyDate.getDate()).slice(-2) + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' + MyDate.getFullYear();
}
