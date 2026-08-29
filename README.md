# Communciations App for Uni Students

Build and start the Jenkins CI/CD container:
cd into jenkins-infra
docker compose up -d --build jenkins
Retrieve the initial Jenkins Admin Password:
docker exec -it jenkins-controller cat /var/jenkins_home/secrets/initialAdminPassword