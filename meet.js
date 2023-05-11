import puppeteer from 'puppeteer-extra';
import StealthPlugin from  'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import audio from './audio.js';
import * as path from 'path';

// Only logs in, however we can skip this by just waiting for the chat button or the leave meeting button. Then signing in can be done manually with headless mode disabled, and the package just automates the other stuff
async function join({ meetingUrl, email, password, audioCapture = false }) {

    if (!meetingUrl.startsWith('https://meet.google.com/')) {
        throw("Meeting Link isn't valid. Make sure it looks like 'https://meet.google.com/xyz-wxyz-xyz'!");
    }

    const config = { 
        audioCapture: audioCapture
    };
    const browser = await startBrowser(config);
    const page = await browser.newPage();

    const ctx = await browser.defaultBrowserContext(); 
    await ctx.overridePermissions('https://meet.google.com', ['microphone', 'camera', 'notifications']);
    await page.goto(meetingUrl);

    await login(page, email, password);

    await page.waitForSelector('.u6vdEc');
    
    const join = await page.waitForSelector('button.VfPpkd-LgbsSe-OWXEXe-k8QpJ .VfPpkd-vQzf8d', { visible: true, timeout: 0 });

    await toggleMic(page); 
    await toggleVideo(page);
    
    await join.click();
    
    console.log('Meeting joined!');

    if (audioCapture) {
        audio.captureAudio(page);
    }
}

async function toggleMic(page) {
    await page.keyboard.down('ControlLeft');
    await page.keyboard.press('KeyD');
    await page.keyboard.up('ControlLeft');
}

async function toggleVideo(page) {
    await page.keyboard.down('ControlLeft');
    await page.keyboard.press('KeyE');
    await page.keyboard.up('ControlLeft');
}

async function login(page, email, password) {
    // Authenticating with credentials
    console.log('Logging in...')
    try {
        const signInButton = await page.waitForSelector('.NPEfkd', { visible: true, timeout: 10000 }); 
        await signInButton.focus(); 
        await signInButton.click();
    } catch (e) {
        console.log(e)
        // Sign In button is not visible, so we assume the page has already redirected, and is not accepting anonymous meeting members - Support for anonymous joining may be implemented in the future
    }
    const emailInput = await page.waitForSelector('input[type=email]', { visible: true, timeout: 0 }); 
    await emailInput.focus();
    await page.keyboard.type(email);
    await page.keyboard.press('Enter');
    const passwordInput = await page.waitForSelector('input[type=password]', { visible: true, timeout: 0 }); 
    await passwordInput.focus();
    await page.keyboard.type(password);
    await page.keyboard.press('Enter');
    console.log('Authenticated successfully!');
}

async function startBrowser({audioCapture}) { 

    const browser = await puppeteer.launch({
        headless: false,
        args: audioCapture ? getAudioCaptureArgs() : [],
    });
    return browser;
}

function getAudioCaptureArgs() {
    const extensionPath = path.join(process.cwd(), 'extension');
    const extensionId = 'hebcieapkbnpmbinjpccmfjeonmlamgm';
    return [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        `--autoplay-policy=no-user-gesture-required`,
        `--allowlisted-extension-id=${extensionId}`,
        `--window-size=1920x1080`
    ];
}

export default { join };