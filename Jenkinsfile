pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'QA', 'Staging'], description: 'Target Test Environment')
        
        // Dynamic Feature Selection (Requires 'sandbox: false' and Script Approval)
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features to Run', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: false, 
                    script: """
                        def list = []
                        // In a standard pipeline, we can access the workspace folder directly
                        def workspacePath = "C:/ProgramData/Jenkins/.jenkins/workspace/\${env.JOB_NAME}"
                        def featureDir = new File("\${workspacePath}/src/features")
                        
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

        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Cucumber Tags', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: true, 
                    script: "return ['@UI', '@SMOKE', '@SQL', '@REGRESSION', '@JSON', '@EXCEL']"
                ]
            ]
        )

        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Run browser in headless mode')
    }

    stages {
        stage('Cleanup') {
            steps {
                echo "Cleaning up previous test results..."
                // Removes the allure-results folder entirely to prevent data mixing
                bat """
                    if exist allure-results (
                        rmdir /s /q allure-results
                    )
                    mkdir allure-results
                """
            }
        }

        stage('Install') {
            steps {
                echo "Installing dependencies..."
                bat 'npm install'
            }
        }

        stage('Execute Tests') {
            steps {
                // Ensure your Credential ID is 'db_credentials' in Jenkins
                withCredentials([
                    usernamePassword(credentialsId: 'db_credentials', 
                                     usernameVariable: 'U_VAL', passwordVariable: 'P_VAL')
                ]) {
                    script {
                        // 1. Process Tag Selection
                        def selectedTags = params.TAGS ?: "@UI"
                        def tagExpression = selectedTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')

                        // 2. Process Feature Selection
                        def featurePath = params.FEATURES ? params.FEATURES.split(',').collect { "src/features/" + it }.join(' ') : "src/features/*.feature"

                        echo "Executing: ${featurePath} with tags: ${tagExpression}"

                        // 3. Environment Variable Injection (Matching your local .env keys)
                        withEnv([
                            "TARGET_ENV=" + params.ENVIRONMENT,
                            "DB_USER=" + U_VAL,
                            "DB_PASSWORD=" + P_VAL,
                            "DB_SERVER=localhost",
                            "DB_NAME=PlaywrightTestData",
                            "DB_PORT=1433",
                            "DB_INSTANCE=SQLEXPRESS",
                            "HEADLESS=${params.HEADLESS}",
                            "BROWSER=chromium"
                        ]) {
                            // Using || exit 0 to ensure the pipeline proceeds to generate Allure even if tests fail
                            bat "npx cucumber-js ${featurePath} --tags \"${tagExpression}\" --format progress || exit 0"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Generating Allure Report..."
            allure results: [[path: 'allure-results']]
        }
    }
}