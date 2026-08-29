pipeline {
    agent any

    environment {
        // Unique image tag using the current Jenkins build number
        TEST_IMAGE = "fastapi-app-test:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build App Docker Image') {
            steps {
                script {
                    // Jenkins calls Docker CLI to build the app container
                    sh "docker build -f backend/Dockerfile -t ${TEST_IMAGE} backend/"
                }
            }
        }

        stage('Run Pytest Container') {
            steps {
                script {
                    // Executes pytest inside the isolated container and cleans up on exit (--rm)
                    sh "docker run --rm ${TEST_IMAGE} pytest -v"
                }
            }
        }
    }

    post {
        always {
            // Remove the temporary build image from host daemon to conserve disk space
            sh "docker rmi ${TEST_IMAGE} || true"
        }
        success {
            echo 'All tests passed successfully!'
        }
        failure {
            echo 'Pytest failed. Check logs above.'
        }
    }
}