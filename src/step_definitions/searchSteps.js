const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Anchored with ^ and $ to prevent overlap with login steps
Given(/^I open the landing page$/, async function () { 
    console.log("!!! SEARCH HOOK TRIGGERED !!!");
    await this.page.goto('https://demoqa.com/', { waitUntil: 'domcontentloaded' }); 
});

When(/^I click on the "([^"]*)" tile$/, async function (tileName) {
    const tile = this.page.locator(`h5:has-text("${tileName}")`);
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
});

Then(/^the URL should contain "([^"]*)"$/, async function (urlExtension) {
    await expect(this.page).toHaveURL(new RegExp(urlExtension));
});

When(/^I type the book name "([^"]*)" in the search box$/, async function (bookName) {
    await this.page.locator('#searchBox').fill(bookName);
});

Then(/^I should see the book "([^"]*)" in the first row$/, async function (bookName) {
    const firstRowBook = this.page.locator('.rt-tbody .rt-tr-group').first().locator('a');
    await expect(firstRowBook).toHaveText(bookName);
});