const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // 1. Get Browser type from Jenkins (chromium, firefox, webkit)
    const browserType = process.env.BROWSER || 'chromium';
    
    // 2. Convert Jenkins string 'true'/'false' to a real Boolean. 
    // We check if it is exactly 'true' to avoid accidental headless runs.
    const isHeadless = process.env.HEADLESS === 'true';

    console.log(`Launching ${browserType} | Headless: ${isHeadless}`);

    // 3. Launch the specific browser type dynamically
    browser = await playwright[browserType].launch({
        headless: isHeadless,
        args: ['--disable-dev-shm-usage'] // Recommended for CI environments like Jenkins
    });
});

Before(async function (scenario) {
    // Create a clean isolation for this specific test
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
    // 1. Get the video path BEFORE closing the page
    const video = this.page.video();
    const videoPath = video ? await video.path() : null; 

    // 2. Attach Screenshot on Failure
    if (scenario.result?.status === Status.FAILED) {
        const screenshot = await this.page.screenshot({ fullPage: true }).catch(() => null);
        if (screenshot) {
            this.attach(screenshot, 'image/png');
        }
    }

    // 3. Close page and context (This flushes the video to disk)
    await this.page.close();
    await this.context.close();

    // 4. Attach Video only on Failure
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