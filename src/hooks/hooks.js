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

    // pickle.tags contains ONLY the tags for the scenario currently running
    const scenarioTags = scenario.pickle.tags.map(t => t.name);
    
    if (scenarioTags.includes('@SQL')) {
        console.log("!!! DATABASE CONTEXT ENABLED: Requested via @SQL tag !!!");
    }
});

After(async function (scenario) {
    await this.page.close();
    await this.context.close();
});

AfterAll(async function() {
    await browser.close();
});