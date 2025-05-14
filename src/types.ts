export type CphEmptyResponse = {
    empty: true;
};

export type CphSubmitResponse = {
    empty: boolean;
    problemName: string;
    url: string;
    sourceCode: string;
    languageId: number;
};

export type CphCsesSubmitResponse = {
    empty: boolean;
    url: string;
    sourceCode: string;
    languageId: string;
    fileName: string;
};

export type ContentScriptData = {
    type: 'cph-submit';
} & CphSubmitResponse;

export type CsesContentScriptData = {
    type: 'cph-cses-submit';
} & CphCsesSubmitResponse;
