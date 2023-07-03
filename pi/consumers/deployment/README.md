# PI consumers deployment

## Deploying
Pull this repository on the raspberry pi and modify the `docker-compose.yml` file to add replicas of the consumer and location consumer. When replicating consumers, make sure to create a new config file that has a unique `process_id`. 