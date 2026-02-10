const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // This converts the string "true" (with any spaces) into a real boolean true
    const isHeadless = /true/i.test((process.env.HEADLESS || 'false').trim());

    const browserType = process.env.BROWSER || 'chromium';
    browser = await playwright[browserType].launch({
        headless: isHeadless, // Now this is a real boolean!
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
});

Before(async function (scenario) {
    // 1. Create context and page for this specific test
    this.context = await browser.newContext({
        recordVideo: { dir: 'reports/videos/' }
    });
    this.page = await this.context.newPage();

    // 2. Conditional SQL logic
    const tags = scenario.pickle.tags.map(t => t.name);
    if (tags.includes('@SQL')) {
        console.log("Database connection requested via @SQL tag...");
        // await connectToDB(); // Ensure this function is defined!
    }
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