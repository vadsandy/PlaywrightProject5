const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {DataReader} = require('../utils/DataReader');
const {LoginPage} = require('../pages/LoginPage');
const {ProfilePage} = require('../pages/ProfilePage');

Given ('I enter username {string} and password {string} on login page and click login button', async function(){
    this.loginPage = new LoginPage(this.page);
    this.loginPage.gotoLoginPageAndLogin(user, password);
});
        

When ('I click on the Logout button', async function (){
    this.profilePage = new ProfilePage(this.page);
    this.profilePage.logout();
});

        
Then ('I should be redirected to the login page', async function() {
    await expect(this.page).toHaveURL(/login/);
});
        

Then ('I should see the "Login" button to confirm I am out', async function() {
    //this.loginPage = new LoginPage(this.page);
    await expect(this.loginPage.loginBtn).toContainText('Login');
}); 