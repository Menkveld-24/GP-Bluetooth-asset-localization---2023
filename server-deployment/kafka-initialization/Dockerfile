FROM node:18-alpine

RUN apk update
RUN mkdir /app
WORKDIR /app

COPY ./package*.json .
RUN npm ci

COPY . .

ENTRYPOINT /usr/local/bin/npm run dev