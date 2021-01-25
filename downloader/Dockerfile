FROM node:15.6.0-alpine3.12

RUN set -xe \
    && apk add --no-cache ca-certificates ffmpeg openssl python3 aria2 py3-pip \
    && pip3 install youtube-dl

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production --frozen-lockfile

COPY index.js .

CMD node index.js