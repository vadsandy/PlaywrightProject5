module.exports = {
    default: {
        // This 'require' array is what Cucumber actually looks at
        require: [
            'src/step_definitions/**/*.js',
            'src/hooks/hooks.js' // Added explicitly
        ],
        paths: ['src/features/**/*.feature'],
        format: [
            'progress',
            'summary',
            'allure-cucumberjs/reporter'
        ],
        parallel: 1,
        publishQuiet: true
    }
}