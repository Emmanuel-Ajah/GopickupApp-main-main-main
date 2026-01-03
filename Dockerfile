FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

# Starting expo in web mode
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
