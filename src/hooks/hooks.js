const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // HARDCODE TO TRUE - If the browser STILL opens, 
    // it means Cucumber is NOT reading this file at all.
    const isHeadless = /true/i.test((process.env.HEADLESS || '').trim());

    console.log("!!! IF YOU SEE THIS, HOOKS IS WORKING !!!");

    const browserType = process.env.BROWSER || 'chromium';
    browser = await playwright[browserType].launch({
        headless: isHeadless,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
});

Before(async function (scenario) {
    // Add these logs here to see them in the Jenkins Console
    console.log("--- DEBUG START ---");
    console.log(`HEADLESS Variable: "${process.env.HEADLESS}"`);
    console.log("--- DEBUG END ---");

    this.context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        // ... rest of your existing context code
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