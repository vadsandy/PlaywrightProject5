const envConfig = {
    Production: {
        webUrl: 'https://demoqa.com',
        apiUrl: 'https://api.demoqa.com/v1'
    },
    
    QA: {
        webUrl: 'https://qa.demoqa.com',
        apiUrl: 'https://qa-api.demoqa.com/v1'
    },

    Staging: {
        webUrl: 'https://staging.demoqa.com',
        apiUrl: 'https://staging-api.demoqa.com/v1'
    },
};

// This allows the { envConfig } destructuring in LoginPage.js to work
module.exports = { envConfig };