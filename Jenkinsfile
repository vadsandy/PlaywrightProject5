pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select environment')
        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Run Headless')
        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['@UI', '@SMOKE', '@REGRESSION', '@SQL', '@JSON', '@EXCEL', '@fireup']"]])
        activeChoice(name: 'BROWSERS', choiceType: 'PT_CHECKBOX', script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['chromium', 'firefox', 'webkit']"]])
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', 
            script: [$class: 'GroovyScript', script: [sandbox: true, script: """
                def list = []
                def featureDir = new File(System.getProperty("user.dir") + "/src/features")
                if(featureDir.exists()){
                    featureDir.eachFile { f -> if(f.name.endsWith('.feature')) list.add(f.name) }
                }
                return list.isEmpty() ? ["No files in: " + featureDir.absolutePath] : list.sort()
            """]])
    }
    stages {
        stage('Install') { steps { bat 'npm install' } }
        stage('Execute Tests') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', usernameVariable: 'U1', passwordVariable: 'SQL_USER_VAL'),
                    usernamePassword(credentialsId: '7d5ee55f-78fc-42d3-82de-06c20e33dd94', usernameVariable: 'U2', passwordVariable: 'SQL_PASS_VAL')
                ]) {
                    script {
                        def tagExpression = (params.TAGS ?: "@UI").replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        withEnv(["TARGET_ENV=${params.ENVIRONMENT}", "BROWSER=chromium", "HEADLESS=${params.HEADLESS}", "DB_USER=${SQL_USER_VAL}", "DB_PASSWORD=${SQL_PASS_VAL}"]) {
                            bat "npx cucumber-js --tags \"${tagExpression}\" src/features || exit 0"
                        }
                    }
                }
            }
        }
    }
    post { always { allure results: [[path: 'allure-results']] } }
}