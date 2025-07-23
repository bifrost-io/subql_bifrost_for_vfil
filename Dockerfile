FROM node:22 as builder

WORKDIR /app
COPY . ./

RUN yarn
RUN yarn codegen
RUN yarn build

FROM onfinality/subql-node:latest

COPY --from=builder /app/ /app/

