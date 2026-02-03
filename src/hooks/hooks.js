const {Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout} = require('@cucumber/cucumber');
const {chromium} = require ('@playwright/test');
const fs = require('fs');


let browser;

setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    // Read browser from Jenkins environment variable, default to chromium
    const browserType = process.env.BROWSER || 'chromium';
    // Convert the string 'true'/'false' from Jenkins into a real Boolean
    const isHeadless = process.env.HEADLESS !== 'false';
    browser = await require('@playwright/test')[browserType].launch({headless: isHeadless});
    //browser = await chromium.launch({headless: false});
    
});

Before(async function (scenario){
    //1. Create a clean isolation for this specific test
    this.context = await browser.newContext({
        recordVideo: {
            dir: 'reports/videos/', // Where videos are saved temporarily
            size: { width: 1280, height: 720 }
        }
    }); 
    this.page = await this.context.newPage();
});

After(async function (scenario){
    // 1. Get the video path BEFORE closing the page
    const video = this.page.video();
    const videoPath = video? await video.path() : null; 

    // 3. Attach Screenshot on Failure
    if(scenario.result?.status === Status.FAILED) {
        const screenshot = await this.page.screenshot({ fullPage: true, timeout: 5000}).catch(()=> null);
        this.attach(screenshot, 'image/png');
    }
    // 2. Close page and context (This flushes the video to disk)
    await this.page.close();
    await this.context.close();

    // 4. Attach Video only on Failure (Real-world best practice)
    if (scenario.result?.status === Status.FAILED &&  videoPath && fs.existsSync(videoPath)){
       const videoBuffer = fs.readFileSync(videoPath);
       this.attach(videoBuffer, 'video/webm');
    }
});

AfterAll(async function () {
    await browser.close();
});
