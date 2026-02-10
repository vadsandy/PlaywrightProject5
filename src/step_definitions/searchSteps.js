const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ANCHORED: This ensures it doesn't match any other navigation steps
Given(/^I open the landing page$/, async function () { 
    console.log("!!! SEARCH HOOK TRIGGERED !!!");
    // Using the base URL directly to avoid the hardcoded /login in your Page class
    await this.page.goto('https://demoqa.com/', { waitUntil: 'domcontentloaded' }); 
});

// ANCHORED: Matches "I click on the 'Book Store Application' tile"
When(/^I click on the "([^"]*)" tile$/, async function (tileName) {
    // DemoQA cards are h5 elements inside .card-body
    const tile = this.page.locator(`h5:has-text("${tileName}")`);
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
});

// ANCHORED: Verifies partial URL matches like /books
Then(/^the URL should contain "([^"]*)"$/, async function (urlExtension) {
    await expect(this.page).toHaveURL(new RegExp(urlExtension));
});

// ANCHORED: Fills the search box
When(/^I type the book name "([^"]*)" in the search box$/, async function (bookName) {
    const searchBox = this.page.locator('#searchBox');
    await searchBox.fill(bookName);
});

// ANCHORED: Final verification of the table result
Then(/^I should see the book "([^"]*)" in the first row$/, async function (bookName) {
    // Locating the first title link in the result table (DemoQA React Table)
    const firstRowBook = this.page.locator('.rt-tbody .rt-tr-group').first().locator('a');
    await expect(firstRowBook).toHaveText(bookName);
});