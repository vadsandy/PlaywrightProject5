pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'QA', 'Staging'], description: 'Target Test Environment')
        
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features to Run', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: false, 
                    script: """
                        def list = []
                        // This path changes because we are now using a dedicated Agent folder
                        def workspacePath = "C:/JenkinsAgent/workspace/\${env.JOB_NAME}"
                        def featureDir = new File(workspacePath + "/src/features")
                        
                        if(featureDir.exists()){
                            featureDir.eachFile { f -> 
                                if(f.name.endsWith('.feature')) list.add(f.name) 
                            }
                        }
                        return list.sort() ?: ["No features found - Run build once to sync code"]
                    """
                ]
            ]
        )

        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Tags', 
            script: [
                $class: 'GroovyScript', 
                script: [sandbox: true, script: "return ['@UI', '@SMOKE', '@SQL', '@REGRESSION']"]
            ]
        )

        booleanParam(name: 'HEADLESS_MODE', defaultValue: true, description: 'Run Headless (Uncheck to see browser)')
    }

    stages {
        stage('Cleanup') {
            steps {
                echo "Cleaning up results directory..."
                bat """
                    if exist allure-results rmdir /s /q allure-results
                    if exist reports rmdir /s /q reports
                    mkdir allure-results
                    mkdir reports
                """
            }
        }

        stage('Install') {
            steps {
                bat 'npm install'
            }
        }

        stage('Execute Tests') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'db_credentials', 
                                     usernameVariable: 'U_VAL', passwordVariable: 'P_VAL')
                ]) {
                    script {
                        def selectedTags = params.TAGS ?: "@UI"
                        //def tagExpression = selectedTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        def tagExpression = (params.TAGS ?: "@UI").replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        def featureFiles = params.FEATURES ? params.FEATURES.split(',').collect { "src/features/" + it }.join(' ') : "src/features/*.feature"
                        
                        def headlessVal = params.HEADLESS_MODE ? "true" : "false"

                        // ALLURE_RESULTS_DIR tells the reporter exactly where to save JSON files
                        withEnv([
                            "TARGET_ENV=" + params.ENVIRONMENT,
                            "DB_USER=" + U_VAL,
                            "DB_PASSWORD=" + P_VAL,
                            "DB_SERVER=localhost",
                            "DB_NAME=PlaywrightTestData",
                            "DB_PORT=1433",
                            "DB_INSTANCE=SQLEXPRESS",
                            "HEADLESS=" + headlessVal,
                            "BROWSER=chromium",
                            "ALLURE_RESULTS_DIR=allure-results"
                        ]) {
                            echo "Running ${featureFiles} | Headless: ${headlessVal}"
                            bat "npx cucumber-js ${featureFiles} --tags \"${tagExpression}\" --format progress --format allure-cucumberjs/reporter || exit 0"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            allure results: [[path: 'allure-results']]
        }
    }
}