import meet from './meet.js';

let config = { 
    meetingUrl: '', 
    email: '', 
    password: '' 
};

(async () => {
    await meet.join(config);
})()

/*
 Async/await syntax is required if you need to execute specific actions with Puppeteer or don't want to be limited to only the events already implemented.
*/