const {envConfig} = require('../config/envConfig');

class ProfilePage {
    constructor (page) {
        this.page = page;
        this.logoutBtn = page.getByRole('button', { name: 'Log out' });
        this.gotoBookStoreBtn = page.getByRole('button', {name: 'Go To Book Store'});
        this.deleteAccountBtn = page.getByRole('button', {name: 'Delete Account'});
        this.deleteAllBooksbtn = page.getByRole('button', {name: 'Delete All Books'});
        this.searchBox = page.locator('#searchBox');
    }

    async logout() {
        await this.logoutBtn.click();
    }

    async gotoBookStore() {
        await this.gotoBookStoreBtn.click();
    }

    async deleteAccount() {
        await this.deleteAccountBtn.click();
    }

    async deleteAllBooks() {
        await this.deleteAllBooksbtn.click();
    }

}