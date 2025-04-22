#! /usr/bin/env bash

# docker buildx build -t node-url-shortener:local .

docker run --rm -it -p 3000:3000 --network=host --env-file ./app/.env --name nus node-url-shortener:local