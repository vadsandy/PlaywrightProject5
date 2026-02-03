const {Given, When, Then, And} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {DataReader} = require('../utils/DataReader');
const {LoginPage} = require('../pages/LoginPage');



Given('I navigate to the login page', async function() {
    //Initialize loginPage using the page from hooks.js
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.navigate();
});

// --- DATA INPUT STEPS ---
When('I enter username {string} and password {string}', async function (user, pass){
    // We use micro-functions here so we can click the button in the NEXT step
    await this.loginPage.enterUsername(user);
    await this.loginPage.enterPassword(pass);
});

//From JSON
When('I enter username and password from {string} and key {string}', async function(path, key) {
    const data = await DataReader.getJsonData(path, key);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

//From Excel
When('I enter username and password from {string} in {string} with key {string}', async function(path, sheet, key){
    const data = await DataReader.getExcelData(path, sheet, key);
    await this.loginPage.enterUsername(data.username.toString());
    await this.loginPage.enterPassword(data.password.toString());
});

//From SQL Database
When('I enter username and password from {string}', async function(query){
    const data = await DataReader.getSqlData(query);
    await this.loginPage.enterUsername(data.username);
    await this.loginPage.enterPassword(data.password);
});

// --- ACTION STEPS ---
When('I click the login button', async function(){
    await this.loginPage.clickLogin();
});

// This handles the slight variation in your SQL scenario wording
Then('I click the login button', async function () {
    await this.loginPage.clickLogin();
});

// --- THE ASSERTION (The most important part!) ---
Then('I should see a logout button', async function(){
    // 1. Assert the button is visible
    // 2. Assert the text is actually "Log out"
    //await expect(this.loginPage.logoutBtn).toBeVisible({timeout:1000});
    await expect(this.loginPage.logoutBtn).toHaveText('Log out');
});




