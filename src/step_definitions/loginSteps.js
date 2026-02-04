const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {DataReader} = require('../utils/DataReader');
const {LoginPage} = require('../pages/LoginPage');

Given('I navigate to the login page', async function() {
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.navigate();
});

// --- DATA INPUT STEPS ---
When('I enter username {string} and password {string}', async function (user, pass){
    await this.loginPage.enterUsername(user);
    await this.loginPage.enterPassword(pass);
});

When('I enter username and password from {string} and key {string}', async function(path, key) {
    const data = await DataReader.getJsonData(path, key);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

When('I enter username and password from {string} in {string} with key {string}', async function(path, sheet, key){
    const data = await DataReader.getExcelData(path, sheet, key);
    await this.loginPage.enterUsername(data.username.toString());
    await this.loginPage.enterPassword(data.password.toString());
});

When('I enter username and password from {string}', async function(query){
    const data = await DataReader.getSqlData(query);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

// --- ACTION STEPS ---
// This single definition covers both "When" and "Then" usage in feature files
When('I click the login button', async function(){
    await this.loginPage.clickLogin();
});

// --- ASSERTION ---
Then('I should see a logout button', async function(){
    // It is better to check visibility first before text to avoid race conditions
    await expect(this.loginPage.logoutBtn).toBeVisible({ timeout: 5000 });
    await expect(this.loginPage.logoutBtn).toHaveText('Log out');
});