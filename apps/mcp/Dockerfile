FROM node:20-alpine

WORKDIR /tmp

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
