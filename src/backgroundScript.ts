import config from './config';
import { CphSubmitResponse, CphEmptyResponse, CphCsesSubmitResponse } from './types';
import { handleCsesSubmit, handleSubmit } from './handleSubmit';
import log from './log';
import { CSES_STATUS_KEY } from './constants';
import webBrowser from "webextension-polyfill";

declare const browser: any;

if (typeof browser === 'undefined') {
    chrome.runtime.onInstalled.addListener(() => {
        chrome.alarms.create('checkCPH', {
            periodInMinutes: config.alarmInterval / 60000
        });
    });

    chrome.runtime.onStartup.addListener(() => {
        chrome.alarms.create('checkCPH', {
            periodInMinutes: config.alarmInterval / 60000
        });
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'checkCPH') {
            run();
        }
    });
}

const fetchCphResponse = async (): Promise<CphSubmitResponse | CphEmptyResponse | CphCsesSubmitResponse | null> => {
    try {
        const localData = await webBrowser.storage.local.get(CSES_STATUS_KEY);

        const data = {
            csesStatus: localData[CSES_STATUS_KEY]
        }

        const request = new Request(config.cphServerEndpoint.href, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(data)
        });

        const cphResponse = await fetch(request);

        if (!cphResponse.ok) {
            log('Error while fetching cph response', cphResponse);
            return null;
        }

        return await cphResponse.json();
    } catch (err) {
        log('Error while fetching cph response', err);
        return null;
    }
};

const mainLoop = async () => {
    const response = await fetchCphResponse();
    if (!response) return;

    if ('empty' in response && response.empty) {
        log('Got empty valid response from CPH');
        return;
    }

    log('Got non-empty valid response from CPH');

    const { url } = response;

    if (url.includes("codeforces.com")) {
        handleSubmit(response as CphSubmitResponse);
    } else if (url.includes("cses.fi")) {
        handleCsesSubmit(response as CphCsesSubmitResponse);
    } else {
        log('Unsupported platform URL:', url);
    }
};

let interval: any;
const run = () => {
    console.log("Activated extension");
    if(interval) {
        console.log("Interval already running, so skipping")
        return;
    }
    interval = setInterval(mainLoop, config.loopTimeOut);
}

run();
