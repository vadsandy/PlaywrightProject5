pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select environment')
        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Check to run without browser window')
        
        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Tags',
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true, 
                    script: "return ['@fireup', '@JSON', '@EXCEL', '@SQL', '@UI', '@SMOKE', '@REGRESSION']"
                ]
            ]
        )

        activeChoice(name: 'BROWSERS', choiceType: 'PT_CHECKBOX', description: 'Select Browsers',
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true, 
                    script: "return ['chromium', 'firefox', 'webkit']"
                ]
            ]
        )

        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features', 
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true, 
                    script: """
                        import groovy.io.FileType
                        def list = []
                        def workspace = jenkins.model.Jenkins.instance.getWorkspaceFor(currentJob)
                        def dir = new File(workspace.toString() + "/src/features")
                        if(dir.exists()){
                            dir.eachFileRecurse(FileType.FILES) { file ->
                                if(file.name.endsWith('.feature')) {
                                    list.add(file.path.split('features/')[1])
                                }
                            }
                        }
                        return list.sort()
                    """
                ]
            ]
        )
    }

    tools { nodejs "node" }

    stages {
        stage('Checkout') { steps { checkout scm } }
        
        stage('Install') {
            steps {
                script {
                    if (!fileExists('node_modules')) {
                        // Change 'sh' to 'bat' for Windows
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Execute Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'b1d7d9ef-d63d-4a56-888b-107002590d90', variable: 'SQL_USER_VAL'),
                    string(credentialsId: '7d5ee55f-78fc-42d3-82de-06c20e33dd94', variable: 'SQL_PASS_VAL')
                ]) {
                    script {
                        def tagExpression = params.TAGS.replaceAll(',', ' or ')
                        // Use double quotes and careful escaping for Windows paths
                        def featurePaths = params.FEATURES.split(',').collect {"src/features/${it}"}.join(' ')
                        def browserList = params.BROWSERS.split(',')
                        
                        for (browser in browserList) {
                            withEnv([
                                "TARGET_ENV=${params.ENVIRONMENT}", 
                                "BROWSER=${browser.trim()}", 
                                "HEADLESS=${params.HEADLESS}",
                                "DB_USER=${SQL_USER_VAL}",
                                "DB_PASSWORD=${SQL_PASS_VAL}"
                            ]) {
                                def headlessFlag = params.HEADLESS ? "--headless" : ""
                                // Change 'sh' to 'bat' here as well
                                bat "npx cucumber-js --tags \"${tagExpression}\" ${featurePaths} ${headlessFlag} || exit 0"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // FIX 3: Removed extra backslashes that can cause issues in Windows Jenkins
                def props = "Browser=${params.BROWSERS}\nEnvironment=${params.ENVIRONMENT}"
                writeFile file: 'allure-results/environment.properties', text: props
            }
            allure includeProperties: false, results: [[path: 'allure-results']]
        }
    }
}