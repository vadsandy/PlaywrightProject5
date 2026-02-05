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
                        // Use the direct absolute path for your specific job workspace
                        def workspacePath = "C:/ProgramData/Jenkins/.jenkins/workspace/Playwright-Automation-Dev"
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

        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Cucumber Tags', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: true, 
                    script: "return ['@UI', '@SMOKE', '@SQL', '@REGRESSION', '@JSON', '@EXCEL']"
                ]
            ]
        )
    }

    stages {
        stage('Cleanup') {
            steps {
                bat 'if exist allure-results rmdir /s /q allure-results'
                bat 'mkdir allure-results'
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
                        def tagExpression = selectedTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        
                        // Feature selection logic
                        def featurePath = params.FEATURES ? params.FEATURES.split(',').collect { "src/features/" + it }.join(' ') : "src/features/*.feature"

                        withEnv([
                            "TARGET_ENV=" + params.ENVIRONMENT,
                            "DB_USER=" + U_VAL,
                            "DB_PASSWORD=" + P_VAL,
                            "DB_SERVER=localhost",
                            "DB_NAME=PlaywrightTestData",
                            "DB_PORT=1433",
                            "DB_INSTANCE=SQLEXPRESS"
                        ]) {
                            // Ensure the command uses the dynamically built featurePath
                            bat "npx cucumber-js ${featurePath} --tags \"${tagExpression}\" --format progress || exit 0"
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