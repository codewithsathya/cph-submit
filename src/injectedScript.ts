import { ContentScriptData, CsesContentScriptData } from './types';
import log from './log';
import browser from "webextension-polyfill";

log('cph-submit script injected');

const isContestProblem = (problemUrl: string) => {
    return problemUrl.includes('contest');
};

const handleData = (data: ContentScriptData) => {
    log('Handling submit message');
    const languageEl = document.getElementsByName('programTypeId')[0] as HTMLSelectElement;
    const sourceCodeEl = document.getElementById('sourceCodeTextarea') as HTMLTextAreaElement;

    sourceCodeEl.value = data.sourceCode;
    languageEl.value = data.languageId.toString();

    if (!isContestProblem(data.url)) {
        const problemNameEl = document.getElementsByName('submittedProblemCode')[0] as HTMLInputElement;
        problemNameEl.value = data.problemName;
    } else {
        const problemIndexEl = document.getElementsByName('submittedProblemIndex')[0] as HTMLSelectElement;
        const problemName = data.url.split('/problem/')[1]; // Ex: 1234/A
        problemIndexEl.value = problemName;
    }

    log('Submitting problem');
    const submitBtn = document.querySelector('.submit') as HTMLButtonElement;
    submitBtn.disabled = false;
    submitBtn.click();
};

const handleCsesData = (data: CsesContentScriptData) => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!input) {
        console.error('File input not found');
        return;
    }

    const blob = new Blob([data.sourceCode], { type: 'text/plain' });
    const file = new File([blob], data.fileName, { type: 'text/plain' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    input.dispatchEvent(new Event('change', { bubbles: true }));

    const langEl = document.getElementById('lang') as HTMLSelectElement;
    langEl.value = data.languageId;

    const submitBtn = document.querySelector('input[type="submit"]') as HTMLInputElement;
    submitBtn.disabled = false;
    submitBtn.click();
};

log('Adding event listener');
browser.runtime.onMessage.addListener((data: any) => {
    log('Got message', data);
    if (data.type === 'cph-submit') {
        handleData(data);
    }
    if (data.type === 'cph-cses-submit') {
        handleCsesData(data);
    }
});
