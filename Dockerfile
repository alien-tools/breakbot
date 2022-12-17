FROM node:18-slim
ENV NODE_ENV=production

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci --production
COPY . .
EXPOSE 3000

CMD [ "npm", "start" ]
