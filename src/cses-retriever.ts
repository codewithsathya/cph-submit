import { CSES_STATUS_KEY } from "./constants";
import log from "./log";

function run() {
    const els = document.getElementsByClassName("account")
    if (!els || els.length === 0) {
        return;
    }
    const accountUrl = (els[0] as HTMLAnchorElement).href
    if (accountUrl.endsWith("/login")) {
        log("User not yet logged in");
        return;
    }
    const problems = document.getElementsByClassName("task");
    if (!problems || problems.length === 0) {
        return;
    }
    const csesStatus: Record<string, boolean> = {};
    for (let i = 0; i < problems.length; i++) {
        const problemEl = problems[i];
        const statusNode = problemEl.lastChild as HTMLSpanElement;
        const url = (problemEl.children[0] as HTMLAnchorElement).href;
        const match = url.match(/\/task\/(\d+)/);
        let taskId: string;
        if (match) {
            taskId = match[1];
        } else {
            continue;
        }
        if (statusNode.classList.contains("full")) {
            csesStatus[taskId] = true;
        } else if (statusNode.classList.contains("zero")) {
            csesStatus[taskId] = false;
        }
    }
    chrome.storage.local.set({ [CSES_STATUS_KEY]: csesStatus })
}

run();