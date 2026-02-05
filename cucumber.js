module.exports = {
    default: {
        // Path to your feature files
        paths: ['src/features/**/*.feature'],

        // Path to your step definitions and hooks
        require: ['src/step_definitions/**/*.js', 'src/support/**/*.js'],

        // Formatting for the terminal and Allure
        format: [
            'progress',
            'summary',
            'json:reports/cucumber_report.json',
            'html:reports/cucumber-report.html', 
            'allure-cucumberjs/reporter'
        ],
        // Letting the environment/command line control the output directory 
        // ensures Jenkins captures the data correctly.
        parallel: 1,
        publishQuiet: true
    }
}