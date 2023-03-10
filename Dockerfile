# onfinality/subql-node:v1.19.0
FROM onfinality/subql-node:latest

WORKDIR /app
COPY . .
RUN  yarn install && yarn codegen && yarn build

# TODO: remove depedences

Entrypoint  ["/sbin/tini","--","/usr/local/lib/node_modules/@subql/node/bin/run"]
