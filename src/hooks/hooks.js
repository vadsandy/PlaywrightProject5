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
    if (scenario.result?.status === Status.FAILED) {
        // 1. Screenshot Logic
        const screenshot = await this.page.screenshot({ fullPage: true }).catch(() => null);
        if (screenshot) {
            this.attach(screenshot, 'image/png');
        }

        // 2. Video Logic
        const video = this.page.video();
        if (video) {
            const videoPath = await video.path().catch(() => null);
            if (videoPath && fs.existsSync(videoPath)) {
                const videoBuffer = fs.readFileSync(videoPath);
                this.attach(videoBuffer, 'video/webm');
            }
        }
    }

    await this.page.close();
    await this.context.close();
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }
});