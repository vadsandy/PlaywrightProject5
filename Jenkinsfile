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
                        def list = []
                        // This targets the specific folder on your C: drive directly
                        def featureDir = new File("C:/ProgramData/Jenkins/.jenkins/workspace/oject5-Automation-Suite_dev-test/src/features")
                        
                        if(featureDir.exists()){
                            featureDir.eachFile { file ->
                                if(file.name.endsWith('.feature')) list.add(file.name)
                            }
                            return list.sort()
                        }
                        return ["Folder not found at: " + featureDir.absolutePath]
                    """
                ]
            ]
        )
    }
    stages {
        stage('Install') { steps { bat 'npm install' } }
        stage('Execute Tests') {
            steps {
                script {
                    // Clean tags: default to @UI if nothing is selected
                    def selectedTags = params.TAGS ?: "@UI"
                    def tagExpression = selectedTags.replaceAll('&#64;', '@').replaceAll(',', ' or ')
                    
                    // Clean features: default to all if nothing selected
                    def selectedFeatures = params.FEATURES ? params.FEATURES.split(',').join(' src/features/') : '*.feature'
                    def featurePath = "src/features/" + selectedFeatures

                    withEnv([
                        "TARGET_ENV=${params.ENVIRONMENT}", 
                        "BROWSER=chromium", 
                        "HEADLESS=${params.HEADLESS}"
                    ]) {
                        // We use double quotes to allow Groovy variable interpolation
                        bat "npx cucumber-js ${featurePath} --tags \"${tagExpression}\" --format progress"
                    }
                }
            }
        }
    }
    post { always { allure results: [[path: 'allure-results']] } }
}