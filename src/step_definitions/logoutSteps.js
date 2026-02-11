const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {LoginPage} = require('../pages/LoginPage');
const {ProfilePage} = require('../pages/ProfilePage');

Given(/^I enter username "([^"]*)" and password "([^"]*)" on login page and click login button$/, async function(user, password) {
    this.loginPage = new LoginPage(this.page);
    // MUST await this to prevent it from hanging in the background
    await this.loginPage.gotoLoginPageAndLogin(user, password); 
});

When(/^I click on the Logout button$/, async function () {
    this.profilePage = new ProfilePage(this.page);
    await this.profilePage.logout();
});

Then(/^I should be redirected to the login page$/, async function() {
    await expect(this.page).toHaveURL(/login/);
});

Then(/^I should see the "([^"]*)" button to confirm I am out$/, async function(btnName) {
    await expect(this.loginPage.loginBtn).toContainText(btnName);
});