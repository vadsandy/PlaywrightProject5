const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { DataReader } = require('../utils/DataReader');
const { LoginPage } = require('../pages/LoginPage');

// Use anchors ^ and $ to ensure NO overlap
Given(/^I navigate to the login page$/, async function() {
    this.loginPage = new LoginPage(this.page);
    // Ensure this navigate() method in LoginPage.js doesn't have a hardcoded URL log
    await this.loginPage.navigate();
});

When(/^I enter username "([^"]*)" and password "([^"]*)"$/, async function (user, pass){
    await this.loginPage.enterUsername(user);
    await this.loginPage.enterPassword(pass);
});

When(/^I click the login button$/, async function(){
    await this.loginPage.clickLogin();
});

Then(/^I should see a logout button$/, async function(){
    await expect(this.loginPage.logoutBtn).toBeVisible({ timeout: 5000 });
});