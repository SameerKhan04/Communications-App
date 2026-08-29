# Communciations App for Uni Students

CI/CD:
Build and start the Jenkins CI/CD container:
cd into jenkins-infra
docker compose up -d --build jenkins
Retrieve the initial Jenkins Admin Password:
docker exec -it jenkins-controller cat /var/jenkins_home/secrets/initialAdminPassword
set up a pipeline that points to jenkinsfile and enable webhook.
