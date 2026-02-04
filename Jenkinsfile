pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select environment')
        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Run Headless')
        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['@UI', '@SMOKE', '@REGRESSION', '@SQL', '@JSON', '@EXCEL', '@fireup']"]])
        activeChoice(name: 'BROWSERS', choiceType: 'PT_CHECKBOX', script: [$class: 'GroovyScript', script: [sandbox: true, script: "return ['chromium', 'firefox', 'webkit']"]])
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features', 
            script: [
                $class: 'GroovyScript', 
                script: [
                    sandbox: true, 
                    script: """
                        // We use the Windows DIR command to find files - Jenkins Sandbox allows this
                        def command = "cmd /c dir /b C:\\\\ProgramData\\\\Jenkins\\\\.jenkins\\\\workspace\\\\oject5-Automation-Suite_dev-test\\\\src\\\\features\\\\*.feature"
                        try {
                            def process = command.execute()
                            process.waitFor()
                            def output = process.in.text.readLines()
                            return output.isEmpty() ? ["No features found at path"] : output.sort()
                        } catch (Exception e) {
                            return ["Error executing dir command: " + e.message]
                        }
                    """
                ]
            ]
        )
    }
    stages {
        stage('Install') { steps { bat 'npm install' } }
        stage('Execute Tests') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', usernameVariable: 'SQL_USER_VAL', passwordVariable: 'SQL_PASS_VAL'),
                    usernamePassword(credentialsId: '7d5ee55f-78fc-42d3-82de-06c20e33dd94', usernameVariable: 'SQL_USER_VAL2', passwordVariable: 'SQL_PASS_VAL2')
                ]) {
                    script {
                        def tagExpression = (params.TAGS ?: "@UI").replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        
                        withEnv([
                            "TARGET_ENV=${params.ENVIRONMENT}", 
                            "BROWSER=chromium", 
                            "HEADLESS=${params.HEADLESS}",
                            "DB_USER=${SQL_USER_VAL}",      // Ensure your DataReader uses DB_USER
                            "DB_PASSWORD=${SQL_PASS_VAL}"  // Ensure your DataReader uses DB_PASSWORD
                        ]) {
                            bat "npx cucumber-js src/features/*.feature --tags \"${tagExpression}\" --format progress"
                        }
                    }
                }
            }
        }
    }
    post { always { allure results: [[path: 'allure-results']] } }
}