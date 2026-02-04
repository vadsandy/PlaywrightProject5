pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                bat 'npm install'
            }
        }
        stage('Execute Tests') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', 
                                     usernameVariable: 'U1', passwordVariable: 'SQL_USER_VAL'),
                    usernamePassword(credentialsId: '7d5ee55f-78fc-42d3-82de-06c20e33dd94', 
                                     usernameVariable: 'U2', passwordVariable: 'SQL_PASS_VAL')
                ]) {
                    script {
                        // Fix HTML encoding from UI and handle multiple selections
                        def tagExpression = params.TAGS.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        def browserList = params.BROWSERS.split(',')
                        
                        for (browser in browserList) {
                            withEnv([
                                "TARGET_ENV=${params.ENVIRONMENT}", 
                                "BROWSER=${browser.trim()}", 
                                "HEADLESS=${params.HEADLESS}",
                                "DB_USER=${SQL_USER_VAL}",
                                "DB_PASSWORD=${SQL_PASS_VAL}"
                            ]) {
                                // We use params.FEATURES directly as passed from the UI
                                bat "npx cucumber-js --tags \"${tagExpression}\" src/features/${params.FEATURES}"
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }
}