FROM node:latest

WORKDIR /builds/logotype/fixparser

COPY package.json .

RUN npm ci

