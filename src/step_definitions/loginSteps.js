const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { DataReader } = require('../utils/DataReader');
const { LoginPage } = require('../pages/LoginPage');

// Use /^ ... $/ to make the match EXACT
Given(/^I navigate to the login page$/, async function() {
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.navigate();
});

// --- DATA INPUT STEPS ---
// Use capture groups ([^"]*) for parameters in RegEx
When(/^I enter username "([^"]*)" and password "([^"]*)"$/, async function (user, pass) {
    await this.loginPage.enterUsername(user);
    await this.loginPage.enterPassword(pass);
});

When(/^I enter username and password from "([^"]*)" and key "([^"]*)"$/, async function(path, key) {
    const data = await DataReader.getJsonData(path, key);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

When(/^I enter username and password from "([^"]*)" in "([^"]*)" with key "([^"]*)"$/, async function(path, sheet, key) {
    const data = await DataReader.getExcelData(path, sheet, key);
    await this.loginPage.enterUsername(data.username.toString());
    await this.loginPage.enterPassword(data.password.toString());
});

When(/^I enter username and password from "([^"]*)"$/, async function(query) {
    const data = await DataReader.getSqlData(query);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

// --- ACTION STEPS ---
When(/^I click the login button$/, async function() {
    await this.loginPage.clickLogin();
});

// --- ASSERTION ---
Then(/^I should see a logout button$/, async function() {
    await expect(this.loginPage.logoutBtn).toBeVisible({ timeout: 5000 });
    await expect(this.loginPage.logoutBtn).toHaveText('Log out');
});