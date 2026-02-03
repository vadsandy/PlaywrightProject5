pipeline {
    agent any

    parameters {
        //1. Single selection for Environment
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select the environment (Defauults to production)')

        // HEADLESS TOGGLE: True by default for Jenkins performance
        booleanParam(name: 'HEADLESS', defaultValue: true, 'Check to run without browser window (Headless mode)')

        // 2. Multiple Selection for Tags (Requires Extended Choice Plugin)
        // If you don't have the plugin, use: string(name: 'TAGS', defaultValue: '@fireup', description: 'Enter tags e.g. @Smoke or @Regression')
        extendedChoice(name: 'TAGS', type: 'PT_CHECKBOX', value: '@fireup, @JSON, @EXCEL, @SQL, @UI, @SMOKE, @REGRESSION', description: 'Select one or more tags')

        // 3 Multiple Selection for Browsers
        extendedChoice(name: 'BROWSERS', type: 'PT_CHECKBOX', value: 'chromium, firefox, webkit', description: 'Select browsers to test on')

        // 4. Multiple Selection for Feature Files
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Feature files to run', 
            script: groovyScript (
                script: """
                    import groovy.io.FileType
                    def list = []
                    def dir = new File(jenkins.model.Jenkins.instance.getWorkspaceFor(currentJob) + "/src/features")
                    dir.eachFileRecurse(FileType.FILES) { file ->
                        if(file.name.endsWith('.feature')) {
                            //Return the path to relative feature folder
                            list.add(file.path.split('features/')[1])
                        } 
                    }
                    return list.sort()
                """
            )
        )

    }

    tools {
        nodejs "node" //Ensure Node.js is configured in Jenkins Global Tool Configuration
    }

    stages {
        stage ('Checkout') {
            steps {
                checkout scm
            }
        }

        stage ('Install Dependencies') {
            steps {
                script {
                    //check if node_modules exists
                    def exists = fileExists 'node_modules'
                    if (!exists) {
                        echo "Dependencies not found. Installing..."
                        sh 'npm install'
                    } else {
                        echo "node_modules exists. Skipping install to save time."
                    }
                }
            }
        }

        stage ('Execute Playwright Tests') {
            steps {
                script {
                    // Injecting parameters into the command
                    // We join multiple tags with 'or' for Cucumber
                    def tagExpression = params.TAGS.replaceAll(',', ' or ')
                    // 2. Prepare Feature Paths
                    // We prefix each selection with the base folder path
                    def featurePaths = params.FEATURES.split(',').collect {"src/features/${it}"}.join(' ')
                    def browserList = params.BROWSERS.split(',')

                    // Loop through each selected browser
                    for (browser in browserList) {
                        echo "Running test on ${browser} in ${params.ENVIRONMENT} environment"

                        // Pass parameters as Environment Variables to your code
                        withEnv(["TARGET_ENV=${params.ENVIRONMENT}", "BROWSER=${browser}"]) {
                            sh "npx cucumber-js --tags '${tagExpression}' ${featurePaths} || true"
                        }
                    }
                }
            }
        }

        stage ('Prepare Report Metadata') {
            steps {
                script {
                    def props = """
                    Browser = Chromium
                }
            }
        }


    }

    post {
        always {
            // Dynamically create the environment.properties for Allure
            script {
                def props = "Environment=${params.ENVIRONMENT}\nBrowsers=${params.BROWSERS}\nTags=${params.TAGS}\nHeadless=${params.HEADLESS}\nBuild=${env.BUILD_NUMBER}"
                writeFile file: 'allure-results/environment.properties', text: props
            }
            allure includeProperties: false, results: [[path: 'allure-results']]
        }
    }
}