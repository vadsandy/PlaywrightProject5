const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Matches your existing login navigation pattern
Given('I open the landing page', async function () {
    await this.page.goto('https://demoqa.com/');
});

When('I click on the {string} tile', async function (tileName) {
    // DemoQA cards are h5 elements; scroll ensures it's clickable on small screens
    const tile = this.page.locator(`h5:has-text("${tileName}")`);
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
});

// This follows your existing "URL should contain" pattern
Then('the URL should contain {string}', async function (urlExtension) {
    await expect(this.page).toHaveURL(new RegExp(urlExtension));
});

When('I type the book name {string} in the search box', async function (bookName) {
    await this.page.locator('#searchBox').fill(bookName);
});

Then('I should see the book {string} in the first row', async function (bookName) {
    // Locating the first title link in the result table
    const firstRowBook = this.page.locator('.rt-tbody .rt-tr-group').first().locator('a');
    await expect(firstRowBook).toHaveText(bookName);
});