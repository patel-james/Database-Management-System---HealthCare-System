FROM node:23

WORKDIR /usr/src/app

COPY package*json ./
RUN npm install --production 

COPY . .

EXPOSE 3001
CMD ["node", "server.js"] 
