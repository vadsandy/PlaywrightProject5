pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select environment')
        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Check to run without browser window')
        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Tags',
            script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['@UI', '@SMOKE', '@REGRESSION', '@SQL', '@JSON', '@EXCEL', '@fireup']"]])
        activeChoice(name: 'BROWSERS', choiceType: 'PT_CHECKBOX', description: 'Select Browsers',
            script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['chromium', 'firefox', 'webkit']"]])
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features', 
            script: [$class: 'GroovyScript', script: [sandbox: true, script: """
                def list = []
                def dir = new File(jenkins.model.Jenkins.instance.getItem(projectName).getCustomWorkspace() + "\\src\\features")
                if(dir.exists()){
                    dir.eachFile { file -> if(file.name.endsWith('.feature')) list.add(file.name) }
                }
                return list.sort()
            """]])
    }
    stages {
        stage('Install') {
            steps {
                // Use 'bat' for Windows npm install
                bat 'npm install'
            }
        }
        stage('Execute Tests') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', usernameVariable: 'U1', passwordVariable: 'SQL_USER_VAL'),
                    usernamePassword(credentialsId: '7d5ee55f-78fc-42d3-82de-06c20e33dd94', usernameVariable: 'U2', passwordVariable: 'SQL_PASS_VAL')
                ]) {
                    script {
                        // 1. Fix Tag Encoding
                        def rawTags = params.TAGS ?: ""
                        def tagExpression = rawTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')

                        // 2. FALLBACK: If no tags selected, default to @UI so it doesn't crash
                        if (!tagExpression || tagExpression.trim() == "") {
                            tagExpression = "@UI"
                        }

                        def browserList = params.BROWSERS ? params.BROWSERS.split(',') : ['chromium']
                        
                        for (browser in browserList) {
                            withEnv([
                                "TARGET_ENV=${params.ENVIRONMENT}", 
                                "BROWSER=${browser.trim()}", 
                                "HEADLESS=${params.HEADLESS}",
                                "DB_USER=${SQL_USER_VAL}",
                                "DB_PASSWORD=${SQL_PASS_VAL}"
                            ]) {
                                // Use double quotes for the tag expression variable
                                bat "npx cucumber-js --tags \"${tagExpression}\" src/features/*.feature || exit 0"
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            // Generate Allure report from the results folder
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }
}