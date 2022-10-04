# Express GraphQL Template

- Run the Docker containers

```
yarn install
yarn prepare
docker-compose up --build --force-recreate --renew-anon-volumes
```

- Setup `.env` file with dev database credentials and cluster URL

## Deployment

- Use serverless CLI and set prod database username and password so that TypeORM will get appropriate permissions

```
serverless deploy --verbose --dbuser ${DB_USERNAME} --password ${DB_PASSWORD} --stage ${STAGE}
```
