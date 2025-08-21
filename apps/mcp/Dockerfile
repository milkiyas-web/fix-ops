FROM node:20-alpine

WORKDIR /temp

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
