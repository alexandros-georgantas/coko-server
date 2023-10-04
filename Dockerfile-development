FROM node:18-bullseye

RUN apt-get update \ 
    && apt-get upgrade -y \
    && apt-get install -y ranger vim imagemagick ghostscript potrace

RUN sed -i.bak 's/rights="none" pattern="PS"/rights="read | write" pattern="PS"/g' /etc/ImageMagick-6/policy.xml
RUN sed -i.bak 's/rights="none" pattern="EPS"/rights="read | write" pattern="EPS"/g' /etc/ImageMagick-6/policy.xml

WORKDIR /home/node/app

COPY package.json .
COPY yarn.lock .

RUN chown -R node:node .
USER node

RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
