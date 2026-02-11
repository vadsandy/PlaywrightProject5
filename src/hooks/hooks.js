const { Before, After, Status, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');

let browser;
setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
    const isHeadless = /true/i.test((process.env.HEADLESS || 'false').trim());
    browser = await playwright.chromium.launch({
        headless: isHeadless,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
});

Before(async function (scenario) {
    this.context = await browser.newContext();
    this.page = await this.context.newPage();

    // STRICT TAG CHECKING
    const scenarioTags = scenario.pickle.tags.map(t => t.name);
    
    // Only logs and connects if the SPECIFIC scenario being run has @SQL
    if (scenarioTags.includes('@SQL')) {
        console.log("!!! DATABASE CONTEXT ENABLED: Requested via @SQL tag !!!");
        // this.db = await DataReader.connect(); 
    }
});

After(async function (scenario) {
    await this.page.close();
    await this.context.close();
});

AfterAll(async function() {
    await browser.close();
});