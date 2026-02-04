pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'QA', 'Staging'], description: 'Target Test Environment')
        
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features to Run', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: false, // MANDATORY: Uncheck the Sandbox box in the UI as well
                    script: """
                        import groovy.io.FileType
                        def list = []
                        // Get the absolute workspace path for this specific job
                        def workspacePath = jenkins.model.Jenkins.instance.getJob(env.JOB_NAME).lastBuild.workspace.remote
                        def featureDir = new File(workspacePath + "/src/features")
                        
                        if(featureDir.exists()){
                            featureDir.eachFile(FileType.FILES) { f -> 
                                if(f.name.endsWith('.feature')) list.add(f.name) 
                            }
                        }
                        return list.sort() ?: ["No features found - Ensure Build #1 ran to sync code"]
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