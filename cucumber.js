module.exports = {
    default: {
        // Path to your feature files
        paths: ['src/features/**/*.feature'],

        // Path to your step definitions and hooks
        require: ['src/step_definitions/**/*.js', 'src/support/**/*.js'],

        // Formatting for the terminal and Allure
        format: [
            'progress-bar',
            'summary',
            'json:reports/cucumber_report.json',
            'html:reports/cucumber-report.html', // Basic HTML backup
            'allure-cucumberjs/reporter'
        ],
        formatOptions: {
            resultsDir: 'allure-results'
        },
        parallel: 1,
        publishQuiet: true

    }
}