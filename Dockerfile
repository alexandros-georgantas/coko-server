FROM node:20

RUN apt-get update \ 
    && apt-get upgrade -y \
    && apt-get install -y ranger vim

WORKDIR /home/node/app

COPY package.json .
COPY yarn.lock .

RUN chown -R node:node .
USER node

RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
