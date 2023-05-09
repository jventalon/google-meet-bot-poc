import puppeteer from 'puppeteer-extra';
import StealthPlugin from  'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

// Only logs in, however we can skip this by just waiting for the chat button or the leave meeting button. Then signing in can be done manually with headless mode disabled, and the package just automates the other stuff
async function join({ meetingUrl, email, password }) {

    if (!meetingUrl.startsWith("https://meet.google.com/")) {
        throw("Meeting Link isn't valid. Make sure it looks like 'https://meet.google.com/xyz-wxyz-xyz'!");
    }

    let browser = await puppeteer.launch({ headless: false });
    let page = await browser.newPage();
    let ctx = await browser.defaultBrowserContext(); 
    await ctx.overridePermissions('https://meet.google.com', ['microphone', 'camera', 'notifications']);
    await page.goto(meetingUrl);

    await login(page, email, password);

    await page.waitForSelector('.u6vdEc');
    
    let join = await page.waitForSelector('button.VfPpkd-LgbsSe-OWXEXe-k8QpJ .VfPpkd-vQzf8d', { visible: true, timeout: 0 });

    await toggleMic(page); 
    await toggleVideo(page);
    
    await join.click();
    
    console.log("Meeting joined!");
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
    console.log("Logging in...")
    try {
        var signInButton = await page.waitForSelector('.NPEfkd', { visible: true, timeout: 10000 }); 
        await signInButton.focus(); 
        await signInButton.click();
    } catch (e) {
        console.log(e)
        // Sign In button is not visible, so we assume the page has already redirected, and is not accepting anonymous meeting members - Support for anonymous joining may be implemented in the future
    }
    var input = await page.waitForSelector('input[type=email]', { visible: true, timeout: 0 }); await input.focus();
    await page.keyboard.type(email);
    await page.keyboard.press('Enter');
    var input = await page.waitForSelector('input[type=password]', { visible: true, timeout: 0 }); await input.focus();
    await page.keyboard.type(password);
    await page.keyboard.press('Enter');
    console.log("Authenticated successfully!");
}

export default { join };