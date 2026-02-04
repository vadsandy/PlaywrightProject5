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
                        import hudson.model.*
                        import hudson.FilePath

                        def list = []
                        try {
                            // 1. Get the current job and its workspace
                            def job = Jenkins.instance.getItemByFullName(projectName)
                            // 2. Access the workspace path directly through the Jenkins API
                            def workspace = job.getLastBuild().getWorkspace()
                            def featureDir = new FilePath(workspace, "src/features")

                            if (featureDir.exists()) {
                                featureDir.list().each { file ->
                                    if (file.getName().endsWith(".feature")) {
                                        list.add(file.getName())
                                    }
                                }
                            }
                        } catch (Exception e) {
                            return ["Build the project once to initialize workspace"]
                        }
                        return list.isEmpty() ? ["No features found"] : list.sort()
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
                    usernamePassword(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', 
                                    usernameVariable: 'U_VAL', passwordVariable: 'P_VAL')
                ]) {
                    script {
                        // Ensure tags are cleaned
                        def rawTags = params.TAGS ?: "@UI"
                        def tagExpression = rawTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                        
                        withEnv([
                            "TARGET_ENV=${params.ENVIRONMENT}", 
                            "DB_USER=" + U_VAL,      // Concatenation is safer in some Jenkins versions
                            "DB_PASSWORD=" + P_VAL, 
                            "DB_SERVER=localhost"
                        ]) {
                            // Use double quotes for the whole string so tagExpression is injected
                            bat "npx cucumber-js src/features/*.feature --tags \"${tagExpression}\" --format progress"
                        }
                    }
                }
            }
        }
    }
    post { always { allure results: [[path: 'allure-results']] } }
}