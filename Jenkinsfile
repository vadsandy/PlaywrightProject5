pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['Production', 'Staging', 'QA', 'Dev'], description: 'Select environment')
        booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Check to run without browser window')
        activeChoice(name: 'TAGS', choiceType: 'PT_CHECKBOX', description: 'Select Tags',
            script: groovyScript(script: "return ['@fireup', '@JSON', '@EXCEL', '@SQL', '@UI', '@SMOKE', '@REGRESSION']"))
        activeChoice(name: 'BROWSERS', choiceType: 'PT_CHECKBOX', description: 'Select Browsers',
            script: groovyScript(script: "return ['chromium', 'firefox', 'webkit']"))
        activeChoice(name: 'FEATURES', choiceType: 'PT_CHECKBOX', description: 'Select Features', 
            script: groovyScript(
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
            )
        )
    }
    tools { nodejs "node" }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Install') {
            steps {
                script {
                    if (!fileExists('node_modules')) {
                        sh 'npm install'
                    }
                }
            }
        }
        stage('Execute Tests') {
            steps {
                script {
                    def tagExpression = params.TAGS.replaceAll(',', ' or ')
                    def featurePaths = params.FEATURES.split(',').collect {"src/features/\${it}"}.join(' ')
                    def browserList = params.BROWSERS.split(',')
                    for (browser in browserList) {
                        withEnv(["TARGET_ENV=\${params.ENVIRONMENT}", "BROWSER=\${browser.trim()}", "HEADLESS=\${params.HEADLESS}"]) {
                            sh "npx cucumber-js --tags '\${tagExpression}' \${featurePaths} || true"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                def props = "Browser=\${params.BROWSERS}\\nEnvironment=\${params.ENVIRONMENT}"
                writeFile file: 'allure-results/environment.properties', text: props
            }
            allure includeProperties: false, results: [[path: 'allure-results']]
        }
    }
}