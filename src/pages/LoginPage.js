const {envConfig} = require('../config/envConfig');

class LoginPage {
    constructor(page) {
        this.page = page;
        // Using locator() with CSS IDs is the most reliable way for DemoQA
        this.usernameInput = page.locator('#userName');
        this.passwordInput = page.locator('#password');
        this.loginBtn = page.locator('#login');
        
        // The logout button ID is actually 'submit' but specifically on the Profile page
        // We use text filtering to be safe
        this.logoutBtn = page.getByRole('button', { name: 'Log out' });
        
        this.errorMessage = page.locator('#name')

    }

    async navigate(path = '/login') { // Added default path parameter
        const rawEnv = process.env.TARGET_ENV || 'Production';
        let env = 'Production';
        if (rawEnv.toLowerCase() === 'qa') env = 'QA';
        // ... rest of your normalization logic ...

        const config = envConfig[env];
        const targetUrl = `${config.webUrl}${path}`; // Use the dynamic path
        console.log(`Navigating to: ${targetUrl} (Environment: ${env})`);

        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000});
    }
    // --- Granular Methods (Micro) ---
    async enterUsername(user) {
        await this.usernameInput.fill(user);
    }

    async enterPassword(password) {
        await this.passwordInput.fill(password);
    }

    async clickLogin() {
        //Promise all ensures we are waiting for the navigation
        //And click the button at the same time
        await Promise.all([
            this.page.waitForURL('**/profile', {waitUntil: 'domcontentloaded', timeout: 15000}), //wait for URL to contain profile
            this.loginBtn.click({force: true})
        ]);

    }

    // --- Whole Function (Macro/Wrapper) ---
    async performFullLogin(user, password){
        await this.enterUsername(user);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    //Goto login page and login
    async gotoLoginPageAndLogin(user, password) {
        await this.navigate();
        await this.performFullLogin(user, password);

    }
}
module.exports = {LoginPage};
