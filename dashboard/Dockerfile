# This dockerfile is used for building the dashboard image
FROM node:18-alpine as building

RUN apk update
RUN mkdir /temporary
RUN mkdir /temporary/frontend
RUN mkdir /temporary/backend
WORKDIR /temporary/frontend

# Install app dependencies
COPY ./frontend/package*.json ./
RUN npm ci

COPY ./frontend .
ENV VITE_MAPBOX_TOKEN=${MAPBOX_TOKEN}
RUN npm run build

# Building the backend
WORKDIR /temporary/backend
COPY ./backend/package*.json ./
RUN npm ci

COPY ./backend .
RUN npm run build



FROM node:18-alpine as prod

RUN mkdir /app
WORKDIR /app

COPY --from=building /temporary/backend /app
RUN mkdir ./dist/public
COPY --from=building /temporary/frontend/dist /app/public

# the npm entrypoint to start running npm run prod
ENTRYPOINT /usr/local/bin/npm run prod