const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // 1. Log exactly what is coming from the environment
    console.log("--- DEBUG HEADLESS START ---");
    console.log(`Raw Environment Value: "${process.env.HEADLESS}"`);
    
    const browserType = process.env.BROWSER || 'chromium';
    
    // 2. Use a more aggressive check
    const rawVal = (process.env.HEADLESS || '').trim().toLowerCase();
    const isHeadless = rawVal === 'true';

    console.log(`Evaluated Boolean: ${isHeadless}`);
    console.log("--- DEBUG HEADLESS END ---");

    browser = await playwright[browserType].launch({
        headless: isHeadless,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
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
        // 1. Screenshot
        const screenshot = await this.page.screenshot({ fullPage: true }).catch(() => null);
        if (screenshot) {
            this.attach(screenshot, 'image/png');
        }

        // 2. Video 
        const video = this.page.video();
        if (video) {
            await this.page.close(); // Close page to finalize video file
            const videoPath = await video.path().catch(() => null);
            
            if (videoPath && fs.existsSync(videoPath)) {
                const videoBuffer = fs.readFileSync(videoPath);
                this.attach(videoBuffer, 'video/webm');
            }
        }
    } else {
        await this.page.close();
    }
    await this.context.close();
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }
});