pipeline {
    agent { label 'UI-Agent' }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'QA', 'Staging'], description: 'Target Test Environment')
        
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: false, 
                    script: """
                        def list = []
                        // Use the built-in Jenkins variable for the current job's workspace
                        def workspace = jenkins.model.Jenkins.instance.getItem(env.JOB_NAME).lastBuild.workspace
                        
                        if (workspace != null && workspace.exists()) {
                            // This finds all .feature files inside src/features/
                            def featurePath = workspace.child("src/features")
                            if (featurePath.exists()) {
                                featurePath.list().each { file ->
                                    if (file.name.endsWith(".feature")) {
                                        list.add(file.name)
                                    }
                                }
                            }
                        }
                        return list.sort() ?: ["No features found - Run Build #1 to sync code"]
                    """
                ]
            ]
        )

        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Tags', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: true, 
                    script: "return ['@UI', '@SMOKE', '@SQL', '@REGRESSION', '@JSON', '@EXCEL']"
                ]
            ]
        )

        booleanParam(name: 'HEADLESS_MODE', defaultValue: false, description: 'Uncheck to see browser')
    }

    stages {
        stage('Cleanup') {
            steps {
                bat 'if exist allure-results del /q allure-results\\*'
                bat 'if exist reports rmdir /s /q reports && mkdir reports'
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
                    usernamePassword(credentialsId: 'db_credentials', usernameVariable: 'U_VAL', passwordVariable: 'P_VAL')
                ]) {
                    script {
                        // Decode the &#64; to @ manually just in case
                        def rawTags = params.TAGS ?: "@UI"
                        def tagExpression = rawTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        
                        def featureFiles = params.FEATURES ? params.FEATURES.split(',').collect { "src/features/" + it }.join(' ') : "src/features/*.feature"
                        def headlessVal = params.HEADLESS_MODE ? "true" : "false"

                        withEnv([
                            "TARGET_ENV=" + params.ENVIRONMENT,
                            "DB_USER=" + U_VAL,
                            "DB_PASSWORD=" + P_VAL,
                            "DB_SERVER=localhost",
                            "DB_NAME=PlaywrightTestData",
                            "DB_PORT=1433",
                            "DB_INSTANCE=SQLEXPRESS",
                            "HEADLESS=" + headlessVal,
                            "ALLURE_RESULTS_DIR=allure-results"
                        ]) {
                            echo "Agent: \${env.NODE_NAME} | Tags: \${tagExpression} | Headless: \${headlessVal}"
                            bat "npx cucumber-js \${featureFiles} --tags \"\${tagExpression}\" --format progress --format allure-cucumberjs/reporter || exit 0"
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