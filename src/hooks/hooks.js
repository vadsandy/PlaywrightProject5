const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');

let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // Get parameters passed from Jenkins environment variables
    const browserType = process.env.BROWSER || 'chromium';
    
    // Jenkins sends 'true'/'false' as strings; convert to boolean
    const isHeadless = process.env.HEADLESS === 'true';

    console.log(`Running on: ${browserType} | Headless Mode: ${isHeadless}`);

    // Dynamically launch the selected browser
    browser = await playwright[browserType].launch({
        headless: isHeadless,
        args: ['--disable-dev-shm-usage']
    });
});

Before(async function (scenario) {
    this.context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: {
            dir: 'reports/videos/', 
            size: { width: 1280, height: 720 }
        }
    }); 
    this.page = await this.context.newPage();
});

After(async function (scenario) {
    const video = this.page.video();
    const videoPath = video ? await video.path() : null; 

    // Capture screenshot on failure
    if (scenario.result?.status === Status.FAILED) {
        const screenshot = await this.page.screenshot({ fullPage: true }).catch(() => null);
        if (screenshot) {
            this.attach(screenshot, 'image/png');
        }
    }

    await this.page.close();
    await this.context.close();

    // Attach video if the test failed
    if (scenario.result?.status === Status.FAILED && videoPath && fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);
        this.attach(videoBuffer, 'video/webm');
    }
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }
});