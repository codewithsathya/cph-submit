// Code run when background script detects there is a problem to submit
import config from './config';
import log from './log';

declare const browser: any;

if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

export const isContestProblem = (problemUrl: string) => {
    return problemUrl.indexOf('contest') !== -1;
};

export const getSubmitUrl = (problemUrl: string) => {
    const url = new URL(problemUrl);
    if(problemUrl.indexOf("cses.fi") !== -1) {
        const taskId = url.pathname.split('/')[3];
        return `https://cses.fi/problemset/submit/${taskId}`;
    }
    if (!isContestProblem(problemUrl)) {
        return config.cfSubmitPage.href;
    }
    const contestNumber = url.pathname.split('/')[2];
    return `https://codeforces.com/contest/${contestNumber}/submit`;
};

interface BaseSubmitParams {
    languageId: number | string;
    sourceCode: string;
    url: string;
}

interface CodeforcesSubmitParams extends BaseSubmitParams {
    problemName: string;
}

interface CsesSubmitParams extends BaseSubmitParams {
    fileName: string;
}

const injectScript = async (tabId: number) => {
    if (typeof browser !== 'undefined') {
        await browser.tabs.executeScript(tabId, {
            file: '/dist/injectedScript.js',
        });
    } else {
        await chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            files: ['/dist/injectedScript.js'],
        });
    }
};

const openAndInject = async (url: string): Promise<chrome.tabs.Tab> => {
    const tab = await chrome.tabs.create({ active: true, url });
    chrome.windows.update(tab.windowId, { focused: true });
    return tab;
};

const addNavigationListener = (url: string, tabId: number, filter: chrome.webNavigation.WebNavigationEventFilter) => {
    log('Adding nav listener');
    chrome.webNavigation.onCommitted.addListener((args) => {
        if (args.tabId === tabId) {
            log('Our tab is navigating');
            // Handle navigation changes if needed
        }
    }, filter);
};

export const handleSubmit = async ({
    problemName,
    languageId,
    sourceCode,
    url,
}: CodeforcesSubmitParams) => {
    if (!problemName || languageId === -1 || !sourceCode) {
        log('Invalid arguments to handleSubmit');
        return;
    }

    log('isContestProblem', isContestProblem(url));

    const tab = await openAndInject(getSubmitUrl(url));
    const tabId = tab.id as number;

    await injectScript(tabId);

    chrome.tabs.sendMessage(tabId, {
        type: 'cph-submit',
        problemName,
        languageId,
        sourceCode,
        url,
    });

    log('Sending message to tab with script');

    addNavigationListener(url, tabId, {
        url: [{ urlContains: 'codeforces.com/problemset/status' }],
    });
};

export const handleCsesSubmit = async ({
    languageId,
    sourceCode,
    url,
    fileName,
}: CsesSubmitParams) => {
    if (!languageId || !sourceCode) {
        log('Invalid arguments to handleCsesSubmit');
        return;
    }

    log('isContestProblem', isContestProblem(url));

    const tab = await openAndInject(getSubmitUrl(url));
    const tabId = tab.id as number;

    await injectScript(tabId);

    chrome.tabs.sendMessage(tabId, {
        type: 'cph-cses-submit',
        languageId,
        sourceCode,
        url,
        fileName,
    });

    log('Sending message to tab with script');

    addNavigationListener(url, tabId, {
        url: [{ urlContains: 'cses.fi/problemset/result' }],
    });
};
