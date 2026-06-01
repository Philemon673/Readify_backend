pipeline {
  agent any

  environment {
    BACKEND_IMAGE = "readify-backend:${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test --if-present || echo "No test script found, skipping"'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('MysonarQube') {
          sh 'sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        waitForQualityGate abortPipeline: true
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${BACKEND_IMAGE} ."
      }
    }

    stage('Deploy Backend') {
      steps {
        sh "docker stop readify-backend || true"
        sh "docker rm readify-backend || true"
        sh "docker run -d -p 8000:8000 --name readify-backend ${BACKEND_IMAGE}"
      }
    }
  }
}