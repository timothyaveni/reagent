# Reagent


- copy .env.example to .env and create a secret
- cd gen-websocket-keys and ./gen.sh
- docker compose up
- dev-utils/prisma-remix.sh db push
- dev-utils/prisma-remix.sh db seed


minio bucket setup not yet automated
```
docker compose exec minio mc anonymous set-json /minio-cfg/noggin-run-outputs-read-policy.json s3/noggin-run-outputs
```


