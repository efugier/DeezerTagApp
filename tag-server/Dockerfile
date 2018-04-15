FROM node:alpine

WORKDIR usr/src/app/tag-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD ["npm", "start"]
