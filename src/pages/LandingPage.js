const {envConfig} = require('../config/envConfig');

class LandingPage {
    constructor (page){
        this.page = page;
        this.bookStoreAppBtn = page.getByRole('class', {name: 'Book Store Application'});
    }

    async gotoBookStoreApp(){
        await this.bookStoreAppBtn.click();
    }
}

