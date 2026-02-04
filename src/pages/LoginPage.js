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

    async navigate() {
        // 1. Get raw env from process
        const rawEnv = process.env.TARGET_ENV || 'Production';
        
        // 2. Normalize it (e.g., if Jenkins sends 'qa', change to 'QA')
        // We match it against our keys: Production, QA, Staging
        let env = 'Production';
        if (rawEnv.toLowerCase() === 'qa') env = 'QA';
        if (rawEnv.toLowerCase() === 'staging') env = 'Staging';
        if (rawEnv.toLowerCase() === 'production') env = 'Production';

        // 3. Select the config
        const config = envConfig[env];

        if (!config) {
            throw new Error(`Environment config for "${env}" not found! Check envConfig.js`);
        }

        const targetUrl = `${config.webUrl}/login`;
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
}
module.exports = {LoginPage};
