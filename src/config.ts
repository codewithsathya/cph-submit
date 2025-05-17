const config = {
    cphServerEndpoint: new URL('http://localhost:27121/getSubmit'),
    cfSubmitPage: new URL('https://codeforces.com/problemset/submit'),
    loopTimeOut: 3000,
    debug: true,
    headers: new Headers({ 'cph-submit': 'true', 'Content-Type': "application/json" })
};

export default config;
